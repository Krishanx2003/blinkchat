
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, Clock, Tag, Share2, ArrowLeft } from 'lucide-react';

import { notFound } from 'next/navigation';
import { supabase } from '@/lib/client';
import { toast } from 'sonner';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from 'react';
import { RelatedPost } from '@/lib/types';

async function fetchPost(slug: string) {
  try {
    const { data: postData, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .single();

    if (error || !postData) {
      return { post: null, relatedPosts: [] };
    }

    await supabase.rpc('increment_blog_post_views', { post_id: postData.id });

    const { data: related } = await supabase.rpc('get_related_blog_posts', {
      post_id: postData.id,
      limit_count: 3,
    });

    return { post: postData, relatedPosts: related || [] };
  } catch (error) {
    console.error('Error:', error);
    return { post: null, relatedPosts: [] };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { post } = await fetchPost(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { post, relatedPosts } = await fetchPost(slug);

  if (!post) {
    notFound();
  }

  async function handleShare(platform: string) {
    'use server';
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${post.slug}`;
    const title = post.title;

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        return toast.success('Link copied to clipboard!');
    }

    if (shareUrl) {
      // Note: window.open not available in Server Component; handled client-side or via redirect
      return { shareUrl };
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            {post.featured_image_url && (
              <Image
                src={post.featured_image_url}
                alt={post.title}
                width={896}
                height={384}
                className="w-full h-64 md:h-96 object-cover rounded-2xl mb-6"
              />
            )}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-xl text-white/80 mb-6">{post.excerpt}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-white/60">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(post.published_at), 'MMMM dd, yyyy')}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.view_count} views
                </div>
                {post.category && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {post.category}
                  </span>
                )}
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <Tag className="w-4 h-4 text-white/40" />
                  <div className="flex gap-2 flex-wrap">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="text-sm text-white/70 bg-white/20 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-white/60 mr-2" />
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors" disabled>
                  Twitter
                </button>
                <button className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded text-sm transition-colors" disabled>
                  Facebook
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors" disabled>
                  LinkedIn
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm transition-colors" disabled>
                  Copy Link
                </button>
              </div>
            </div>
          </header>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <div
              className="prose prose-lg prose-invert max-w-none text-white/90"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
            />
          </div>

          {relatedPosts.length > 0 && (
            <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Related Posts</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost: RelatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group block bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-all"
                  >
                    <h3 className="text-lg font-semibold text-white group-hover:text-yellow-300 mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-white/70 text-sm mb-3 line-clamp-3">
                      {relatedPost.excerpt}
                    </p>
                    <div className="text-xs text-white/60">
                      {format(new Date(relatedPost.published_at), 'MMM dd, yyyy')}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
  );
}