'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

import { 
  Save, 
  Eye, 
  Calendar, 
  Tag, 
  Image, 
  ArrowLeft, 
  Clock,
  FileText,
  Settings,
  Search,
  X,
  Plus
} from 'lucide-react';

import { supabase } from '@/lib/client';
import { toast } from 'sonner';
import { Category } from '@/lib/types';

interface FormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  category: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduled_at: string;
  is_featured: boolean;
}

export default function BlogEditor() {
  const router = useRouter();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    category: '',
    tags: [],
    meta_title: '',
    meta_description: '',
    status: 'draft',
    scheduled_at: '',
    is_featured: false,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tagInput, setTagInput] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchCategories();
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  // Debounced slug availability check
  useEffect(() => {
    if (!formData.slug || isEditing) return;
    
    const checkSlug = async () => {
      setCheckingSlug(true);
      const { data } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', formData.slug)
        .single();
      
      setIsSlugAvailable(!data);
      setCheckingSlug(false);
    };

    const timeoutId = setTimeout(checkSlug, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.slug, isEditing]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    setUser(user);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('blog_categories').select('*').order('name');
    setCategories(data || []);
  };

  const fetchPost = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Error fetching post');
      return;
    }

    setFormData({
      title: data.title || '',
      slug: data.slug || '',
      content: data.content || '',
      excerpt: data.excerpt || '',
      featured_image_url: data.featured_image_url || '',
      category: data.category || '',
      tags: data.tags || [],
      meta_title: data.meta_title || '',
      meta_description: data.meta_description || '',
      status: (data.status as FormData['status']) || 'draft',
      scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : '',
      is_featured: data.is_featured || false,
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      ...((!slugManuallyEdited || !prev.slug) && { slug: generateSlug(title) }),
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(slug),
    }));
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
        setTagInput('');
      }
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (!formData.slug.trim()) {
      toast.error('URL slug is required');
      return false;
    }
    if (!formData.content.trim()) {
      toast.error('Content is required');
      return false;
    }
    if (!isEditing && isSlugAvailable === false) {
      toast.error('This URL slug is already taken');
      return false;
    }
    return true;
  };

  const handleSave = async (status: FormData['status']) => {
    if (!user || !validateForm()) return;

    setLoading(true);
    try {
      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt || null,
        featured_image_url: formData.featured_image_url || null,
        category: formData.category || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        status,
        is_featured: formData.is_featured,
        author_id: user.id,
        updated_at: new Date().toISOString(),
        ...(status === 'published' && !isEditing && { published_at: new Date().toISOString() }),
        ...(status === 'scheduled' && formData.scheduled_at && {
          scheduled_at: new Date(formData.scheduled_at).toISOString(),
        }),
      };

      let result;
      if (isEditing) {
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('blog_posts')
          .insert(postData)
          .select()
          .single();
      }

      if (result.error) {
        toast.error('Error saving post: ' + result.error.message);
        return;
      }

      const statusMessages = {
        draft: 'saved as draft',
        published: 'published',
        scheduled: 'scheduled'
      };

      toast.success(`Post ${statusMessages[status]} successfully!`);

      if (!isEditing) {
        router.push(`/blog/editor/${result.data.id}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/blog')}
              className="text-white hover:bg-white/10 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {isEditing ? 'Edit Post' : 'New Post'}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={`${getStatusColor(formData.status)} text-white`}>
                  {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                </Badge>
                {formData.is_featured && (
                  <Badge className="bg-yellow-500 text-black">Featured</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => handleSave('draft')}
              disabled={loading}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading && formData.status !== 'draft' ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              onClick={() => handleSave('published')}
              disabled={loading || (!isEditing && isSlugAvailable === false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              {loading && formData.status === 'published' ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Label htmlFor="title" className="text-white mb-2 block font-medium">
                <FileText className="w-4 h-4 inline mr-2" />
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter an engaging post title..."
                className="bg-white/20 border-white/30 text-white placeholder-white/60 text-xl font-semibold h-12"
              />
            </div>

            {/* Slug */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Label htmlFor="slug" className="text-white mb-2 block font-medium">
                URL Slug
              </Label>
              <div className="relative">
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="url-friendly-slug"
                  className="bg-white/20 border-white/30 text-white placeholder-white/60"
                />
                {checkingSlug && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-white/60 text-sm">
                  URL: /blog/{formData.slug}
                </p>
                {!isEditing && formData.slug && (
                  <p className={`text-sm ${isSlugAvailable === true ? 'text-green-400' : isSlugAvailable === false ? 'text-red-400' : 'text-white/60'}`}>
                    {isSlugAvailable === true ? '✓ Available' : isSlugAvailable === false ? '✗ Already taken' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Label htmlFor="content" className="text-white mb-2 block font-medium">
                Content
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write your post content here... You can use Markdown formatting."
                className="bg-white/20 border-white/30 text-white placeholder-white/60 min-h-96 font-mono text-sm"
              />
              <p className="text-white/60 text-xs mt-2">
                Characters: {formData.content.length} | Words: {formData.content.split(/\s+/).filter(word => word.length > 0).length}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Post Settings */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Post Settings
              </h3>
              
              {/* Excerpt */}
              <div className="mb-4">
                <Label htmlFor="excerpt" className="text-white mb-2 block">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description for previews and SEO..."
                  className="bg-white/20 border-white/30 text-white placeholder-white/60 h-20 text-sm"
                />
                <p className="text-white/60 text-xs mt-1">
                  {formData.excerpt.length}/160 characters
                </p>
              </div>

              {/* Featured Image */}
              <div className="mb-4">
                <Label htmlFor="featured_image" className="text-white mb-2 block flex items-center">
                  <Image className="w-4 h-4 mr-1" />
                  Featured Image URL
                </Label>
                <Input
                  id="featured_image"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featured_image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="bg-white/20 border-white/30 text-white placeholder-white/60"
                />
                {formData.featured_image_url && (
                  <div className="mt-2">
                    <img 
                      src={formData.featured_image_url} 
                      alt="Featured image preview" 
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNjRMMTIwIDQ0TDE4MCA4NEwxODAgMTA0SDE4MEgyMEgyMFY4NEw4MCA0NEwxMDAgNjRaIiBmaWxsPSIjRDFENUQ4Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjUwIiByPSIxMCIgZmlsbD0iI0QxRDVEOCIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="mb-4">
                <Label htmlFor="category" className="text-white mb-2 block">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-white/20 border border-white/30 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" className="bg-purple-800">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name} className="bg-purple-800">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <Label htmlFor="tags" className="text-white mb-2 block flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  Tags
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-500 text-white flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer hover:bg-white/20 rounded"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyPress}
                    placeholder="Add a tag..."
                    className="bg-white/20 border-white/30 text-white placeholder-white/60 flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (tagInput.trim()) {
                        addTag(tagInput);
                        setTagInput('');
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-white/60 text-xs mt-1">Press Enter or comma to add tags</p>
              </div>

              {/* Featured Toggle */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="text-white">Featured Post</Label>
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_featured: checked }))}
                  />
                </div>
                <p className="text-white/60 text-xs mt-1">Featured posts appear prominently on the blog</p>
              </div>

              {/* Schedule */}
              <div>
                <Label htmlFor="scheduled_at" className="text-white mb-2 block flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Schedule Publication
                </Label>
                <input
                  type="datetime-local"
                  id="scheduled_at"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_at: e.target.value }))}
                  className="w-full bg-white/20 border border-white/30 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.scheduled_at && (
                  <Button
                    onClick={() => handleSave('scheduled')}
                    disabled={loading}
                    className="w-full mt-2 bg-blue-500 hover:bg-blue-600"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Schedule Post
                  </Button>
                )}
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Search className="w-4 h-4 mr-2" />
                SEO Settings
              </h3>
              
              <div className="mb-4">
                <Label htmlFor="meta_title" className="text-white mb-2 block">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meta_title: e.target.value }))}
                  placeholder={formData.title || "SEO title..."}
                  className="bg-white/20 border-white/30 text-white placeholder-white/60"
                />
                <p className="text-white/60 text-xs mt-1">
                  {formData.meta_title.length}/60 characters
                </p>
              </div>
              
              <div>
                <Label htmlFor="meta_description" className="text-white mb-2 block">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                  placeholder={formData.excerpt || "SEO description..."}
                  className="bg-white/20 border-white/30 text-white placeholder-white/60 h-20 text-sm"
                />
                <p className="text-white/60 text-xs mt-1">
                  {formData.meta_description.length}/160 characters
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}