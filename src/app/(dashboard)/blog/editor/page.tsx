'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';


import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import { Save, Eye, Calendar, Tag, Image, ArrowLeft } from 'lucide-react';

import { supabase } from '@/lib/client';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Category } from '@/lib/types';

interface FormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  category: string;
  tags: string;
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
    tags: '',
    meta_title: '',
    meta_description: '',
    status: 'draft',
    scheduled_at: '',
    is_featured: false,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchCategories();
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

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
      tags: data.tags?.join(', ') || '',
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
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleSave = async (status: FormData['status']) => {
    if (!user) return;

    setLoading(true);
    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        featured_image_url: formData.featured_image_url || null,
        category: formData.category || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
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

      toast.success(`Post ${status === 'draft' ? 'saved as draft' : status === 'published' ? 'published' : 'scheduled'} successfully!`);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/blog')}
              className="text-foreground hover:bg-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => handleSave('draft')}
              disabled={loading}
              variant="outline"
              className="bg-secondary border-border text-foreground hover:bg-muted"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave('published')}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Eye className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Label htmlFor="title" className="text-white mb-2 block">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter post title..."
                className="bg-white/20 border-white/30 text-white placeholder-white/60 text-xl font-semibold"
              />
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Label htmlFor="slug" className="text-white mb-2 block">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="url-friendly-slug"
                className="bg-white/20 border-white/30 text-white placeholder-white/60"
              />
              <p className="text-white/60 text-sm mt-1">
                URL will be: /blog/{formData.slug}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Label htmlFor="content" className="text-white mb-2 block">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write your post content here..."
                className="bg-white/20 border-white/30 text-white placeholder-white/60 min-h-96"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4">Post Settings</h3>
              <div className="mb-4">
                <Label htmlFor="excerpt" className="text-white mb-2 block">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description..."
                  className="bg-white/20 border-white/30 text-white placeholder-white/60 h-20"
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="featured_image" className="text-white mb-2 block flex items-center">
                  <Image className="w-4 h-4 mr-1" />
                  Featured Image URL
                </Label>
                <Input
                  id="featured_image"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featured_image_url: e.target.value }))}
                  placeholder="https://..."
                  className="bg-white/20 border-white/30 text-white placeholder-white/60"
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="category" className="text-white mb-2 block">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-white/20 border border-white/30 text-white rounded-md px-3 py-2"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name} className="bg-purple-800">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <Label htmlFor="tags" className="text-white mb-2 block flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                  className="bg-white/20 border-white/30 text-white placeholder-white/60"
                />
                <p className="text-white/60 text-xs mt-1">Separate with commas</p>
              </div>
              <div className="mb-4">
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                    className="mr-2"
                  />
                  Featured Post
                </label>
              </div>
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
                  className="w-full bg-white/20 border border-white/30 text-white rounded-md px-3 py-2"
                />
                {formData.scheduled_at && (
                  <Button
                    onClick={() => handleSave('scheduled')}
                    disabled={loading}
                    className="w-full mt-2 bg-blue-500 hover:bg-blue-600"
                  >
                    Schedule Post
                  </Button>
                )}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4">SEO Settings</h3>
              <div className="mb-4">
                <Label htmlFor="meta_title" className="text-white mb-2 block">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="SEO title..."
                  className="bg-white/20 border-white/30 text-white placeholder-white/60"
                />
              </div>
              <div>
                <Label htmlFor="meta_description" className="text-white mb-2 block">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO description..."
                  className="bg-white/20 border-white/30 text-white placeholder-white/60 h-20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}