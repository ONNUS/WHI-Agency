/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { initialPosts } from './data/seedData';
import { BlogPost } from './types';
import BlogHub from './components/BlogHub';
import UnpuzzledCaseStudy from './components/UnpuzzledCaseStudy';
import BlogEditor from './components/BlogEditor';
import { BookOpen, Settings, Library, Sparkles, Code, ArrowRight } from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [viewMode, setViewMode] = useState<'hub' | 'cms'>('hub');

  // Load and persist posts in localStorage for sandboxed persistence
  useEffect(() => {
    const saved = localStorage.getItem('whi_blog_posts');
    if (saved) {
      try {
        let loadedPosts = JSON.parse(saved) as BlogPost[];
        // Auto-correct Google Drive links or empty images for the Unpuzzled success case study
        loadedPosts = loadedPosts.map(p => {
          if (p.id === 'unpuzzled-aba-success') {
            const isGoogleDriveLink = p.image && (
              p.image.includes('drive.google.com') || 
              p.image.includes('docs.google.com') || 
              p.image.includes('1TW0rpOBFc0AjoFd2aaGN43BV-aOlvEMQ')
            );
            if (!p.image || isGoogleDriveLink) {
              return {
                ...p,
                image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800'
              };
            }
          }
          return p;
        });
        setPosts(loadedPosts);
        localStorage.setItem('whi_blog_posts', JSON.stringify(loadedPosts));
      } catch (err) {
        setPosts(initialPosts);
      }
    } else {
      setPosts(initialPosts);
      localStorage.setItem('whi_blog_posts', JSON.stringify(initialPosts));
    }
  }, []);

  const savePost = (updatedPost: BlogPost) => {
    const exists = posts.some(p => p.id === updatedPost.id);
    let newPosts: BlogPost[];
    
    if (exists) {
      newPosts = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
    } else {
      newPosts = [updatedPost, ...posts];
    }
    
    setPosts(newPosts);
    localStorage.setItem('whi_blog_posts', JSON.stringify(newPosts));
    
    // Update selected post state if active
    if (selectedPost && selectedPost.id === updatedPost.id) {
      setSelectedPost(updatedPost);
    }
  };

  const deletePost = (id: string) => {
    const newPosts = posts.filter(p => p.id !== id);
    setPosts(newPosts);
    localStorage.setItem('whi_blog_posts', JSON.stringify(newPosts));
    if (selectedPost?.id === id) {
      setSelectedPost(null);
    }
  };

  // Switch tabs
  const handleTabChange = (mode: 'hub' | 'cms') => {
    setViewMode(mode);
    setSelectedPost(null); // Return to list view
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-red-200">
      
      {/* Dynamic Upper Announcement Ribbon */}
      <div className="bg-slate-950 text-gray-300 text-xs py-2 px-4 border-b border-slate-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>METRIC CHANNELS OPERATIONAL: May 2026</span>
          </div>
          <p className="hidden md:block font-mono text-gray-300">CLIENT PORTAL: PERSISTENT SANDBOX INTEGRATED</p>
        </div>
      </div>

      {/* Main Brand Executive Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo and Pitch Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('hub')}>
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xl tracking-tighter">
              W
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 font-sans">
                  WHI <span className="text-red-600 font-mono text-sm uppercase">Agency</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 uppercase">
                  Blog & CMS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                We Have Ideas &bull; Growth Roadmaps & Bullseye Audits
              </p>
            </div>
          </div>

          {/* Navigation Action Hub Toggles */}
          <div className="flex items-center gap-2">
            
            <button
              onClick={() => handleTabChange('hub')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-extrabold tracking-wide uppercase transition-all flex items-center gap-1.5 border ${
                viewMode === 'hub' && !selectedPost
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              id="tab-btn-insights"
            >
              <Library className="w-4 h-4" />
              <span>Insights & Cases</span>
            </button>

            <button
              onClick={() => handleTabChange('cms')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-extrabold tracking-wide uppercase transition-all flex items-center gap-1.5 border ${
                viewMode === 'cms'
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:hover:bg-slate-50'
              }`}
              id="tab-btn-cms"
            >
              <Settings className="w-4 h-4" />
              <span>Blog CMS Editor</span>
            </button>

          </div>

        </div>
      </header>

      {/* Main View Area Routing state */}
      <main>
        {selectedPost ? (
          /* Render full Case study or full post representation */
          selectedPost.id === 'unpuzzled-aba-success' ? (
            <UnpuzzledCaseStudy 
              post={selectedPost} 
              onBack={() => setSelectedPost(null)} 
            />
          ) : (
            <div className="bg-slate-50 min-h-screen text-slate-800 pb-16">
              {/* Back breadcrumb bar */}
              <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    <span>&larr; Back to Listings</span>
                  </button>
                  <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 rounded text-slate-600 uppercase border">
                    {selectedPost.category}
                  </span>
                </div>
              </div>

              {/* Standard Post Hero */}
              <div className="bg-slate-900 text-white py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                  <span className="text-xs text-red-500 font-mono tracking-widest uppercase block mb-3 font-semibold">
                    {selectedPost.type === 'case-study' ? 'System Briefing' : 'Insight Analysis'}
                  </span>
                  
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
                    {selectedPost.title}
                  </h1>

                  <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 border-t border-slate-800 pt-6">
                    <div className="flex items-center gap-2">
                      <img src={selectedPost.author.avatar} alt={selectedPost.author.name} className="w-8 h-8 rounded-full referrerPolicy='no-referrer'" />
                      <span className="text-white font-bold">{selectedPost.author.name}</span>
                    </div>
                    <span>•</span>
                    <span>{selectedPost.publishDate}</span>
                    <span>•</span>
                    <span>{selectedPost.readTime}</span>
                  </div>
                </div>
              </div>

              {/* Standard Article Content */}
              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                <div className="prose max-w-none prose-slate bg-white p-8 md:p-12 border border-slate-200 rounded-xl shadow-xs">
                  {/* Simplistic clean markdown text rendering */}
                  <div className="space-y-6 text-slate-700 leading-relaxed text-sm md:text-base whitespace-pre-line">
                    {selectedPost.content}
                  </div>
                </div>

                <div className="mt-8 text-center bg-slate-100 p-6 rounded-lg border border-slate-200">
                  <h5 className="font-bold text-slate-900 text-sm mb-1">Interactive Sandbox Feedback</h5>
                  <p className="text-slate-500 text-xs max-w-md mx-auto">This thought article can be modified inside the CMS. Try toggling values or deleting posts to clear storage rosters.</p>
                </div>
              </div>
            </div>
          )
        ) : viewMode === 'hub' ? (
          /* Render Blog Search, Filter columns and posts grid */
          <BlogHub 
            posts={posts} 
            onSelectPost={(post) => setSelectedPost(post)} 
          />
        ) : (
          /* Render CMS and editing form */
          <BlogEditor 
            posts={posts} 
            onSavePost={savePost} 
            onDeletePost={deletePost}
            onSetPosts={(newPosts) => {
              setPosts(newPosts);
              localStorage.setItem('whi_blog_posts', JSON.stringify(newPosts));
            }}
            onBackToHub={() => handleTabChange('hub')}
          />
        )}
      </main>

      {/* Corporate Footnotes */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-slate-400 text-xs">
          <div>
            <p className="font-bold text-slate-500 font-mono">WHITE HOUSE INNOVATION AGENCY &bull; MARKETING PORTFOLIO</p>
            <p className="mt-1">All design choices mimic page specs including 10x staff loops, local SEO, and billing systems.</p>
          </div>
          <div className="flex items-center gap-4 mt-2 md:mt-0 font-mono">
            <span>DATABASE: LOCAL STORAGE ACTIVE</span>
            <span>&bull;</span>
            <span>ENGAGEMENT CODE: WHI-DNA-2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
