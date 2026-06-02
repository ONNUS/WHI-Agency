import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Clock, Tag, ArrowRight, Star, FileText, Check } from 'lucide-react';
import { BlogPost } from '../types';
import { getGoogleDriveDirectLink } from '../utils';

interface BlogHubProps {
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
}

export default function BlogHub({ posts, onSelectPost }: BlogHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'case-study' | 'article'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Dynamically extract all categories and tags from published posts
  const categories = useMemo(() => {
    const list = new Set<string>();
    posts.forEach(p => {
      if (p.published) list.add(p.category);
    });
    return ['all', ...Array.from(list)];
  }, [posts]);

  const tags = useMemo(() => {
    const list = new Set<string>();
    posts.forEach(p => {
      if (p.published && p.tags) {
        p.tags.forEach(t => list.add(t));
      }
    });
    return ['all', ...Array.from(list)];
  }, [posts]);

  // Filter strategy
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (!post.published) return false;
      
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === 'all' ? true : post.type === selectedType;
      const matchesCategory = selectedCategory === 'all' ? true : post.category === selectedCategory;
      const matchesTag = selectedTag === 'all' ? true : post.tags.includes(selectedTag);

      return matchesSearch && matchesType && matchesCategory && matchesTag;
    });
  }, [posts, searchQuery, selectedType, selectedCategory, selectedTag]);

  // Separate featured post (always preferring the unpuzzled one if first loaded)
  const featuredPost = useMemo(() => {
    return posts.find(p => p.published && p.featured) || posts.find(p => p.published);
  }, [posts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Search and Navigation Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
            Insights & Intelligence
          </h1>
          <p className="text-slate-600 mt-2 text-base md:text-lg leading-relaxed">
            Custom diagnostic reviews, marketing framework reports, and strategic action plans from We Have Ideas (WHI).
          </p>
        </div>
        
        {/* Search Input Box */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900 shadow-xs"
            placeholder="Search titles, tags, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search-blog-posts"
          />
        </div>
      </div>

      {/* Featured Block */}
      {featuredPost && !searchQuery && selectedType === 'all' && selectedCategory === 'all' && selectedTag === 'all' && (
        <div className="mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-red-600 block mb-4 flex items-center gap-1.5 font-bold">
            <Star className="w-3.5 h-3.5 fill-red-600 text-red-600" />
            Spotlight Strategic Case Analysis
          </span>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 grid grid-cols-1 lg:grid-cols-12">
            <div className="p-8 md:p-12 lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs uppercase font-mono bg-slate-900 text-white px-3 py-1.5 rounded tracking-wider">
                    {featuredPost.category}
                  </span>
                  <span className="text-slate-500 text-xs font-mono flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4 hover:text-red-600 cursor-pointer transition-colors"
                  onClick={() => onSelectPost(featuredPost)}
                >
                  {featuredPost.title}
                </h2>
                
                <p className="text-slate-600 leading-relaxed text-base md:text-lg mb-6">
                  {featuredPost.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2.5 mb-8">
                  {featuredPost.tags.map((tag, i) => (
                    <span key={i} className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded transition-all">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author and Action Button */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                  <img src={featuredPost.author.avatar} alt={featuredPost.author.name} className="w-10 h-10 rounded-full referrerPolicy='no-referrer'" />
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{featuredPost.author.name}</span>
                    <span className="text-xs text-slate-500 font-mono block">{featuredPost.author.role}</span>
                  </div>
                </div>

                <button 
                  onClick={() => onSelectPost(featuredPost)}
                  className="flex items-center gap-2 text-xs md:text-sm font-mono tracking-widest uppercase font-bold text-red-600 hover:text-red-700 transition"
                >
                  <span>Deconstruct Blueprint</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feature Post Image Hero card */}
            <div className="lg:col-span-5 bg-slate-950 relative min-h-[300px] lg:min-h-full">
              <img 
                src={getGoogleDriveDirectLink(featuredPost.image)} 
                alt={featuredPost.title} 
                className="absolute inset-0 w-full h-full object-cover opacity-80"
                referrerPolicy='no-referrer'
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black via-transparent to-transparent opacity-80" />
              
              {/* Overlay elements matching Unpuzzled Center PDF */}
              <div className="absolute bottom-6 left-6 right-6 bg-slate-950/90 p-5 rounded-lg border border-slate-800 backdrop-blur-xs">
                <span className="text-xs uppercase tracking-widest font-mono text-red-500 block mb-1">AUDIT BRIEF</span>
                <span className="font-bold text-white text-base block">10X Patient Volume Expansion</span>
                <span className="text-xs text-slate-400 font-mono">Verified Atlanta Implementation Matrix</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs and Filtering Rails */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filters Rail */}
        <div className="space-y-6 lg:sticky lg:top-20 h-fit">
          
          {/* Post Type Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="font-bold font-mono uppercase text-xs md:text-sm text-slate-500 tracking-wider">Publication Type</h3>
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'all', label: 'All Publications', count: posts.filter(p => p.published).length },
                { id: 'case-study', label: 'Case Studies & Roadmaps', count: posts.filter(p => p.published && p.type === 'case-study').length },
                { id: 'article', label: 'Strategic Articles', count: posts.filter(p => p.published && p.type === 'article').length }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedType(opt.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                    selectedType === opt.id 
                      ? 'bg-slate-900 text-white' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    selectedType === opt.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                  }`}>{opt.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="font-bold font-mono uppercase text-xs md:text-sm text-slate-500 tracking-wider">Core Domain</h3>
            <div className="flex flex-col gap-1.5">
              {categories.map(cat => {
                const isSelected = selectedCategory === cat;
                const count = posts.filter(p => p.published && (cat === 'all' || p.category === cat)).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'font-bold text-slate-900 border-l-2 border-red-600 pl-2 bg-slate-50' 
                        : 'text-slate-600 hover:text-slate-900 hover:pl-1'
                    }`}
                  >
                    <span className="capitalize">{cat === 'all' ? 'All Domains' : cat}</span>
                    <span className="text-xs font-mono opacity-50">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags cloud */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="font-bold font-mono uppercase text-xs md:text-sm text-slate-500 tracking-wider">Dynamic Tag Search</h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map(tag => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`text-xs md:text-sm px-3 py-1.5 rounded-sm border transition-colors ${
                      isSelected 
                        ? 'bg-red-600 border-red-600 text-white font-bold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {tag === 'all' ? 'show all' : `#${tag}`}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Posts Grid Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Active Filter summary if filters selection are active */}
          {(searchQuery || selectedType !== 'all' || selectedCategory !== 'all' || selectedTag !== 'all') && (
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-700 font-mono">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Active Filters:</span>
                {selectedType !== 'all' && <span className="bg-white px-2 py-0.5 border rounded">Type: {selectedType}</span>}
                {selectedCategory !== 'all' && <span className="bg-white px-2 py-0.5 border rounded">Domain: {selectedCategory}</span>}
                {selectedTag !== 'all' && <span className="bg-white px-2 py-0.5 border rounded">Tag: #{selectedTag}</span>}
                {searchQuery && <span className="bg-white px-2 py-0.5 border rounded">Search: "{searchQuery}"</span>}
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                  setSelectedTag('all');
                }}
                className="text-[10px] uppercase font-mono tracking-widest font-bold text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
          )}

          {filteredPosts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="font-bold text-slate-900 mb-1">No intelligence reports found</p>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">Try refining your search text or sorting parameters above to unlock documents.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                  id={`post-card-${post.id}`}
                >
                  <div>
                    {/* Visual Card Banner */}
                    <div className="h-44 bg-slate-900 relative overflow-hidden">
                      <img 
                        src={getGoogleDriveDirectLink(post.image)} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy='no-referrer'
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <span className="absolute top-3 left-3 text-[10px] font-mono bg-slate-950/90 text-white py-1 px-2 rounded-sm border border-slate-800 uppercase tracking-wider">
                        {post.type === 'case-study' ? 'Case Study' : 'Whitepaper'}
                      </span>
                      
                      <span className="absolute bottom-3 left-3 text-white text-xs font-semibold">
                        {post.category}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mb-3">
                        <span>{post.publishDate}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>

                      <h3 
                        onClick={() => onSelectPost(post)}
                        className="text-xl font-bold text-slate-900 tracking-tight leading-snug mb-3 group-hover:text-red-500 transition-colors cursor-pointer"
                      >
                        {post.title}
                      </h3>

                      <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom / Author */}
                  <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full referrerPolicy='no-referrer'" />
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">{post.author.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">{post.author.role}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onSelectPost(post)}
                      className="text-slate-900 text-sm font-mono font-bold group-hover:text-red-600 transition flex items-center gap-1.5"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prompt/CTAs at bottom of results */}
          <div className="bg-slate-100 rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <h4 className="font-bold text-slate-900 text-base mb-1.5">Looking for a specific, unpublished case study?</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-4 leading-relaxed">You can use our integrated Content Management Panel (CMS) to write new case study blueprints, edit metadata parameters, and publish drafts immediately.</p>
            <span className="text-xs font-mono text-slate-500">Click "Blog CMS Editor" in the main navigation above to begin.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
