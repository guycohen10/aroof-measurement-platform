import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { blogPosts } from '../data/blogPosts';

export default function BlogPost() {
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
      navigate(createPageUrl('BlogHome'));
      return;
    }

    const foundPost = blogPosts.find(p => p.slug === slug);
    if (!foundPost) {
      navigate(createPageUrl('BlogHome'));
      return;
    }

    setPost(foundPost);
    window.scrollTo(0, 0);
  }, [navigate]);

  if (!post) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to={createPageUrl("BlogHome")} className="text-blue-600 mb-6 inline-block">
          ← Back to Blog
        </Link>

        <article className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <span className="text-blue-600 font-semibold text-sm">{post.category}</span>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 my-4">
            {post.title}
          </h1>

          <div className="flex gap-4 text-gray-600 mb-8 pb-6 border-b">
            <span>{post.author}</span>
            <span>•</span>
            <span>{new Date(post.date).toLocaleDateString()}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <div className="mt-8 bg-blue-600 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Get Your Roof Measured - FREE</h3>
          <Link
            to={createPageUrl("AddressMethodSelector")}
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50"
          >
            Measure Now
          </Link>
        </div>
      </div>
    </div>
  );
}