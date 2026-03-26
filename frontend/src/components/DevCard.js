import React from 'react';
import { Github, Star, Users, Calendar, Hexagon, ShieldCheck } from 'lucide-react';

const DevCard = ({ data, cardRef }) => {
  if (!data) return null;

  const { profile, stats } = data;
  
  const topLanguages = Object.entries(stats.languages || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="absolute left-[-9999px] top-0">
      <div 
        ref={cardRef}
        className="w-[600px] h-[315px] bg-[#050505] border border-zinc-800 p-8 flex flex-col justify-between relative overflow-hidden font-sans text-white shadow-2xl"
      >
        {/* Vector Background Glows */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-emerald-500/20 rounded-[24px] blur-sm"></div>
              <img 
                src={profile.avatar} 
                alt="avatar" 
                className="w-20 h-20 rounded-[22px] border border-zinc-700/50 object-cover relative z-10"
              />
              <div className="absolute -bottom-2 -right-2 bg-zinc-900 border border-zinc-700 p-1.5 rounded-xl z-20 shadow-xl">
                <Github size={12} className="text-emerald-500" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                {profile.name}
              </h2>
              <div className="flex items-center gap-3">
                <p className="text-emerald-400 text-sm font-black font-mono tracking-tight">
                    @{profile.username}
                </p>
                <div className="h-1 w-1 rounded-full bg-zinc-700" />
                <div className="flex items-center gap-1.5 opacity-50">
                  <Calendar size={10} className="text-zinc-400" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">EST. {new Date(profile.joined_at).getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-[28px] backdrop-blur-xl min-w-[135px] text-center shadow-2xl relative z-10">
            <span className="block text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1 italic">Global Cred</span>
            <span className="text-4xl font-black italic text-white tracking-tighter leading-none">
              {stats.git_score}%
            </span>
          </div>
        </div>

        {/* --- MIDDLE GRID --- */}
        <div className="grid grid-cols-12 gap-6 relative z-10 items-stretch">
          
          <div className="col-span-7 bg-white/[0.02] border border-white/[0.05] p-5 rounded-[24px] backdrop-blur-sm">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] italic flex items-center gap-2 mb-4">
              <ShieldCheck size={11} className="text-emerald-500" /> Professional Audit
            </span>
            <div className="space-y-3">
              <MiniBar label="DOC" value={stats.audit?.doc} weight={25} color="bg-emerald-500" />
              <MiniBar label="CON" value={stats.audit?.consistency} weight={25} color="bg-blue-500" />
              <MiniBar label="DIV" value={stats.audit?.diversity} weight={15} color="bg-purple-500" />
              <MiniBar label="IMP" value={stats.audit?.impact} weight={15} color="bg-zinc-700" />
              <MiniBar label="SEC" value={stats.audit?.security} weight={20} color="bg-rose-500" />
            </div>
          </div>

          <div className="col-span-5 bg-white/[0.02] border border-white/[0.05] p-5 rounded-[24px] backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                  <Hexagon size={12} className="text-emerald-400" />
                  <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] italic">Stack</span>
              </div>
              <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-black mb-4">
                  {topLanguages.map(([lang, val], i) => (
                    <div key={lang} style={{ width: `${(val / stats.repo_count) * 100}%` }} className={`${['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-zinc-700'][i]}`} />
                  ))}
              </div>
              <div className="flex flex-col gap-2">
                  {topLanguages.slice(0, 3).map(([lang], i) => (
                      <div key={lang} className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-zinc-500 uppercase italic flex items-center gap-2">
                              <div className={`w-1 h-1 rounded-full ${['bg-emerald-500', 'bg-blue-500', 'bg-purple-500'][i]}`} />
                              {lang}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-600">{( (topLanguages[i][1] / stats.repo_count) * 100 ).toFixed(0)}%</span>
                      </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="flex justify-between items-end relative z-10 pt-4 border-t border-zinc-900/50">
           <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-[11px] font-black uppercase text-zinc-300">{stats.total_stars} <span className="text-zinc-600">Stars</span></span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-blue-400" />
                    <span className="text-[11px] font-black uppercase text-zinc-300">{profile.followers} <span className="text-zinc-600">Followers</span></span>
                 </div>
              </div>
              <p className="text-[9px] text-zinc-500 font-bold italic truncate max-w-[340px] leading-none opacity-60">
                "{profile.bio || "Fullstack Developer"}"
              </p>
           </div>

           <div className="flex items-center gap-5">
              <div className="text-right flex flex-col items-end opacity-20">
                <span className="text-[7px] font-black uppercase tracking-[0.4em] italic leading-none">GitAnalytics</span>
                <span className="text-[7px] font-black uppercase tracking-[0.4em] italic leading-none mt-1">Verified</span>
              </div>
              <div className="p-1.5 bg-white rounded-xl">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&color=000000&data=https://github.com/${profile.username}`} 
                    alt="QR" 
                    className="w-8 h-8" 
                  />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const MiniBar = ({ label, value, weight, color }) => (
  <div className="flex items-center gap-4">
    <span className="text-[9px] font-black text-zinc-500 w-9 italic tracking-widest">{label}</span>
    <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden border border-zinc-800/30">
      <div className={`h-full ${color}`} style={{ width: `${Math.min((value / weight) * 100, 100)}%` }} />
    </div>
    <span className="text-[9px] font-mono font-black text-zinc-400 w-8 text-right">+{value}</span>
  </div>
);

export default DevCard;