import React, { useState } from 'react';
import { fetchAnalysis } from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  Search, Github, ShieldCheck, Activity, Star, 
  Hexagon, Building, ExternalLink, FolderGit2, Clock 
} from 'lucide-react';

const COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4'];

const formatTimeAgo = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const result = await fetchAnalysis(username);
      if (result) {
        setData(result);
      } else {
        alert("User not found.");
      }
    } catch (err) {
      alert("Something went wrong. Please check your connection.");
    }
    setLoading(false);
  };

  const chartData = data ? Object.entries(data.stats.languages).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans pb-20 selection:bg-emerald-500/30">
      
      {/* HEADER & SEARCH */}
<div className={`flex flex-col items-center transition-all duration-1000 px-4 ${data ? 'pt-8 pb-10' : 'pt-32 pb-20'}`}>
  
  {/* Logo and Statement Group */}
  <div className="text-center mb-8">
    <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 justify-center italic">
      <Github size={40} /> GitAnalytics
    </h1>
    <p className="text-zinc-500 mt-2 font-medium tracking-wide">
      Analyse your Github profile in seconds.
    </p>
  </div>
        <div className="w-full max-w-lg px-6">
            <div className="relative flex bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-1.5 focus-within:border-zinc-700">
                <input 
                    className="w-full bg-transparent pl-4 pr-4 py-2.5 outline-none text-zinc-200 text-sm placeholder:text-zinc-600"
                    placeholder="Search GitHub username..."
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} className="bg-white text-black px-6 py-2 rounded-xl font-bold text-xs">
                    {loading ? "..." : "ANALYZE"}
                </button>
            </div>
        </div>
      </div>

      {data && (
        <div className="max-w-7xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* SIDEBAR */}
            <div className="lg:col-span-4">
              <div className="bg-zinc-950 border border-zinc-800/50 p-8 rounded-3xl sticky top-8">
                <img src={data.profile.avatar} className="w-32 h-32 rounded-3xl border border-zinc-800 mb-6 shadow-2xl" alt="avatar" />
                <h2 className="text-2xl font-black text-white tracking-tight">{data.profile.name}</h2>
                <p className="text-zinc-500 text-sm mt-1">@{data.profile.username}</p>
                <p className="text-zinc-400 text-sm leading-relaxed mt-6 mb-8 font-medium">
                    {data.profile.bio || "No bio available."}
                </p>

                <div className="flex flex-wrap gap-2">
                    <Badge label="Followers" value={data.profile.followers} />
                    <div className="px-3 py-1.5 bg-zinc-900/50 rounded-xl border border-zinc-800/50 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Active {formatTimeAgo(data.profile.last_active)}</span>
                    </div>
                    {data.profile.is_pro && (
                        <div className="px-3 py-1.5 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center gap-2">
                            <Star size={10} className="text-purple-400 fill-purple-400" />
                            <span className="text-[10px] text-purple-400 font-black uppercase tracking-tighter">@pro</span>
                        </div>
                    )}
                </div>
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="lg:col-span-8 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <StatCard icon={<ShieldCheck size={18}/>} label="Health Score" value={`${data.stats.health_score}%`} color="text-emerald-500" />
                 <StatCard icon={<Star size={18}/>} label="Total Stars" value={data.stats.total_stars} color="text-amber-500" />
                 <StatCard icon={<Activity size={18}/>} label="Public Repos" value={data.stats.repo_count} color="text-blue-500" />
              </div>

              {/* TECH STACK distribution */}
              <div className="bg-zinc-950 border border-zinc-800/50 p-8 rounded-3xl">
                 <h3 className="text-xs font-black text-zinc-500 mb-8 uppercase tracking-[0.2em]">Tech Stack Distribution</h3>
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={chartData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '16px' }} />
                        <Legend verticalAlign="middle" align="right" layout="vertical" formatter={(v) => <span className="text-zinc-400 text-xs font-bold ml-2 uppercase tracking-tight">{v}</span>}/>
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* REPOSITORY PORTFOLIO */}
              <div className="bg-zinc-950 border border-zinc-800/50 p-8 rounded-3xl">
                <h3 className="text-xs font-black text-zinc-500 mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
                    <FolderGit2 size={16} className="text-blue-500"/> Repository Portfolio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.stats.all_projects?.map((project) => (
                        <div key={project.name} className="bg-zinc-900/20 border border-zinc-800/50 p-5 rounded-2xl flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <FolderGit2 size={18} className="text-zinc-600" />
                                <a href={project.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink size={14} className="text-zinc-800 hover:text-white" />
                                </a>
                            </div>
                            <h4 className="text-sm font-bold text-white mb-2 truncate">{project.name}</h4>
                            <p className="text-zinc-500 text-[11px] line-clamp-2 mb-4 h-8 font-medium leading-relaxed">
                                {project.description}
                            </p>
                            
                            {/* ACTIVITY STATUS BAR */}
                            <div className="mt-2 mb-6 px-3 py-2 bg-black/40 rounded-lg border border-zinc-800/50 flex items-center gap-2">
                                <Clock size={12} className="text-emerald-500 shrink-0" />
                                <span className="text-[10px] font-mono text-zinc-400 truncate tracking-tight uppercase">
                                    {project.last_update}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{project.language}</span>
                                <div className="flex items-center gap-1">
                                    <Star size={10} className="text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-bold text-zinc-400">{project.stars}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Badge = ({ label, value, icon }) => (
    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 rounded-full border border-zinc-800/50">
        {icon}
        {label && <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{label}</span>}
        <span className="text-xs font-black text-white">{value}</span>
    </div>
);

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-zinc-950 border border-zinc-800/50 p-6 rounded-3xl flex flex-col gap-1 hover:bg-zinc-900/30 transition-all">
    <div className={`${color} mb-2`}>{icon}</div>
    <div className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{label}</div>
    <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
  </div>
);

export default Dashboard;