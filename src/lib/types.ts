export type BlogPost = {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  featured_image_url?: string;
  published_at: string;
  category?: string;
  tags?: string[];
  view_count?: number;
  is_featured?: boolean;
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
