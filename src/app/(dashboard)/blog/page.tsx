import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, Clock, Tag, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/client';
import type { BlogPost, Category, PopularPost } from '@/lib/types';
import { Suspense } from 'react';

// Function to fetch blog data with pagination
async function fetchBlogData(page: number = 1, postsPerPage: number = 6) {
  try {
    const start = (page - 1) * postsPerPage;
    const end = start + postsPerPage - 1;

    const [recentPostsRes, totalPostsRes, featuredPostsRes, categoriesRes, popularPostsRes] = await Promise.all([
      supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .range(start, end),
      supabase
        .from('blog_posts')
        .select('id', { count: 'exact' })
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString()),
      supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', true)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(3),
      supabase
        .from('blog_categories')
        .select('*')
        .order('name'),
      supabase.rpc('get_popular_blog_posts', { limit_count: 5 }),
    ]);

    return {
      posts: recentPostsRes.data || [],
      totalPosts: totalPostsRes.count || 0,
      featuredPosts: featuredPostsRes.data || [],
      categories: categoriesRes.data || [],
      popularPosts: popularPostsRes.data || [],
    };
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return { posts: [], totalPosts: 0, featuredPosts: [], categories: [], popularPosts: [] };
  }
}

// Pagination component
function Pagination({ currentPage, totalPosts, postsPerPage }: { currentPage: number; totalPosts: number; postsPerPage: number }) {
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      {currentPage > 1 && (
        <Link
          href={`?page=${currentPage - 1}`}
          className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          Previous
        </Link>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={`?page=${page}`}
          className={`px-4 py-2 rounded-lg transition-colors ${
            page === currentPage ? 'bg-primary text-white' : 'bg-secondary text-foreground hover:bg-muted'
          }`}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={`?page=${currentPage + 1}`}
          className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          Next
        </Link>
      )}
    </div>
  );
}

export default async function Blog({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  // Await searchParams to resolve the Promise
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10) || 1;
  const postsPerPage = 6;
  const { posts, totalPosts, featuredPosts, categories, popularPosts } = await fetchBlogData(currentPage, postsPerPage);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">TingleTalk Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Insights, tips, and trends in online communication and digital connections
            </p>
          </div>

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <h2 className="text-3xl font-bold text-foreground">Featured Articles</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredPosts.map((post: BlogPost) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group bg-secondary backdrop-blur-lg rounded-2xl p-6 border border-border hover:bg-muted transition-all duration-300 transform hover:scale-105"
                  >
                    {post.featured_image_url && (
                      <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover rounded-xl mb-4"
                      />
                    )}
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(post.published_at), 'MMM dd, yyyy')}
                      </div>
                      {post.category && (
                        <span className="bg-secondary px-2 py-1 rounded-full text-xs">
                          {post.category}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-foreground mb-6">Recent Posts</h2>
              <div className="space-y-6">
                {posts.map((post: BlogPost) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block bg-secondary backdrop-blur-lg rounded-2xl p-6 border border-border hover:bg-muted transition-all duration-300"
                  >
                    <div className="flex gap-6">
                      {post.featured_image_url && (
                        <div className="flex-shrink-0">
                          <Image
                            src={post.featured_image_url}
                            alt={post.title}
                            width={128}
                            height={96}
                            className="w-32 h-24 object-cover rounded-xl"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {format(new Date(post.published_at), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {post.view_count} views
                          </div>
                          {post.category && (
                            <span className="bg-secondary px-2 py-1 rounded-full text-xs">
                              {post.category}
                            </span>
                          )}
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            <div className="flex gap-1 flex-wrap">
                              {post.tags.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Pagination Controls */}
              <Pagination currentPage={currentPage} totalPosts={totalPosts} postsPerPage={postsPerPage} />
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Categories */}
              <div className="bg-secondary backdrop-blur-lg rounded-2xl p-6 border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category: Category) => (
                    <Link
                      key={category.id}
                      href={`/blog/category/${category.slug}`}
                      className="block text-muted-foreground hover:text-foreground hover:bg-secondary p-2 rounded-lg transition-all"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Popular Posts */}
              {popularPosts.length > 0 && (
                <div className="bg-secondary backdrop-blur-lg rounded-2xl p-6 border border-border">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-5 h-5 text-primary mr-2" />
                    <h3 className="text-xl font-bold text-foreground">Popular Posts</h3>
                  </div>
                  <div className="space-y-3">
                    {popularPosts.map((post: PopularPost) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <h4 className="text-muted-foreground group-hover:text-foreground font-medium text-sm mb-1 line-clamp-2">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {post.view_count} views
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag Cloud */}
              <div className="bg-secondary backdrop-blur-lg rounded-2xl p-6 border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['online chat', 'dating tips', 'privacy', 'strangers', 'conversation', 'digital communication', 'safety', 'relationships'].map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted hover:bg-secondary text-muted-foreground px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Back to App */}
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-secondary hover:bg-muted text-foreground rounded-xl transition-colors"
            >
              ← Back to QuickChat
            </Link>
          </div>
        </div>
      </div>
    </Suspense>
  );
}