import React from 'react';
import { 
  X, Star, GitFork, Shield, Globe, FileText, 
  Terminal, CheckCircle2, AlertCircle, Cpu 
} from 'lucide-react';

const ProjectModal = ({ repo, onClose }) => {
  if (!repo) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="p-8">
          {/* HEADER */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tighter mb-2 italic">
              {repo.name}
            </h2>
            <div className="flex flex-wrap gap-3">
              <Badge icon={<Star size={12}/>} label={repo.stars} color="text-amber-500" />
              <Badge icon={<GitFork size={12}/>} label={repo.forks} color="text-blue-500" />
              <Badge icon={<Shield size={12}/>} label={repo.license} color="text-purple-500" />
              {repo.is_deployed && (
                <a href={repo.deployed_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase text-emerald-500 hover:bg-emerald-500/20 transition-all">
                  <Globe size={12} /> Live Demo
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT: AI INSIGHT (The Glowing Card) */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-zinc-900 border border-zinc-800 p-5 rounded-2xl h-full">
                <div className="flex items-center gap-2 text-emerald-500 mb-3">
                  <Cpu size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Prediction</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium italic">
                  {repo.ai_analysis || "Analysing core logic and dependencies..."}
                </p>
              </div>
            </div>

            {/* RIGHT: HEALTH CHECK & STATS */}
            <div className="space-y-4">
              <div className="bg-zinc-900/50 border border-zinc-800/50 p-5 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest block mb-3">STATS</span>
                <div className="space-y-2">
                  <StatusItem 
                    label="README"  
                    status={repo.has_readme} 
                    message={repo.has_readme ? "Optimized" : "Missing Details"} 
                  />
                  <StatusItem 
                    label="Deployment" 
                    status={repo.is_deployed} 
                    message={repo.is_deployed ? "Live" : "Local Only"} 
                  />
                </div>
              </div>

              {/* REPO STATS GRID */}
              <div className="grid grid-cols-3 gap-2">
                 <SmallStat label="Commits" value={repo.stats?.commits} />
                 <SmallStat label="Branches" value={repo.stats?.branches} />
                 <SmallStat label="Contribs" value={repo.stats?.contributors} />
              </div>
            </div>
          </div>

          {/* INTERACTIVE TAGS */}
          <div className="mt-8 pt-6 border-t border-zinc-900">
            <div className="flex flex-wrap gap-2">
              {repo.tags?.map(tag => (
                <span key={tag} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 cursor-default transition-all">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ icon, label, color }) => (
  <div className={`flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black uppercase ${color}`}>
    {icon} {label}
  </div>
);

const StatusItem = ({ label, status, message }) => (
  <div className="flex items-center justify-between">
    <span className="text-[11px] font-bold text-zinc-400">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{message}</span>
      {status ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-rose-500" />}
    </div>
  </div>
);

const SmallStat = ({ label, value }) => (
  <div className="bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-xl text-center">
    <div className="text-[9px] font-black uppercase text-zinc-600 mb-1">{label}</div>
    <div className="text-sm font-bold text-white tracking-tight">{value || 0}</div>
  </div>
);

export default ProjectModal;