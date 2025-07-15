export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string | null;
  published_at: string;
  category: string | null;
  tags: string[] | null;
  view_count: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface PopularPost {
  id: string;
  title: string;
  slug: string;
  view_count: number;
}

export interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string;
}
