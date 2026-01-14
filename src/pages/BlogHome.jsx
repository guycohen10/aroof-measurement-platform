import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { blogPosts } from '../components/data/blogPosts';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Home, ArrowRight, Calendar, Clock } from 'lucide-react';

export default function BlogHome() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Material Guides', 'Maintenance', 'Buying Guides', 'Climate & Weather'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts.find(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured);

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
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("Homepage")} className="text-blue-200 hover:text-white mb-4 inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Roofing Blog</h1>
          <p className="text-2xl text-blue-100 max-w-3xl">
            Expert advice for Texas homeowners - material guides, maintenance tips, and buying strategies
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <Link to={createPageUrl(`BlogPost?slug=${featuredPost.slug}`)} className="block mb-12">
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-blue-200">
              <div className="md:flex">
                <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white flex items-center justify-center">
                  <div className="text-center">
                    <Badge className="bg-yellow-400 text-yellow-900 mb-4">Featured Article</Badge>
                    <h2 className="text-4xl font-bold mb-4">{featuredPost.title}</h2>
                    <p className="text-blue-100 text-lg mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-blue-200">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8 bg-white flex items-center">
                  <div>
                    <Badge className={getCategoryColor(featuredPost.category) + ' mb-3'}>
                      {featuredPost.category}
                    </Badge>
                    <p className="text-gray-700 text-lg leading-relaxed mb-6">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">By {featuredPost.author}</span>
                      <span className="text-blue-600 font-semibold flex items-center gap-2">
                        Read Full Article
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Regular Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post) => (
            <Link
              key={post.id}
              to={createPageUrl(`BlogPost?slug=${post.slug}`)}
              className="group"
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
                <CardContent className="p-6">
                  <Badge className={getCategoryColor(post.category) + ' mb-3'}>
                    {post.category}
                  </Badge>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-600">{post.author}</span>
                    <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                      Read More
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-xl">No articles found matching your search.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="mt-4 text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get instant roof measurements and pricing estimates - completely FREE
          </p>
          <Link
            to={createPageUrl("AddressMethodSelector")}
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            Measure My Roof - FREE
          </Link>
          <p className="text-sm text-blue-200 mt-4">
            Instant satellite measurement • $3 for detailed PDF report
          </p>
        </div>
      </div>
    </div>
  );
}