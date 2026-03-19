import React, { useState } from 'react';
import { fetchAnalysis } from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Search, Github, ShieldCheck, Activity, Star, Zap, Anchor, Target, Hexagon } from 'lucide-react';

const COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4'];

// Helper to format the "Last Seen" timestamp
const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
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
      setData(result);
    } catch (err) {
      alert("User not found!");
    }
    setLoading(false);
  };

  const chartData = data ? Object.entries(data.stats.languages).map(([name, value]) => ({ name, value })) : [];

  const achievementsList = [
    { name: "Pull Shark", icon: <Anchor size={14}/>, color: "text-blue-400" },
    { name: "Quickdraw", icon: <Zap size={14}/>, color: "text-amber-400" },
    { name: "Starstruck", icon: <Star size={14}/>, color: "text-yellow-400" },
    { name: "Galaxy Brain", icon: <Target size={14}/>, color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-zinc-800">
      
      {/* 1. HERO SECTION */}
      <div className={`flex flex-col items-center justify-center transition-all duration-1000 ${data ? 'pt-8 pb-6' : 'pt-32 pb-12'}`}>
        <div className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3 justify-center">
                <Github size={40} /> GitAnalytics
            </h1>
            <p className="text-zinc-500 mt-3 font-medium tracking-wide">Professional GitHub Insights & Health Metrics</p>
        </div>

        <div className="w-full max-w-lg px-6">
            <div className="relative flex bg-zinc-900/50 border border-zinc-800 rounded-full p-1 focus-within:border-zinc-700 transition-colors">
                <input 
                    className="w-full bg-transparent pl-6 pr-4 py-3 outline-none text-zinc-200 placeholder:text-zinc-600 font-medium text-sm"
                    placeholder="Search GitHub username..."
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                    onClick={handleSearch}
                    className="bg-zinc-100 hover:bg-white text-black px-8 py-2 rounded-full font-bold transition-all text-xs"
                >
                    {loading ? "..." : "ANALYZE"}
                </button>
            </div>
        </div>
      </div>

      {data && (
        <div className="max-w-6xl mx-auto px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 2. PROFILE SIDEBAR */}
            <div className="lg:col-span-4">
              <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl flex flex-col items-start relative overflow-hidden">
                
                <div className="relative mb-6">
                    <img src={data.profile.avatar} className="w-28 h-28 rounded-full border border-zinc-800 p-1 object-cover" alt="avatar" />
                    {data.profile.is_pro && (
                        <div className="absolute top-0 -right-2 bg-white text-black text-[9px] font-black px-2 py-0.5 rounded border border-black uppercase tracking-tighter shadow-xl z-20">
                            @Pro
                        </div>
                    )}
                </div>

                <h2 className="text-2xl font-bold text-white tracking-tight">{data.profile.username}</h2>
                <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
                  {data.profile.bio || "No bio available."}
                </p>

                {/* FOLLOWER & ORG & ACTIVITY SECTION */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                        <span className="text-xs font-black text-white">{data.profile.followers}</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Followers</span>
                    </div>

                    {data.profile.organization && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/20 rounded-full border border-blue-800/30">
                            <ShieldCheck size={12} className="text-blue-400" />
                            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-tight">
                                {data.profile.organization.replace('@', '')}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                        <Activity size={12} className="text-emerald-500" />
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                            Active {formatTimeAgo(data.profile.last_active)}
                        </span>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-zinc-900 my-8"></div>

                <div className="w-full space-y-3">
                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Achievements</div>
                    {achievementsList
                        .filter(ach => data.stats.achievements.includes(ach.name))
                        .map(ach => (
                            <div key={ach.name} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-in fade-in zoom-in duration-500">
                                <div className={`${ach.color} bg-zinc-900 p-2 rounded-lg`}>{ach.icon}</div>
                                <span className="text-xs font-bold text-zinc-300">{ach.name}</span>
                            </div>
                        ))
                    }
                    {data.stats.achievements.length === 0 && (
                        <p className="text-zinc-700 text-xs italic">No achievements unlocked yet.</p>
                    )}
                </div>
              </div>
            </div>

            {/* 3. MAIN DASHBOARD AREA */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <StatCard icon={<ShieldCheck size={18}/>} label="Health" value={`${data.stats.health_score}%`} />
                 <StatCard icon={<Star size={18}/>} label="Stars" value={data.stats.total_stars} />
                 <StatCard icon={<Activity size={18}/>} label="Repos" value={data.stats.repo_count} />
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl">
                 <h3 className="text-xs font-black text-zinc-500 mb-8 flex items-center gap-2 italic uppercase tracking-[0.2em]">
                    <Hexagon size={16} className="text-zinc-700"/> Tech Stack Distribution
                 </h3>
                 <div className="h-72 w-full">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={chartData} innerRadius={70} outerRadius={100} paddingAngle={6} dataKey="value" stroke="none">
                          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '11px' }} />
                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="rect" formatter={(value) => <span className="text-zinc-400 text-xs font-bold ml-2">{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col gap-1 transition-all hover:bg-zinc-900/40 hover:border-zinc-800 group">
    <div className="text-zinc-600 mb-1 group-hover:text-zinc-400 transition-colors">{icon}</div>
    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">{label}</div>
    <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
  </div>
);

export default Dashboard;