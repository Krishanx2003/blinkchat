export type BlogPost = {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  featured_image_url?: string;
  published_at: string;
  created_at?: string;
  updated_at?: string;
  category?: string;
  tags?: string[];
  view_count?: number;
  is_featured?: boolean;
  status?: 'draft' | 'published' | 'scheduled';
  meta_title?: string;
  meta_description?: string;
};

export type Category = {
  id: string | number;
  name: string;
  slug: string;
};

export type PopularPost = {
  id: string | number;
  slug: string;
  title: string;
  view_count: number;
};

export type RelatedPost = {
  id: string | number;
  slug: string;
  title: string;
  excerpt?: string;
  featured_image_url?: string;
  published_at: string;
  category?: string;
  tags?: string[];
  view_count?: number;
};
