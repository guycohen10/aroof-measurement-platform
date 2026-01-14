import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { blogPosts } from '../components/data/blogPosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Calendar, Clock, ArrowLeft, User } from 'lucide-react';

export default function BlogPost() {
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

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

    const related = blogPosts
      .filter(p => p.category === foundPost.category && p.id !== foundPost.id)
      .slice(0, 3);
    setRelatedPosts(related);

    window.scrollTo(0, 0);
  }, [navigate]);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading article...</p>
      </div>
    );
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Material Guides': 'bg-blue-100 text-blue-800',
      'Maintenance': 'bg-green-100 text-green-800',
      'Buying Guides': 'bg-purple-100 text-purple-800',
      'Climate & Weather': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 text-sm">
            <Link to={createPageUrl("Homepage")} className="text-gray-600 hover:text-blue-600">
              <Home className="w-5 h-5" />
            </Link>
            <span className="text-gray-400">/</span>
            <Link to={createPageUrl("BlogHome")} className="text-gray-600 hover:text-blue-600 font-medium">
              Blog
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate">{post.category}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Link
              to={createPageUrl("BlogHome")}
              className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>

            <article className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <Badge className={getCategoryColor(post.category) + ' mb-4'}>
                {post.category}
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
              </div>

              <div 
                className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-ul:my-6 prose-li:text-gray-700 prose-li:mb-2 prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.id}
                      to={createPageUrl(`BlogPost?slug=${related.slug}`)}
                      className="group"
                    >
                      <Card className="h-full hover:shadow-lg transition-all">
                        <CardContent className="p-5">
                          <Badge className={getCategoryColor(related.category) + ' mb-2 text-xs'}>
                            {related.category}
                          </Badge>
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 line-clamp-2">
                            {related.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {related.excerpt}
                          </p>
                          <span className="text-blue-600 text-sm font-semibold group-hover:underline">
                            Read More →
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Box */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-6 shadow-xl sticky top-24">
              <h3 className="text-2xl font-bold mb-4">Get Your Roof Measured</h3>
              <p className="mb-6 text-green-100">
                Instant satellite measurements for FREE
              </p>
              <Link
                to={createPageUrl("AddressMethodSelector")}
                className="block w-full bg-white text-green-600 text-center py-3 rounded-lg font-bold hover:bg-green-50 transition-colors"
              >
                Measure Now - FREE
              </Link>
              <p className="text-xs text-green-200 mt-3 text-center">
                Download detailed PDF for just $3
              </p>
            </div>

            {/* Categories */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['Material Guides', 'Maintenance', 'Buying Guides', 'Climate & Weather'].map((category) => {
                  const count = blogPosts.filter(p => p.category === category).length;
                  return (
                    <Link
                      key={category}
                      to={createPageUrl("BlogHome")}
                      onClick={() => window.scrollTo(0, 0)}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{category}</span>
                        <Badge variant="outline" className="text-xs">{count}</Badge>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}