import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Check, 
  FileText, 
  FolderPlus, 
  Save, 
  Undo, 
  Sparkles,
  Layers, 
  AlertTriangle, 
  Star,
  Settings,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { BlogPost, SolutionItem, Vulnerability, MetricItem, QuoteItem } from '../types';

interface BlogEditorProps {
  posts: BlogPost[];
  onSavePost: (post: BlogPost) => void;
  onDeletePost: (id: string) => void;
  onSetPosts: (posts: BlogPost[]) => void;
  onBackToHub: () => void;
}

export default function BlogEditor({ posts, onSavePost, onDeletePost, onSetPosts, onBackToHub }: BlogEditorProps) {
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'general' | 'content' | 'casestudy'>('general');

  // Input states for form
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState(''); // Comma separated
  const [type, setType] = useState<'case-study' | 'article'>('article');
  const [readTime, setReadTime] = useState('5 min read');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  // Author details
  const [authorName, setAuthorName] = useState('Editor in Chief');
  const [authorRole, setAuthorRole] = useState('Senior Growth strategist');
  const [authorAvatar, setAuthorAvatar] = useState('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120');

  // Case study specifics
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [profile, setProfile] = useState('');
  
  // Custom arrays
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([
    { title: 'PE Competition pressure', desc: 'Over-saturation from heavily funded corporate competitors.' }
  ]);
  const [solutions, setSolutions] = useState<SolutionItem[]>([
    { num: '01', title: 'Operational Audit Alignment', desc: 'Transitioning clinical workflows onto integrated automatic trackers.', highlights: ['Staff performance trackers'] }
  ]);
  const [results, setResults] = useState<MetricItem[]>([
    { value: '3X', label: 'Inbound Growth velocity', desc: 'Doubling weekly targeted inquiries.' }
  ]);

  // Load selected post into form states
  const startEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreating(false);
    setActiveFormTab('general');

    setTitle(post.title);
    setSubtitle(post.subtitle || '');
    setExcerpt(post.excerpt);
    setContent(post.content);
    setCategory(post.category);
    setTagsInput(post.tags.join(', '));
    setType(post.type);
    setReadTime(post.readTime);
    setImageUrl(post.image);
    setFeatured(!!post.featured);
    setPublished(post.published);

    setAuthorName(post.author.name);
    setAuthorRole(post.author.role);
    setAuthorAvatar(post.author.avatar || '');

    if (post.type === 'case-study') {
      setIndustry(post.clientInfo?.industry || '');
      setLocation(post.clientInfo?.location || '');
      setProfile(post.clientInfo?.profile || '');
      setVulnerabilities(post.criticalVulnerabilities || []);
      setSolutions(post.solutions || []);
      setResults(post.results || []);
    } else {
      setIndustry('');
      setLocation('');
      setProfile('');
      setVulnerabilities([]);
      setSolutions([]);
      setResults([]);
    }
  };

  const startCreate = () => {
    setEditingPost(null);
    setIsCreating(true);
    setActiveFormTab('general');

    // Reset fields to defaults
    setTitle('');
    setSubtitle('');
    setExcerpt('');
    setContent('');
    setCategory('Operations Plan');
    setTagsInput('Automation, Roadmap, Efficiency');
    setType('article');
    setReadTime('4 min read');
    setImageUrl('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800');
    setFeatured(false);
    setPublished(true);

    setAuthorName('WHI Growth Team');
    setAuthorRole('Lead Strategist');
    setAuthorAvatar('https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=120');

    setIndustry('Retail Logistics');
    setLocation('Atlanta, GA');
    setProfile('Boutique Operations Setup');
    setVulnerabilities([
      { title: 'Siloed Technology', desc: 'Using 5 different disconnected spreadsheets to manage patient rosters.' }
    ]);
    setSolutions([
      { num: '01', title: 'Automated CRM Sync', desc: 'Implementing web-triggers to record registrations directly into clinical schedules.', highlights: ['Eliminated manual double logs', 'Reduces lag from days to minutes'] }
    ]);
    setResults([
      { value: '4X', label: 'Onboarding Efficiency Increase', desc: 'Time saved on clinical paperwork processing.' }
    ]);
  };

  // Helper to load templates to test easily
  const fillDemoTemplate = (mode: 'case-study' | 'article') => {
    if (mode === 'case-study') {
      setTitle('How WHI scaled Apex Pediatric Dental from 2 to 7 locations in under 20 months');
      setSubtitle('A modern regional map-pack audit and reputation engine implementation directive.');
      setExcerpt('Dismantling national consolidator advantages by launching local authority reviews, automated billing connectors, and pediatric care channels.');
      setCategory('Dental Growth');
      setType('case-study');
      setTagsInput('Dental, Scale, Google Maps SEO, Automated Billing');
      setContent(`### Multi-Location Pediatric Scaling Systems

National dental aggregators use immense brand budgets to dominate paid query search pools. To win, our client Apex Pediatric combined localized clinic maps density with direct automated text-review triggers.

#### Key Outcomes:
* Automated customer check-outs now dispatch Review prompts instantly.
* Real-time ledger sync prevents billing lags.
* Inter-site patient database resolves location scheduling mismatches.`);
      setIndustry('Healthcare, Pediatric Care');
      setLocation('Fulton County, GA');
      setProfile('Multi-Clinic Family Dental Network');
      setVulnerabilities([
        { title: 'Fragmented Patient Maps', desc: 'Google local search nodes pointing to wrong clinic phones.' },
        { title: 'Lagging Claims Processing', desc: 'Manual insurance filing delayed for weeks inside accounting desks.' }
      ]);
      setSolutions([
        { num: '01', title: 'Maps API Normalization & Authority SEO', desc: 'Verified and optimized local citations across Google Maps network.', highlights: ['Google Maps review boost', 'Standardized phone rails'] },
        { num: '02', title: 'Instant Claims Transmittal Adapters', desc: 'Installed auto-dispatch insurance claiming adapters on the reception terminals.', highlights: ['Bypassed manual submissions', 'Claims cash flow speed increased'] }
      ]);
      setResults([
        { value: '7X', label: 'Active Location Footprints', desc: 'Regional branch sites fully operational.' },
        { value: '62%', label: 'Inbound booking speed improvement', desc: 'Appointments requested natively from maps citations.' }
      ]);
    } else {
      setTitle('The SaaS Security Conundrum: Protecting Patient Lifecycles Without Friction');
      setExcerpt('Clinical software must process and protect personal health files. But complex logins cause healthcare workers to bypass security protocols. Here is a secure, simple design strategy.');
      setCategory('Operational Compliance');
      setType('article');
      setTagsInput('Compliance, SaaS Design, Cybersecurity, Pediatric Health');
      setContent(`### Designing Healthcare Interfaces

When authentication processes require 10 steps, clinicians write credentials on paper post-it notes placed on monitors. This is an immediate liability.

#### Safe & Low Friction Rules:
1. **Biometric Session Keys**: Integrate safe local physical thumb sensors directly into terminals.
2. **Contextual Role Permissions**: Show technicians only active treatment records for their specific scheduled patients, hiding peripheral logs.`);
    }
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) return;

    const savedPost: BlogPost = {
      id: editingPost ? editingPost.id : `post-${Date.now()}`,
      type,
      title,
      subtitle: subtitle || undefined,
      excerpt,
      content,
      category,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      readTime,
      publishDate: editingPost ? editingPost.publishDate : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      published,
      featured,
      author: {
        name: authorName,
        role: authorRole,
        avatar: authorAvatar
      },
      image: imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    };

    if (type === 'case-study') {
      savedPost.clientInfo = {
        industry,
        location,
        profile
      };
      savedPost.criticalVulnerabilities = vulnerabilities;
      savedPost.solutions = solutions;
      savedPost.results = results;
      savedPost.quotes = editingPost?.quotes || [
        {
          text: `"Partnering with the WHI team redefined our business trajectory. Excellent execution at every milestone."`,
          author: `${location} Managing Director`,
          role: 'Founding Equity Partner'
        }
      ];
    }

    onSavePost(savedPost);
    setIsCreating(false);
    setEditingPost(null);
  };

  const deleteConfirmation = (id: string, postTitle: string) => {
    if (confirm(`Are you sure you want to delete the publication "${postTitle}"?`)) {
      onDeletePost(id);
      if (editingPost?.id === id) {
        setEditingPost(null);
      }
    }
  };

  // Helper arrays update functions
  const addVuln = () => {
    setVulnerabilities([...vulnerabilities, { title: 'New Vulnerability', desc: 'Details of the risk element detected.' }]);
  };
  const removeVuln = (index: number) => {
    setVulnerabilities(vulnerabilities.filter((_, i) => i !== index));
  };
  const updateVuln = (index: number, field: 'title' | 'desc', val: string) => {
    const updated = [...vulnerabilities];
    updated[index][field] = val;
    setVulnerabilities(updated);
  };

  const addSol = () => {
    const nextNum = `0${solutions.length + 1}`;
    setSolutions([...solutions, { num: nextNum, title: 'New Playbook Pillar', desc: 'Strategy and execution methods used.', highlights: ['Outcome Item'] }]);
  };
  const removeSol = (index: number) => {
    setSolutions(solutions.filter((_, i) => i !== index));
  };
  const updateSol = (index: number, field: 'title' | 'desc', val: string) => {
    const updated = [...solutions];
    updated[index][field] = val;
    setSolutions(updated);
  };

  const addMetric = () => {
    setResults([...results, { value: '2X', label: 'Metric Outcome', desc: 'How performance was improved.' }]);
  };
  const removeMetric = (index: number) => {
    setResults(results.filter((_, i) => i !== index));
  };
  const updateMetric = (index: number, field: 'value' | 'label' | 'desc', val: string) => {
    const updated = [...results];
    updated[index][field] = val;
    setResults(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="cms-editor-panel">
      
      {/* CMS Header Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 block flex items-center gap-1.5 font-bold">
            <Settings className="w-3.5 h-3.5" />
            Integrative CMS Panel
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            WHI Intelligence & Editorial Manager
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Author custom case studies, edit metadata, pre-populate sandbox templates, and toggle published status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-mono font-bold hover:bg-slate-50 transition"
          >
            Review Blog Hub
          </button>
          
          <button
            onClick={startCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wide transition flex items-center gap-1.5 shadow-sm"
            id="btn-create-new-article"
          >
            <Plus className="w-4 h-4" />
            <span>Create Publication</span>
          </button>
        </div>
      </div>

      {/* Main CMS Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Managed List Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase font-mono text-slate-600">Active Publications ({posts.length})</span>
              <span className="text-[10px] font-mono font-medium text-slate-400">Sandbox Database</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {posts.map((post) => {
                const isActive = editingPost?.id === post.id;
                return (
                  <div 
                    key={post.id}
                    className={`p-4 transition-colors flex flex-col justify-between hover:bg-slate-50 cursor-pointer ${
                      isActive ? 'bg-indigo-50/70 border-l-4 border-indigo-600 pl-3' : ''
                    }`}
                    onClick={() => startEdit(post)}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-sm ${
                          post.type === 'case-study' 
                            ? 'bg-red-50 text-red-700 border border-red-100' 
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {post.type === 'case-study' ? 'Case Study' : 'Whitepaper'}
                        </span>

                        <div className="flex items-center gap-2">
                          {post.featured && (
                            <span className="text-amber-500" title="Featured Spotlight">
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                            </span>
                          )}
                          <span className={`w-1.5 h-1.5 rounded-full ${post.published ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-400">
                            {post.published ? 'Live' : 'Draft'}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug mb-2">
                        {post.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-1 leading-normal mb-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/60 mt-2">
                      <span className="text-[10px] text-slate-500 font-mono">{post.publishDate}</span>
                      
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => startEdit(post)}
                          className="p-1.5 rounded text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit Document"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteConfirmation(post.id, post.title)}
                          className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                          id={`btn-delete-${post.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-4">
            <h4 className="font-bold font-mono text-xs text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>CMS Quick Integration</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This interactive widget demonstrates an integrated Content Manager. In a production site, edits here would route back to a Sanity.io, Strapi, or headless CMS webhook pipelines. 
            </p>
            <div className="pt-2">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Interactive Actions:</span>
              <button
                onClick={() => {
                  if (confirm("Reset case studies back to original mock portfolio?")) {
                    localStorage.removeItem('whi_blog_posts');
                    window.location.reload();
                  }
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-1.5 px-3 rounded text-xs font-mono mt-2 transition-all"
              >
                Reset Database to Seed Default
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Form Editor Column (8 cols) */}
        <div className="lg:col-span-8">
          
          {editingPost || isCreating ? (
            <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              
              {/* Form header */}
              <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-red-500 uppercase block font-bold">
                    {isCreating ? 'PUBLICATION BLUEPRINT CREATION' : 'EDIT MOUNTED PUBLICATION'}
                  </span>
                  <h3 className="text-lg font-bold">
                    {isCreating ? 'Design New Asset Portfolio Entry' : `Editing: ${editingPost?.title}`}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPost(null);
                      setIsCreating(false);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Template loader bar */}
              <div className="bg-indigo-50 border-b border-indigo-100/60 p-3 px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-indigo-800 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sandbox Quick Assist:</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoTemplate('case-study')}
                    className="bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded font-bold"
                  >
                    Fill Case Study
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoTemplate('article')}
                    className="bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded font-bold"
                  >
                    Fill Insight Article
                  </button>
                </div>
              </div>

              {/* Form Tabs Trigger */}
              <div className="flex border-b border-slate-200 bg-slate-50">
                {[
                  { id: 'general', label: 'Primary Details' },
                  { id: 'content', label: 'Editorial Content' },
                  { id: 'casestudy', label: 'Case Study Parameters', disabled: type !== 'case-study' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    disabled={t.disabled}
                    onClick={() => setActiveFormTab(t.id as any)}
                    className={`px-5 py-3 text-xs font-mono font-bold tracking-wider transition-all border-b-2 ${
                      t.disabled 
                        ? 'opacity-30 cursor-not-allowed text-slate-400 border-transparent' 
                        : activeFormTab === t.id 
                          ? 'border-indigo-600 text-indigo-600 bg-white' 
                          : 'border-transparent text-slate-500 hover:text-slate-900 bg-slate-50/50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Form Fields Panels */}
              <div className="p-6 md:p-8 space-y-6">
                
                {/* General Information Panel */}
                {activeFormTab === 'general' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold font-mono uppercase text-slate-600 mb-2">Publication Form/Nature</label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={`border p-4 rounded-lg flex items-center justify-between cursor-pointer transition ${
                          type === 'article' ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200'
                        }`}>
                          <div className="flex items-start gap-2">
                            <input 
                              type="radio" 
                              name="pub_type" 
                              checked={type === 'article'} 
                              onChange={() => setType('article')} 
                              className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <span className="block font-bold text-xs">Strategic Article</span>
                              <span className="text-[10px] text-slate-400">Thought pieces, market analysis reports.</span>
                            </div>
                          </div>
                        </label>

                        <label className={`border p-4 rounded-lg flex items-center justify-between cursor-pointer transition ${
                          type === 'case-study' ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}>
                          <div className="flex items-start gap-2">
                            <input 
                              type="radio" 
                              name="pub_type" 
                              checked={type === 'case-study'} 
                              onChange={() => setType('case-study')} 
                              className="mt-0.5 text-red-600 focus:ring-red-500"
                            />
                            <div>
                              <span className="block font-bold text-xs text-slate-900">Case Study (High fidelity)</span>
                              <span className="text-[10px] text-slate-400">Faceted clinical review (e.g., Unpuzzled).</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold font-mono uppercase text-slate-600 mb-1.5">Asset Title</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. How WHI accelerated outreach margins..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        id="pub-title"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold font-mono uppercase text-slate-600 mb-1.5">Subtitle (Optional)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. From legacy structural vulnerabilities to 3-phase growth."
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold font-mono uppercase text-slate-600 mb-1.5">Abstract Excerpt</label>
                      <textarea
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 h-20"
                        placeholder="Provide a concise 2-sentence summary outlining what was accomplished..."
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold font-mono uppercase text-slate-600 mb-1.5">Category Domain</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Dental Growth, SaaS Revenue"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold font-mono uppercase text-slate-600 mb-1.5">Tags (Comma separated)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        placeholder="SGE, Maps SEO, Recruiting, Audits"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold font-mono uppercase text-slate-600 mb-1.5">Read Duration / Time</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. 5 min read"
                        value={readTime}
                        onChange={(e) => setReadTime(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold font-mono uppercase text-slate-600 mb-1.5">Hero Cover Image URL</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://images.unsplash.com/..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2 pt-4 border-t border-slate-100 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="check_published"
                          checked={published}
                          onChange={(e) => setPublished(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        />
                        <label htmlFor="check_published" className="text-xs font-bold uppercase font-mono text-slate-700 cursor-pointer select-none">
                          Publish Immediately
                        </label>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="check_featured"
                          checked={featured}
                          onChange={(e) => setFeatured(e.target.checked)}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-slate-300 rounded"
                        />
                        <label htmlFor="check_featured" className="text-xs font-bold uppercase font-mono text-slate-700 cursor-pointer select-none flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>Spotlight Feature</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Article Content MD */}
                {activeFormTab === 'content' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">STRATEGIC NARRATIVE WORKPLACE</span>
                      <label className="block text-xs font-bold font-mono uppercase text-slate-600 mb-2">Editorial Article Content (Markdown supported)</label>
                      <textarea
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 h-96 font-mono leading-relaxed"
                        placeholder="### Executive Analysis&#10;&#10;Use markdown syntax to construct detailed strategic assessments..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>
                    
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-500 leading-relaxed font-sans">
                      💡 Tip: Use normal header weights like <code className="bg-slate-100 p-0.5 rounded px-1 text-red-600">### H3</code> and standard lists to divide strategic sections. Keep readability high.
                    </div>
                  </div>
                )}

                {/* Case Study facets */}
                {activeFormTab === 'casestudy' && (
                  <div className="space-y-8">
                    
                    {/* Client Info Grid */}
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-3 pb-2 border-b border-slate-200">
                        <span className="text-xs text-red-600 font-bold uppercase font-mono">Client Demographics</span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold font-mono uppercase text-slate-600 mb-1">Client Industry</label>
                        <input
                          type="text"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-hidden"
                          placeholder="Healthcare, Dental Care"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold font-mono uppercase text-slate-600 mb-1">Client Location</label>
                        <input
                          type="text"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-hidden"
                          placeholder="Fulton County, GA"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold font-mono uppercase text-slate-600 mb-1">Corporate Profile</label>
                        <input
                          type="text"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-hidden"
                          placeholder="Boutique Multi-chain clinic"
                          value={profile}
                          onChange={(e) => setProfile(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Critical Vulnerabilities Segment */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs text-slate-700 font-bold font-mono uppercase flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>Pre-Engagement Vulnerabilities</span>
                        </span>
                        
                        <button
                          type="button"
                          onClick={addVuln}
                          className="text-[10px] font-mono text-indigo-600 hover:text-indigo-800 font-bold"
                        >
                          + Add Vulnerability
                        </button>
                      </div>

                      <div className="space-y-3">
                        {vulnerabilities.map((v, i) => (
                          <div key={i} className="p-4 bg-white border border-slate-200 rounded-md relative group flex flex-col md:flex-row gap-4">
                            <button
                              type="button"
                              onClick={() => removeVuln(i)}
                              className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            <div className="w-full md:w-1/3">
                              <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Vulnerability Title</label>
                              <input
                                type="text"
                                className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:border-indigo-500 focus:outline-hidden"
                                value={v.title}
                                onChange={(e) => updateVuln(i, 'title', e.target.value)}
                              />
                            </div>
                            
                            <div className="w-full md:w-2/3">
                              <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Vulnerability Description</label>
                              <input
                                type="text"
                                className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:border-indigo-500 focus:outline-hidden"
                                value={v.desc}
                                onChange={(e) => updateVuln(i, 'desc', e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Solutions Segment */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs text-slate-700 font-bold font-mono uppercase flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-indigo-500" />
                          <span>Strategic Solutions Deployed</span>
                        </span>
                        
                        <button
                          type="button"
                          onClick={addSol}
                          className="text-[10px] font-mono text-indigo-600 hover:text-indigo-800 font-bold"
                        >
                          + Add Solution Pillar
                        </button>
                      </div>

                      <div className="space-y-4">
                        {solutions.map((s, i) => (
                          <div key={i} className="p-4 bg-white border border-slate-200 rounded-md relative flex flex-col gap-3">
                            <button
                              type="button"
                              onClick={() => removeSol(i)}
                              className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                              <div className="md:col-span-2">
                                <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Num</label>
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-hidden text-center font-mono font-bold"
                                  value={s.num}
                                  onChange={(e) => {
                                    const updated = [...solutions];
                                    updated[i].num = e.target.value;
                                    setSolutions(updated);
                                  }}
                                />
                              </div>

                              <div className="md:col-span-10">
                                <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Solution Title</label>
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-hidden font-bold"
                                  value={s.title}
                                  onChange={(e) => updateSol(i, 'title', e.target.value)}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1 font-sans">Strategic Description</label>
                              <textarea
                                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-hidden h-16"
                                value={s.desc}
                                onChange={(e) => updateSol(i, 'desc', e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Results / Stats Segment */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs text-slate-700 font-bold font-mono uppercase flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Performance Results Metrics</span>
                        </span>
                        
                        <button
                          type="button"
                          onClick={addMetric}
                          className="text-[10px] font-mono text-indigo-600 hover:text-indigo-800 font-bold"
                        >
                          + Add Metric Block
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {results.map((r, i) => (
                          <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded relative space-y-2">
                            <button
                              type="button"
                              onClick={() => removeMetric(i)}
                              className="absolute top-1.5 right-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>

                            <div>
                              <label className="block text-[9px] font-mono text-slate-400 uppercase">Stat Value (bold)</label>
                              <input
                                type="text"
                                className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-hidden font-bold font-mono text-red-600"
                                value={r.value}
                                onChange={(e) => updateMetric(i, 'value', e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-slate-400 uppercase">Stat Label</label>
                              <input
                                type="text"
                                className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-hidden font-semibold"
                                value={r.label}
                                onChange={(e) => updateMetric(i, 'label', e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-slate-400 uppercase">Impact Summary</label>
                              <textarea
                                className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-hidden h-12"
                                value={r.desc}
                                onChange={(e) => updateMetric(i, 'desc', e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Form Actions Footer block */}
              <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPost(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:text-slate-900 bg-white"
                >
                  Cancel edits
                </button>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-xs font-mono font-bold tracking-wider hover:shadow-xs transition-all flex items-center gap-1.5"
                  id="btn-save-post"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Publication</span>
                </button>
              </div>

            </form>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-16 text-center space-y-4">
              <FileSpreadsheet className="w-16 h-16 text-slate-300 mx-auto" />
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">No Document Selected for Editing</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Select an active case study or thought article from the list dynamically loaded on the left sidebar to start altering values, or build your own custom client-briefing using the generator.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={startCreate}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-all shadow-sm"
                  id="btn-cms-create-placeholder"
                >
                  Create New Publication Draft
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
