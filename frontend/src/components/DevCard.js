import React from 'react';
import { Github, Star, Users, Calendar, Hexagon, ShieldCheck, Flame } from 'lucide-react';

const DevCard = ({ data, cardRef }) => {
  if (!data) return null;

  const { profile, stats } = data;
  
  const topLanguages = Object.entries(stats.languages || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="absolute left-[-9999px] top-0">
      <div 
        ref={cardRef}
        className="w-[700px] h-[400px] bg-[#050505] border border-zinc-800 p-8 flex flex-col justify-between relative overflow-hidden font-sans text-white shadow-2xl"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        {/* --- HEADER SECTION --- */}
        <div className="flex justify-between items-center relative z-10 mb-2">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img 
                src={profile.avatar} 
                className="w-20 h-20 rounded-[24px] border border-zinc-700 object-cover relative z-10" 
                alt="avatar" 
              />
              <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-zinc-700 p-1.5 rounded-lg z-20 shadow-xl">
                <Github size={12} className="text-emerald-500" />
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight text-white">
                {profile.name}
              </h2>
              <div className="flex items-center gap-3">
                <p className="text-emerald-400 text-xs font-black font-mono tracking-tight">@{profile.username}</p>
                <div className="h-1 w-1 rounded-full bg-zinc-700" />
                <div className="flex items-center gap-1.5 opacity-40">
                  <Calendar size={10} className="text-zinc-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest italic">EST. {new Date(profile.joined_at).getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* GIT SCORE */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-[28px] w-[140px] text-center backdrop-blur-md">
             <div className="flex items-center justify-center gap-1.5 mb-1">
                <ShieldCheck size={10} className="text-emerald-500 opacity-60" />
                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-[0.3em] ">GIT SCORE</span>
             </div>
             <span className="text-4xl font-black text-white tracking-tighter leading-none">{stats.git_score}</span>
          </div>
        </div>

        {/* --- MAIN BODY SECTION --- */}
        <div className="grid grid-cols-12 gap-5 relative z-10 mt-2">
          
          {/* Professional Audit */}
          <div className="col-span-7 bg-white/[0.02] border border-white/[0.04] p-5 rounded-[24px]">
            <div className="flex items-center gap-3 mb-4">
               <ShieldCheck size={14} className="text-emerald-500" />
               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] ">GIT SCORE BREAKDOWN</span>
            </div>
            <div className="space-y-3">
              <MiniBar label="DOC" value={stats.audit?.doc} weight={20} color="bg-emerald-500" />
              <MiniBar label="CON" value={stats.audit?.consistency} weight={20} color="bg-blue-500" />
              <MiniBar label="DIV" value={stats.audit?.diversity} weight={10} color="bg-purple-500" />
              <MiniBar label="IMP" value={stats.audit?.impact} weight={30} color="bg-orange-500" />
                          </div>
          </div>

          {/* Stack Distribution */}
          <div className="col-span-5 bg-white/[0.02] border border-white/[0.04] p-5 rounded-[24px] flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                  <Hexagon size={14} className="text-blue-400" />
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Lang Distribution</span>
              </div>
              <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-black mb-4">
                  {topLanguages.map(([lang, val], i) => (
                    <div key={lang} style={{ width: `${(val / stats.repo_count) * 100}%` }} className={`${['bg-emerald-500', 'bg-blue-500', 'bg-purple-500'][i]}`} />
                  ))}
              </div>
              <div className="space-y-2">
                  {topLanguages.map(([lang, val], i) => (
                      <div key={lang} className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-zinc-500 uppercase italic">{lang}</span>
                          <span className="text-[8px] font-mono text-zinc-600">{Math.round((val / stats.repo_count) * 100)}%</span>
                      </div>
                  ))}
              </div>
          </div>
        </div>

        {/* --- FOOTER SECTION --- */}
        <div className="flex justify-between items-end relative z-10 pt-4 border-t border-zinc-900">
           <div className="flex flex-col gap-3">
              <div className="flex items-center gap-5">
                 <div className="flex items-center gap-1.5">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black uppercase text-zinc-300">{stats.total_stars} <span className="text-zinc-600">stars</span></span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-blue-400" />
                    <span className="text-[10px] font-black uppercase text-zinc-300">{profile.followers} <span className="text-zinc-600">followers</span></span>
                 </div>
                 <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                    <Flame size={10} className="text-orange-500" />
                    <span className="text-[9px] font-black text-orange-500 uppercase italic">{profile.streak} streak</span>
                 </div>
              </div>
              <p className="text-[9px] text-zinc-500 font-bold italic truncate max-w-[420px] opacity-70">
                "{profile.bio || "Building things..."}"
              </p>
           </div>

           <div className="flex items-center gap-4">
  <div className="text-right flex flex-col items-end opacity-20">
    <span className="text-[7px] font-black uppercase tracking-[0.4em] italic leading-none">GitAnalytics</span>
    <span className="text-[7px] font-black uppercase tracking-[0.4em] italic leading-none mt-1">Verified</span>
  </div>
  
  <div className="p-2 bg-white rounded-xl shadow-lg">
      <img 
        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=000000&margin=2&data=https://github.com/${profile.username}`} 
        alt="QR" 
        className="w-14 h-14" 
      />
  </div>
</div>
        </div>
      </div>
    </div>
  );
};

const MiniBar = ({ label, value, weight, color }) => (
  <div className="flex items-center gap-3">
    <span className="text-[8px] font-black text-zinc-500 w-8 italic tracking-widest">{label}</span>
    <div className="flex-1 h-1 bg-black rounded-full overflow-hidden border border-zinc-800/30">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.min((value / weight) * 100, 100)}%` }} />
    </div>
    <span className="text-[8px] font-mono font-black text-zinc-400 w-6 text-right">+{value}</span>
  </div>
);

export default DevCard;