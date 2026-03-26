import React from 'react';
import { X, Star, GitFork, Shield, Globe, FileText, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

const ProjectModal = ({ repo, onClose }) => {
  if (!repo) return null;

  const processAIResponse = () => {
    const raw = repo.ai_analysis || "";
        const clean = raw.replace(/\*\*/g, '').replace(/^Here's an analysis.*?:/i, '').trim();

    let summary = "Analyzing core logic...";
    let improvement = "Documentation expansion recommended.";

        const splitPattern = /IMPROVEMENT:|2\.|README Improvement Suggestion:|Actionable Advice:/i;
    
    if (splitPattern.test(clean)) {
      const parts = clean.split(splitPattern);
      summary = parts[0].replace(/SUMMARY:|1\.|Project Purpose Summary:|Project Purpose:/i, '').trim();
      improvement = parts[1].trim();
    } else {
      summary = clean;
    }

    return { summary, improvement };
  };

  const { summary, improvement } = processAIResponse();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh]">
        
        <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors z-[110] p-2 bg-zinc-900/50 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto p-8 custom-scrollbar">
          <div className="mb-8 pr-10">
            <h2 className="text-3xl font-black text-white tracking-tighter mb-4 italic uppercase leading-none">
              {repo.name}
            </h2>
            <div className="flex flex-wrap gap-3">
              <Badge icon={<Star size={12}/>} label={repo?.stars} color="text-amber-500" />
              <Badge icon={<GitFork size={12}/>} label={repo?.forks} color="text-blue-500" />
              <Badge icon={<Shield size={12}/>} label={repo?.license} color="text-purple-500" />
              {repo?.is_deployed && (
                <a href={repo.deployed_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase text-emerald-500 hover:bg-emerald-500/20 transition-all">
                  <Globe size={12} /> Live Demo
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI INSIGHT CARD */}
            <div className="relative group md:col-span-2 lg:col-span-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
              <div className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-full flex flex-col">
                <div className="flex items-center gap-2 text-emerald-500 mb-4">
                  <Cpu size={16} className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Insight</span>
                </div>
                
                <div className="space-y-6 text-left">
                  <div>
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-2 italic">Core Purpose</span>
                    <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                      {summary}
                    </p>
                  </div>
                  
                  <div className="pt-5 border-t border-zinc-800">
                    <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest block mb-2 italic flex items-center gap-2">
                       <FileText size={10} /> Actionable Advice
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-medium italic">
                      {improvement}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* HEALTH & STATS */}
            <div className="space-y-4">
              <div className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest block mb-4 text-left">Project Vitals</span>
                <div className="space-y-3">
                  <StatusItem label="README" status={repo?.has_readme} message={repo?.has_readme ? "Optimized" : "Missing"} />
                  <StatusItem label="Deployment" status={repo?.is_deployed} message={repo?.is_deployed ? "Live" : "Local"} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                 <SmallStat label="Commits" value={repo?.stats?.commits} />
                 <SmallStat label="Branches" value={repo?.stats?.branches} />
                 <SmallStat label="Contribs" value={repo?.stats?.contributors} />
              </div>
            </div>
          </div>

          {repo?.tags && repo.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-900">
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {repo.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-500">
                    #{tag}
                    </span>
                ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Badge = ({ icon, label, color }) => (
  <div className={`flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black uppercase ${color}`}>
    {icon} {label || 0}
  </div>
);

const StatusItem = ({ label, status, message }) => (
  <div className="flex items-center justify-between">
    <span className="text-[11px] font-bold text-zinc-400 italic">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">{message}</span>
      {status ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-rose-500" />}
    </div>
  </div>
);

const SmallStat = ({ label, value }) => (
  <div className="bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-xl text-center">
    <div className="text-[8px] font-black uppercase text-zinc-600 mb-1">{label}</div>
    <div className="text-sm font-bold text-white tracking-tight">{value || 0}</div>
  </div>
);

export default ProjectModal;