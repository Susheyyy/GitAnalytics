import React, { useState, useRef } from 'react';
import { fetchAnalysis } from '../utils/api';
import ProjectModal from '../components/ProjectModal';
import DevCard from '../components/DevCard';
import { toPng } from 'html-to-image';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  Github, ShieldCheck, Activity, Star, Hexagon, ExternalLink, 
  FolderGit2, Clock, Info, Loader2, Calendar, UserCircle, 
  Flame, Twitter, Lightbulb, Sparkles, GitCompare
} from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4'];

const formatTimeAgo = (dateString) => {
  if (!dateString) return "UNKNOWN";
  const lastActive = new Date(dateString);
  const now = new Date(); 
  const diffInMs = now.getTime() - lastActive.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays < 1) return " TODAY";
  if (diffInDays === 1) return " YESTERDAY";
  return `${diffInDays}D AGO`;
};

const SummaryLine = ({ label, weight, user }) => (
    <div className="flex justify-between items-center text-[9px] font-bold py-1 border-b border-zinc-800/50 last:border-0">
        <span className="text-zinc-500 uppercase tracking-tighter">{label} ({weight})</span>
        <span className="text-emerald-500">+{user || 0} pts</span>
    </div>
);

// --- REUSABLE STATCARD  ---
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-zinc-950 border border-zinc-800/50 p-6 rounded-[32px] flex flex-col hover:bg-zinc-900/40 transition-all shadow-lg min-h-[160px] relative group">
    <div className="flex items-center justify-center relative mb-4 min-h-[24px]">
      <div className={`absolute left-0 ${color} opacity-80 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{label}</span>
    </div>
    <div className="flex-1 flex items-center justify-center">
      <div className="text-5xl font-black text-white tracking-tighter">{value}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  
  const cardRef = useRef(null);

  const handleSearch = async () => {
    if (!username) return;
    setLoading(true);
    setData(null);
    setRoadmap(null);
    try {
      const result = await fetchAnalysis(username);
      if (result) setData(result);
    } catch (err) {
      console.error(err);
      alert("Connection error. Ensure your backend is running.");
    }
    setLoading(false);
  };

  const handleFetchRoadmap = async () => {
    if (roadmap || roadmapLoading) return;
    setRoadmapLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/roadmap/${data.profile.username}`);
      const result = await res.json();
      setRoadmap(result.suggestion);
    } catch (err) {
      console.error("Roadmap failed", err);
    }
    setRoadmapLoading(false);
  };

  const handleShareToX = () => {
    const tweetText = encodeURIComponent(`My GitHub #GitAnalytics are in! 🔥\n\n🏆 Score: ${data.stats.git_score}%\n⚡ Streak: ${data.profile.streak} Days\n\nAnalyze your profile here:`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const handleGenerateCard = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `${data.profile.username}-devcard.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { console.error(err); }
    setIsGenerating(false);
  };

  const handleRepoClick = async (repoName) => {
    setDeepDiveLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/analyze-repo/${data.profile.username}/${repoName}`);
      if (res.ok) setSelectedRepo(await res.json());
    } catch (err) { console.error(err); }
    setDeepDiveLoading(false);
  };

  const chartData = data?.stats?.languages 
    ? Object.entries(data.stats.languages).map(([name, value]) => ({ name, value })) 
    : [];

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans pb-20 selection:bg-emerald-500/30 relative">
      {/* TOP LEFT: COMPARISON NAVIGATION */}
  <div className="absolute top-8 left-8 z-[120] group">
    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl whitespace-nowrap shadow-2xl">
       <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Compare Users</span>
    </div>
    <Link to="/compare">
      <button className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all shadow-2xl">
        <GitCompare size={24} />
      </button>
    </Link>
  </div>
      
      {/* 1. TOP RIGHT ACTION GROUP  */}
      {data && (
        <div className="absolute top-8 right-8 z-[120] flex items-center gap-3">
          
          {/* Twitter Share */}
          <div className="relative group/twitter">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/twitter:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl whitespace-nowrap shadow-2xl">
               <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Share on X</span>
            </div>
            <button 
              onClick={handleShareToX} 
              className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 hover:bg-blue-500/20 transition-all shadow-2xl"
            >
              <Twitter size={24} />
            </button>
          </div>

          {/* DevCard Generation */}
          <div className="relative group/devcard">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/devcard:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl whitespace-nowrap shadow-2xl">
               <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Generate DEV Card</span>
            </div>
            <button 
              onClick={handleGenerateCard} 
              disabled={isGenerating} 
              className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-emerald-500 hover:border-emerald-500/50 transition-all shadow-2xl"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={24}/> : <UserCircle size={24} />}
            </button>
          </div>
        </div>
      )}

      <DevCard data={data} cardRef={cardRef} />

      {deepDiveLoading && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
            <Loader2 className="text-emerald-500 animate-spin mb-4" size={40} />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-white italic">AI is scanning the codebase...</p>
        </div>
      )}

      {/* Hero Section */}
      <div className={`flex flex-col items-center transition-all duration-1000 px-4 ${data ? 'pt-8 pb-10' : 'pt-32 pb-20'}`}>
        <div className="text-center mb-8">
            <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 justify-center">
                <Github size={40} /> GitAnalytics
            </h1>
            <p className="text-zinc-500 mt-2 font-medium tracking-wide italic text-sm">Analyze your Github profile in seconds.</p>
        </div>

        <div className="w-full max-w-lg">
            <div className="relative flex bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-1.5 focus-within:border-zinc-700 transition-all">
                <input 
                    className="w-full bg-transparent pl-4 pr-4 py-2.5 outline-none text-zinc-200 text-sm placeholder:text-zinc-600 font-medium"
                    placeholder="Search GitHub username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} className="bg-white text-black px-6 py-2 rounded-xl font-bold text-xs hover:bg-zinc-200 transition-colors">
                    {loading ? <Loader2 className="animate-spin" size={14}/> : "ANALYZE"}
                </button>
            </div>
        </div>
      </div>

      {data && (
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-4">
            
            <div className="bg-zinc-950 border border-zinc-800/50 p-8 rounded-3xl sticky top-8 shadow-2xl">
              <img src={data.profile.avatar} className="w-32 h-32 rounded-3xl border border-zinc-800 mb-6 object-cover shadow-2xl" alt="avatar" />
              <h2 className="text-2xl font-black text-white tracking-tight leading-none uppercase">{data.profile.name}</h2>
              <p className="text-zinc-500 text-sm mt-2">@{data.profile.username}</p>
              <p className="text-zinc-400 text-sm leading-relaxed mt-6 mb-8 font-medium italic opacity-80 italic">"{data.profile.bio || "No bio available."}"</p>
              
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 bg-zinc-900/50 rounded-xl border border-zinc-800/50 flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{data.profile.followers}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Followers</span>
                    </div>
                  <div className="px-3 py-1.5 bg-orange-500/10 rounded-xl border border-orange-500/20 flex items-center gap-2">
                    <Flame size={12} className="text-orange-500" />
                    <span className="text-[10px] text-orange-500 font-black uppercase italic">{data.profile.streak} Day Streak</span>
                  </div>
                  <div className="px-3 py-1.5 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center gap-2">
                    <Calendar size={12} className="text-blue-400" />
                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Born {new Date(data.profile.joined_at).getFullYear()}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                    <span className="text-[10px] text-emerald-500 font-black uppercase ">{data.profile.top_lang}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-zinc-900/50 rounded-xl border border-zinc-800/50 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Seen {formatTimeAgo(data.profile.last_active)}</span>
                  </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Git Score Card */}
              <div className="bg-zinc-950 border border-zinc-800/50 p-6 rounded-[32px] flex flex-col relative transition-all hover:bg-zinc-900/40 group/score min-h-[160px] shadow-lg">
                <div className="flex items-center justify-center relative mb-4 min-h-[24px]">
                  <div className="absolute left-0 text-emerald-500"><ShieldCheck size={18} /></div>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Git Score</span>
                  <div className="absolute right-0 group/info">
                    <Info size={14} className="text-zinc-700 hover:text-zinc-400 cursor-help transition-colors" />
                    <div className="absolute right-0 top-8 w-64 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50 text-left backdrop-blur-xl">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-3">What is Git Score?</p>
                         <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed font-medium">
            Git Score is a 100-point "Dev Cred" summary that rewards you for writing clean documentation (Documentation), coding consistently throughout the year (Commit Consistency), using a variety of languages (Tech Diversity), and building projects that people actually star (Repo Impact).
        </p>
                        <div className="space-y-3 border-t border-zinc-800 pt-3">
                            <SummaryLine label="Documentation" weight="35%" user={data.stats.audit.doc} />
                            <SummaryLine label="Consistency" weight="30%" user={data.stats.audit.consistency} />
                            <SummaryLine label="Tech Diversity" weight="20%" user={data.stats.audit.diversity} />
                            <SummaryLine label="Repo Impact" weight="15%" user={data.stats.audit.impact} />
                        </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-5xl font-black text-white tracking-tighter">{data.stats.git_score}</div>
                </div>
              </div>

              <StatCard icon={<Star size={18}/>} label="Total Stars" value={data.stats.total_stars} color="text-amber-500" />
              <StatCard icon={<Activity size={18}/>} label="Public Repos" value={data.stats.repo_count} color="text-blue-500" />
            </div>

            {/* Tech Stack Distribution */}
            <div className="bg-zinc-950 border border-zinc-800/50 p-8 rounded-3xl shadow-xl relative overflow-hidden">
                
                {/* AI Roadmap Bulb */}
                <div className="absolute top-6 right-8 z-10 flex items-center gap-3 group/bulb">
                    <div className="opacity-0 group-hover/bulb:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl pointer-events-none shadow-2xl">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">What's next?</span>
                    </div>
                    <button 
                        onClick={handleFetchRoadmap} 
                        className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 text-amber-500 transition-all shadow-lg"
                    >
                        {roadmapLoading ? <Loader2 className="animate-spin" size={18} /> : <Lightbulb size={18} className={roadmap ? "fill-amber-500" : ""} />}
                    </button>
                </div>

                <h3 className="text-xs font-black text-zinc-500 mb-8 uppercase tracking-[0.2em] flex items-center gap-3 ">
                    <Hexagon size={16} className="text-emerald-500"/> LANG Distribution
                </h3>

                {roadmap && (
                    <div className="mb-8 p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl animate-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={14} className="text-amber-500" />
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">AI Career Roadmap</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed italic" dangerouslySetInnerHTML={{ __html: roadmap }} />
                    </div>
                )}

                <div className="h-[300px] w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={chartData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                        {chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '16px', fontSize: '10px' }} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" formatter={(v) => <span className="text-zinc-400 text-xs font-bold ml-2 uppercase italic tracking-tighter">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* Repository Portfolio */}
            <div className="bg-zinc-950 border border-zinc-800/50 p-8 rounded-3xl shadow-xl">
                <h3 className="text-xs font-black text-zinc-500 mb-8 uppercase tracking-[0.2em] flex items-center gap-3 justify-center"><FolderGit2 size={16} className="text-blue-500"/> Repository Portfolio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.stats.all_projects.map((project) => (
                        <div 
                          key={project.name} 
                          onClick={() => handleRepoClick(project.name)} 
                          className="bg-zinc-900/20 border border-zinc-800/50 p-5 rounded-2xl flex flex-col hover:border-emerald-500/40 hover:bg-zinc-900/40 transition-all group cursor-pointer text-left"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <FolderGit2 size={18} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                <ExternalLink size={14} className="text-zinc-800 group-hover:text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-white mb-2 truncate">{project.name}</h4>
                            <p className="text-zinc-500 text-[11px] line-clamp-2 mb-4 h-8 font-medium leading-relaxed">{project.description || "No description provided."}</p>
                            <div className="mt-2 mb-6 px-3 py-2 bg-black/40 rounded-lg border border-zinc-800/50 flex items-center gap-2">
                                <Clock size={12} className="text-emerald-500 shrink-0" />
                                <span className="text-[10px] font-mono text-zinc-400 truncate uppercase italic">{project.last_update}</span>
                            </div>
                            <div className="flex items-center justify-between mt-auto text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                {project.language || "Misc"}
                                <div className="flex items-center gap-1"><Star size={10} className="text-amber-500 fill-amber-500" /> {project.stars}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

          </div>
        </div>
      )}

      {selectedRepo && <ProjectModal repo={selectedRepo} onClose={() => setSelectedRepo(null)} />}
    </div>
  );
};

export default Dashboard;