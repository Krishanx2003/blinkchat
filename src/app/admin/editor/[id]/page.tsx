'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, X, Image as ImageIcon, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { BlogPost, Category } from '@/lib/types';
import { supabase } from '@/lib/client';

interface FormData extends Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> {
  scheduled_at: string;
  tags: string[];
  published_at: string | null; // Explicitly allow null
}

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
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
    published_at: null,
    is_featured: false,
    view_count: 0,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!id) {
      toast.error('Post ID not found');
      router.push('/admin/allblogs');
      return;
    }

    fetchData();
  }, [id, router]);

  const fetchData = async () => {
    try {
      const [postRes, categoriesRes] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('blog_categories')
          .select('*')
          .order('name')
      ]);

      if (postRes.error) {
        console.error('Error fetching post:', postRes.error);
        toast.error('Failed to load post');
        router.push('/admin/allblogs');
        return;
      }

      if (categoriesRes.error) {
        console.error('Error fetching categories:', categoriesRes.error);
      }

      if (postRes.data) {
        const post = postRes.data;
        setFormData({
          title: post.title || '',
          slug: post.slug || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          featured_image_url: post.featured_image_url || '',
          category: post.category || '',
          tags: Array.isArray(post.tags) ? post.tags : [],
          meta_title: post.meta_title || '',
          meta_description: post.meta_description || '',
          status: post.status || 'draft',
          scheduled_at: post.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : '',
          published_at: post.published_at || null,
          is_featured: post.is_featured || false,
          view_count: post.view_count || 0,
        });
      }

      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load post data');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from title if not manually edited
    if (name === 'title' && !slugManuallyEdited) {
      const slug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    const slug = generateSlug(e.target.value);
    setFormData(prev => ({
      ...prev,
      slug: slug
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ','].includes(e.key)) {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    if (!formData.title?.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (!formData.slug?.trim()) {
      toast.error('Slug is required');
      return false;
    }
    if (!formData.content?.trim()) { // Fixed: Added optional chaining
      toast.error('Content is required');
      return false;
    }
    if (formData.status === 'scheduled' && !formData.scheduled_at) {
      toast.error('Scheduled date is required for scheduled posts');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    
    try {
      const now = new Date().toISOString();
      
      // Create update data with proper typing
      const updateData: Partial<BlogPost> & { 
        updated_at: string;
        published_at?: string | null; // Allow both string and null
        scheduled_at?: string | null;
      } = {
        title: formData.title?.trim() || '',
        slug: formData.slug?.trim() || '',
        content: formData.content?.trim() || '',
        excerpt: formData.excerpt?.trim() || '',
        featured_image_url: formData.featured_image_url?.trim() || '',
        category: formData.category || '',
        tags: formData.tags || [],
        meta_title: formData.meta_title?.trim() || '',
        meta_description: formData.meta_description?.trim() || '',
        status: formData.status,
        scheduled_at: formData.scheduled_at || null,
        is_featured: formData.is_featured || false,
        updated_at: now,
      };

      // Handle published_at logic with proper null handling
      if (formData.status === 'published') {
        if (!formData.published_at) {
          updateData.published_at = now;
        } else {
          updateData.published_at = formData.published_at;
        }
      } else if (formData.status === 'draft') {
        updateData.published_at = null;
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        toast.error(`Failed to update post: ${error.message}`);
        return;
      }
      
      toast.success('Post updated successfully');
      router.push('/admin/allblogs');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (formData.slug) {
      window.open(`/blog/${formData.slug}`, '_blank');
    } else {
      toast.error('Please save the post first to preview');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Blog Post</h1>
            <p className="text-muted-foreground mt-1">
              Update your blog post content and settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handlePreview}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-secondary backdrop-blur-lg rounded-2xl p-6 border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4">Content</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      placeholder="Enter an engaging post title"
                      required
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug || ''}
                      onChange={handleSlugChange}
                      placeholder="post-url-slug"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      URL: /blog/{formData.slug || 'your-post-slug'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt || ''}
                      onChange={handleInputChange}
                      placeholder="A compelling excerpt that will appear in post previews..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content || ''}
                      onChange={handleInputChange}
                      placeholder="Write your blog post content here..."
                      rows={15}
                      required
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-secondary backdrop-blur-lg rounded-2xl p-6 border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4">SEO Settings</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      name="meta_title"
                      value={formData.meta_title || ''}
                      onChange={handleInputChange}
                      placeholder="SEO-optimized title for search engines"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                      {(formData.meta_title || '').length}/60 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      name="meta_description"
                      value={formData.meta_description || ''}
                      onChange={handleInputChange}
                      placeholder="Description that will appear in search engine results"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground">
                      {(formData.meta_description || '').length}/160 characters
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publishing Options */}
              <div className="bg-secondary backdrop-blur-lg rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Publishing</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>

                  {formData.status === 'scheduled' && (
                    <div className="space-y-2">
                      <Label htmlFor="scheduled_at">Schedule Date & Time</Label>
                      <Input
                        id="scheduled_at"
                        type="datetime-local"
                        name="scheduled_at"
                        value={formData.scheduled_at || ''}
                        onChange={handleInputChange}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_featured">Featured Post</Label>
                    <input
                      id="is_featured"
                      type="checkbox"
                      checked={formData.is_featured || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        is_featured: e.target.checked
                      }))}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Updating...' : 'Update Post'}
                </Button>
              </div>

              {/* Featured Image */}
              <div className="bg-secondary backdrop-blur-lg rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Featured Image</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      id="featured_image_url"
                      name="featured_image_url"
                      value={formData.featured_image_url || ''}
                      onChange={(e) => {
                        handleInputChange(e);
                        setImageError(false);
                      }}
                      placeholder="https://example.com/image.jpg"
                    />
                    <Button type="button" variant="outline" size="icon">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.featured_image_url && !imageError && (
                    <div className="relative">
                      <img 
                        src={formData.featured_image_url} 
                        alt="Featured image preview" 
                        className="w-full h-32 object-cover rounded-lg"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  )}
                  
                  {imageError && (
                    <p className="text-sm text-destructive">
                      Failed to load image. Please check the URL.
                    </p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="bg-secondary backdrop-blur-lg rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Category</h3>
                
                <select
                  id="category"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="bg-secondary backdrop-blur-lg rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Tags</h3>
                
                <div className="space-y-3">
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge 
                          key={`${tag}-${index}`} 
                          variant="secondary" 
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                            aria-label={`Remove ${tag} tag`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Input
                      id="tag-input"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Add tags..."
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addTag}
                      disabled={!tagInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Press Enter or comma to add tags
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}