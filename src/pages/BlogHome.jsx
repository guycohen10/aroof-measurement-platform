import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { blogPosts } from '../data/blogPosts';

export default function BlogHome() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl("Homepage")} className="text-blue-600 mb-4 inline-block">← Back to Home</Link>
        
        <h1 className="text-5xl font-bold mb-4">Roofing Blog</h1>
        <p className="text-xl text-gray-600 mb-8">Expert advice for Texas homeowners</p>

        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-2xl p-4 border rounded-lg mb-8"
        />

        <div className="grid md:grid-cols-3 gap-6">
          {blogPosts.map(post => (
            <Link
              key={post.id}
              to={createPageUrl(`BlogPost?slug=${post.slug}`)}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <span className="text-sm text-blue-600 font-semibold">{post.category}</span>
              <h3 className="text-2xl font-bold mt-2 mb-3">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="text-sm text-gray-500">
                {post.readTime} • {new Date(post.date).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}