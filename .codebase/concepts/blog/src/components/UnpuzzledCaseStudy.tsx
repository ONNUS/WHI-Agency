import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Users, 
  Layers, 
  ArrowLeft,
  Share2,
  Bookmark,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { BlogPost } from '../types';
import { getGoogleDriveDirectLink } from '../utils';

interface UnpuzzledCaseStudyProps {
  post: BlogPost;
  onBack: () => void;
}

export default function UnpuzzledCaseStudy({ post, onBack }: UnpuzzledCaseStudyProps) {
  const [activePhase, setActivePhase] = useState<number>(0);
  const [activeSolution, setActiveSolution] = useState<number>(0);
  const [logoError, setLogoError] = useState(false);

  // Growth Roadmap Phase Details
  const phases = [
    {
      num: 1,
      title: "Phase 1: Foundation Building",
      color: "border-red-500 text-red-600 bg-red-50/50",
      items: [
        { title: "BCBA Recruitment & Branding", desc: "Hiring qualified clinical leadership while establishing a mission-driven brand identity." },
        { title: "Digital Infrastructure", desc: "Optimizing website SEO and social media channels to ensure immediate local community visibility." },
        { title: "Medical Partnership Outreach", desc: "Initiating referral-based relationships with regional pediatricians and diagnostic hubs." }
      ]
    },
    {
      num: 2,
      title: "Phase 2: Client Acquisition",
      color: "border-amber-500 text-amber-600 bg-amber-50/50",
      items: [
        { title: "Targeted Marketing Campaigns", desc: "Launching localized intent-based digital ads and hosting parents seminar pods." },
        { title: "RBT Workforce Scaling", desc: "Establishing fast, secure onboarding scripts to match support technicians with child count." },
        { title: "Social Proof & Referrals", desc: "Gathering pristine client ratings of safety and clinic atmosphere to drive local reviews." }
      ]
    },
    {
      num: 3,
      title: "Phase 3: Expansion & Club Launch",
      color: "border-emerald-500 text-emerald-600 bg-emerald-50/50",
      items: [
        { title: "The Unpuzzled Club Ecosystem", desc: "Launching custom membership portals, sibling clubs, and parent therapy circles." },
        { title: "Educational Content Library", desc: "Establishing an authoritative clinical podcast and syndicating parenting guidebooks." },
        { title: "Sustained Growth Systems", desc: "Developing regional multi-site templates and secondary market pipeline funnels." }
      ]
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16">
      {/* Editorial Navigation breadcrumb / Action bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            id="btn-back-to-hub"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Case Studies</span>
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 rounded text-slate-600 border border-slate-200 uppercase">
              Client Briefing
            </span>
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero / Header Panel showing the actual "UNPUZZLED" brand identity style from the PDF */}
      <div className="bg-black text-white py-12 px-4 shadow-xl border-b border-slate-900 overflow-hidden relative">
        {/* Ambient Dark Blended Post Cover Image Background */}
        {post.image && (
          <div className="absolute inset-0 z-0">
            <img 
              src={getGoogleDriveDirectLink(post.image)} 
              alt={post.title} 
              className="w-full h-full object-cover opacity-15"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />
          </div>
        )}
        <div className="absolute inset-0 bg-radial-at-t from-slate-900 via-black to-black opacity-90 z-0" />
        
        {/* Decorative Grid Lines to match a tech consultancy vibe */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 z-0" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          {/* Custom logo representing the "UNPUZZLED" Brand identity loaded from Google Drive */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center mb-6"
          >
            {logoError ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-600 rounded-xl p-2 relative flex items-center justify-center shadow-lg border border-red-500">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
                    {/* Custom interlocking Puzzle U shape */}
                    <path d="M 25,20 L 25,60 C 25,75 35,85 50,85 C 65,85 75,75 75,60 L 75,20 L 58,20 L 58,60 C 58,65 54,69 50,69 C 46,69 42,65 42,60 L 42,20 L 25,20 Z" />
                    {/* Puzzle peg on side */}
                    <circle cx="50" cy="18" r="8" />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-[0.4em] text-red-600 font-mono mt-2">UNPUZZLED</span>
              </div>
            ) : (
              <div className="flex flex-col items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800 backdrop-blur-xs">
                <img 
                  src="https://docs.google.com/uc?export=view&id=175lRpH57sElHUTpphstCzUuVvBS3KXXG" 
                  alt="Unpuzzled Logo" 
                  className="h-24 md:h-28 object-contain"
                  onError={() => setLogoError(true)}
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </motion.div>

          {/* Title */}
          <div className="max-w-3xl">
            <span className="text-xs md:text-sm text-amber-500 font-mono tracking-widest uppercase block mb-3 font-bold">Case Study Briefing</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
              How WHI helped Unpuzzled ABA Center stand out in a sea of Atlanta PE-owned ABA businesses and not only successfully survive, but scale.
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed font-sans max-w-2xl mx-auto">
              This is a comprehensive and strategic intelligence briefing. We applied our proprietary <span className="text-red-400 font-mono">WHI DNA™</span> framework to analyze the company’s internal capabilities, the highly competitive local ABA ecosystem, and the strategic roadmap designed to enhance business operations.
            </p>
          </div>

          {/* Quick Stats Grid representing metadata from Page 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mt-10 text-left border-y border-slate-800 py-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-amber-500 mt-0.5">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs md:text-sm font-mono uppercase text-amber-500 font-bold">INDUSTRY</span>
                <span className="text-slate-200 font-semibold text-sm md:text-base">{post.clientInfo?.industry || 'Healthcare, ABA/ASD'}</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 border-t sm:border-t-0 sm:border-x border-slate-800 pt-4 sm:pt-0 sm:px-6">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-amber-500 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs md:text-sm font-mono uppercase text-amber-500 font-bold">LOCATION</span>
                <span className="text-slate-200 font-semibold text-sm md:text-base">{post.clientInfo?.location || 'Atlanta'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 sm:pl-6">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-amber-500 mt-0.5">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs md:text-sm font-mono uppercase text-amber-500 font-bold">CLIENT PROFILE</span>
                <span className="text-slate-200 font-semibold text-sm md:text-base">{post.clientInfo?.profile || 'Children’s Behavior Boutique Clinic'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Layout Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left/Main Column (Case Study Flow) */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Main Case Study Cover Image */}
          {post.image && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-2 overflow-hidden shadow-xs hover:shadow-md transition-all"
            >
              <img 
                src={getGoogleDriveDirectLink(post.image)} 
                alt="Case Study Featured Cover" 
                className="w-full h-auto max-h-[480px] object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
              <div className="p-3 text-center border-t border-slate-100 bg-slate-50/50 rounded-b-lg flex flex-col md:flex-row items-center justify-between gap-2">
                <span className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-widest font-black">
                  📷 CMS COVER IMAGE LOADED SECURELY
                </span>
                <span className="text-[10px] md:text-xs font-mono text-slate-400">
                  {post.title}
                </span>
              </div>
            </motion.div>
          )}
          
          {/* Executive Founder Quote */}
          <section className="bg-amber-50/50 border-l-4 border-amber-500 p-8 rounded-r-lg relative overflow-hidden shadow-xs">
            <span className="absolute top-2 right-4 text-7xl font-serif text-amber-200/50 select-none">”</span>
            <blockquote className="relative z-10 text-xl font-serif text-amber-900 leading-relaxed italic">
              {post.quotes?.[0]?.text || '"Partnering with WHI Agency transformed how we connect with local families. Because of the foundation we built during the DNA process, we\'ve been able to reach and enroll more children..."'}
            </blockquote>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm md:text-base">{post.quotes?.[0]?.author || 'Tonette Murphy'}</p>
                <p className="text-slate-600 text-xs md:text-sm font-mono">{post.quotes?.[0]?.role || 'Unpuzzled ABA founder'}</p>
              </div>
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
          </section>

          {/* Interactive Section: Unpuzzled Growth Roadmap diagram */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-red-500 font-mono uppercase tracking-wider">Operational Infographic</span>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">Interactive Growth Roadmap</h3>
              </div>
              <span className="text-xs font-mono text-amber-600 font-bold mt-2 md:mt-0 bg-amber-50 p-1.5 rounded border border-amber-200">
                Click tabs to view Phase details
              </span>
            </div>

            {/* Interactive Tab Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {phases.map((phase, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhase(idx)}
                  className={`p-4 text-left rounded-lg duration-200 transition-all border ${
                    activePhase === idx 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className={`block font-mono text-xs mb-1 font-bold ${
                    activePhase === idx ? 'text-amber-400' : 'text-amber-600'
                  }`}>STAGE 0{phase.num}</span>
                  <span className="font-bold text-sm block">{phase.title.split(": ")[1]}</span>
                </button>
              ))}
            </div>

            {/* Diagram Viewport representing the elements of the roadmap on Page 1 */}
            <div className="bg-slate-950 text-white p-6 rounded-lg border border-slate-800 relative min-h-[220px] flex flex-col justify-between">
              <div className="absolute top-2 right-3 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-gray-300 font-mono uppercase">Interactive Module</span>
              </div>

              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-red-400 block mb-2">
                  Roadmap Milestone Focus - Phase {activePhase + 1}
                </span>
                <h4 className="text-lg font-bold text-white mb-6">
                  {phases[activePhase].title}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {phases[activePhase].items.map((item, id) => (
                    <motion.div 
                      key={id}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: id * 0.1 }}
                      className="bg-slate-900 p-4 rounded border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-all group"
                    >
                      <div className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-mono text-xs font-extrabold mb-3 group-hover:bg-red-600 group-hover:text-white transition-all">
                        {id + 1}
                      </div>
                      <h5 className="font-bold text-sm text-slate-100 mb-1 group-hover:text-white">{item.title}</h5>
                      <p className="text-xs md:text-sm text-gray-300 leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center text-[11px] text-gray-400 font-mono">
                <span>SYSTEM STATUS: DNA ARCHITECTURE SECURED</span>
                <span>WHI ENGAGEMENT METRICS</span>
              </div>
            </div>
          </section>

          {/* Critical Vulnerabilities section */}
          <section className="bg-slate-900 text-white rounded-xl p-8 relative overflow-hidden border border-slate-800 shadow-md">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <AlertTriangle className="w-48 h-48 text-red-500" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xs font-mono uppercase tracking-widest">Pre-Engagement Assessment</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-6">Critical Vulnerabilities Prior to WHI DNA™ Assessment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(post.criticalVulnerabilities || []).map((vuln, i) => (
                  <div key={i} className="bg-slate-950 p-5 rounded-lg border border-slate-800 hover:border-red-900/50 transition-colors">
                    <span className="font-mono text-red-500 text-xs md:text-sm block mb-2 font-bold">[0{i + 1}]</span>
                    <h4 className="font-bold text-md md:text-lg text-slate-100 mb-2">{vuln.title}</h4>
                    <p className="text-sm md:text-base text-gray-300 leading-relaxed">{vuln.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Detailed Solutions (Step by Step 01 to 04) */}
          <section className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs text-red-500 font-mono uppercase tracking-widest">IMPLEMENTED PLAYBOOK</span>
              <h3 className="text-2xl font-extrabold text-slate-900">Custom WHI Solutions Deployed</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {(post.solutions || []).map((sol, index) => {
                const isActive = activeSolution === index;
                return (
                  <div 
                    key={index}
                    className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                      isActive 
                        ? 'border-indigo-600 bg-white shadow-md' 
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Header trigger */}
                    <button
                      onClick={() => setActiveSolution(index)}
                      className="w-full text-left p-6 md:p-8 flex items-start gap-4 md:gap-6 justify-between focus:outline-hidden"
                    >
                      <div className="flex gap-4 md:gap-6 items-start">
                        <span className="text-3xl md:text-5xl font-black font-mono tracking-tight text-slate-300 select-none">
                          {sol.num}
                        </span>
                        <div>
                          <span className="block text-xs md:text-sm text-red-500 font-mono uppercase tracking-widest mb-1 font-bold">STRATEGIC PILLAR</span>
                          <h4 className="text-lg md:text-2xl font-bold text-slate-900">{sol.title}</h4>
                        </div>
                      </div>
                      
                      {/* Expansion Indicator */}
                      <span className={`px-2.5 py-1 text-xs md:text-sm font-mono rounded-full border transition-all ${
                        isActive 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        {isActive ? 'Active Pillar' : 'Read Action'}
                      </span>
                    </button>

                    {/* Content */}
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="px-6 md:px-8 pb-8 pt-2 bg-slate-50 border-t border-slate-100"
                      >
                        <p className="text-slate-700 leading-relaxed text-base md:text-lg mb-6">
                          {sol.desc}
                        </p>

                        {index === 0 && (
                          <div className="mb-6 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                              <span className="text-xs md:text-sm font-mono text-slate-800 font-bold block uppercase tracking-wider">
                                🖥️ Clinical Walkthrough & Space Deployment Video
                              </span>
                            </div>
                            
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-md bg-black font-sans">
                              <iframe 
                                src="https://drive.google.com/file/d/1TW0rpOBFc0AjoFd2aaGN43BV-aOlvEMQ/preview"
                                className="w-full h-full border-0"
                                allow="autoplay; encrypted-media"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                        )}
                        
                        {sol.highlights && sol.highlights.length > 0 && (
                          <div className="space-y-3">
                            <span className="text-xs md:text-sm font-mono text-slate-600 font-bold block uppercase">Key Outcomes & Assets Deployed:</span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {sol.highlights.map((hil, hIndex) => (
                                <div key={hIndex} className="p-3 bg-white rounded border border-slate-200 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  <span className="text-xs md:text-sm font-medium text-slate-700">{hil}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Extra Background text from seedData representation */}
          <section className="bg-white rounded-xl border border-slate-200 p-8 prose max-w-none shadow-xs">
            <h4 className="text-lg md:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">Behind the Consultation: High-Margin Operational Alignment</h4>
            <p className="text-slate-700 text-sm md:text-base leading-relaxed">
              When launching clinical infrastructure, the primary bottleneck is never just advertising—it is clinical staffing ratios. By aligning RBT scaling structures as automated pipeline scripts synced to parent registration gates, WHI was able to scale patient volumes without creating clinical backlogs or violating state-level licensing quotas.
            </p>
            <p className="text-slate-700 text-sm md:text-base leading-relaxed mt-4">
              The introduction of automated accounting systems freed executive leadership from managing billing cycles manually, reducing claims processing delays from weeks down to hours. This efficiency gains enabled direct reinvestment into clinic facilities and client outreach programs.
            </p>
          </section>

          {/* Secondary Investor/Client Quote */}
          {post.quotes && post.quotes.length > 1 && (
            <blockquote className="bg-slate-900 text-slate-300 p-8 rounded-xl border border-slate-800 font-serif italic relative">
              <span className="absolute top-2 right-4 text-7xl text-slate-800 font-serif select-none">”</span>
              <p className="relative z-10 text-base md:text-lg text-slate-200">{post.quotes[1].text}</p>
              <cite className="mt-4 block not-italic font-sans text-xs md:text-sm">
                <span className="block font-bold text-white">{post.quotes[1].author}</span>
                <span className="text-slate-500 font-mono">{post.quotes[1].role}</span>
              </cite>
            </blockquote>
          )}

        </div>

        {/* Right Sidebar Columns (Results and Metadata Panels) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Key Results Sidebar Panel exactly mirroring golden results section of Page 1 PDF */}
          <div className="bg-slate-900 text-white rounded-xl overflow-hidden border border-slate-800 shadow-md">
            
            {/* Header banner text of results block */}
            <div className="bg-red-600 p-5 border-b border-red-700">
              <span className="text-xs uppercase font-mono tracking-widest text-red-100 block">PERFORMANCE AUDIT</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">WHI Results Delivered</h3>
            </div>

            <div className="p-6 divide-y divide-slate-800">
              {(post.results || []).map((res, i) => (
                <div key={i} className={`py-6 ${i === 0 ? 'pt-0' : ''} ${i === (post.results || []).length - 1 ? 'pb-0' : ''}`}>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl md:text-5xl font-black tracking-tight text-amber-400 font-mono">{res.value}</span>
                    <span className="text-xs md:text-sm font-mono text-gray-300">Increase</span>
                  </div>
                  <h4 className="font-extrabold text-white text-sm md:text-base tracking-tight mb-2 uppercase">{res.label}</h4>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed">{res.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 p-4 border-t border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-gray-400">
                Performance parameters verified: May 2026
              </span>
            </div>
          </div>

          {/* Explanatory "What is WHI DNA?" block */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h4 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-red-600" />
              <span>What is the WHI DNA™ Framework?</span>
            </h4>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-4">
              WHI Agency’s proprietary diagnostic engine that deconstructs an organization’s deep structural DNA. We model local competitive ecosystems, verify internal technical debt, and engineer a customized 3-phase roadmap to drive scale.
            </p>
            <div className="border-t border-slate-100 pt-4">
              <div className="flex justify-between text-xs md:text-sm py-1 text-slate-500 font-mono">
                <span>Diagnostic Period</span>
                <span className="text-slate-800 font-medium">14 Business Days</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm py-1 text-slate-500 font-mono">
                <span>Execution Phases</span>
                <span className="text-slate-800 font-medium font-bold">3 Core Horizons</span>
              </div>
            </div>
          </div>

          {/* Social Proof badge */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-xl p-6 border border-slate-800 overflow-hidden relative shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp className="w-24 h-24 text-amber-500" />
            </div>
            <div className="relative z-10">
              <span className="text-xs text-amber-500 font-bold tracking-widest uppercase block mb-1">Scale Audit</span>
              <h5 className="font-extrabold text-sm md:text-base text-slate-100 mb-2">Are you a boutique healthcare business feeling the squeeze of Private Equity?</h5>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed mb-4">
                Schedule a private discovery session to run your clinic assets through our digital ecosystem vulnerability calculator.
              </p>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-3 rounded text-xs md:text-sm font-bold font-mono tracking-wide transition-all uppercase flex items-center justify-center gap-1">
                <span>Request Case Briefing</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Suggested Case Studies Section mimicking the lower block on PDF */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-slate-200">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 uppercase font-mono text-center mb-8">
          EXPLORE MORE CUSTOMER SUCCESS STORIES
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-mono font-medium">B2B SaaS</span>
            <h4 className="font-bold text-slate-900 mt-3 text-md md:text-lg leading-snug">Lead Flow Acceleration Strategy: doubling pipeline values under 6 months</h4>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed mt-2 line-clamp-2">How we reorganized Salesforce routing scripts to rescue leads from generic circular systems.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-mono font-medium">Local Services</span>
            <h4 className="font-bold text-slate-900 mt-3 text-md md:text-lg leading-snug font-sans">Multi-Site Dental Clinic Group: Driving Local Map-pack Listings and 5★ Reviews</h4>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed mt-2 line-clamp-2">Re-engineering reputational trust in crowded Georgia dental centers with automation.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-mono font-medium">Public Sector Growth</span>
            <h4 className="font-bold text-slate-900 mt-3 text-md md:text-lg leading-snug">State Billing Audit Preparation & Practice Automation for Specialized Clinics</h4>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed mt-2 line-clamp-2">Establishing billing insurance adapters directly into therapeutic practice registers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
