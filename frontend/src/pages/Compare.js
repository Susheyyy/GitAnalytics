import React, { useState } from 'react';
import { fetchAnalysis } from '../utils/api';
import { GitCompare, Trophy, Star, Activity, Flame, ShieldCheck, ArrowLeft, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Compare = () => {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!user1 || !user2) return;
    setLoading(true);
    try {
      const [res1, res2] = await Promise.all([
        fetchAnalysis(user1),
        fetchAnalysis(user2)
      ]);
      setData1(res1);
      setData2(res2);
    } catch (err) {
      alert("Error fetching one or both users.");
    }
    setLoading(false);
  };

  const getWinner = (val1, val2) => {
    const v1 = parseFloat(val1) || 0;
    const v2 = parseFloat(val2) || 0;
    if (v1 > v2) return "left";
    if (v2 > v1) return "right";
    return "draw";
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 uppercase text-[10px] font-black tracking-[0.2em] italic">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-black italic tracking-tighter mb-4 flex items-center justify-center gap-4 text-white">
          <GitCompare size={40} className="text-emerald-500" /> VERSUS
        </h1>
        
        {/* Input Duo */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <input 
            className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm w-64 text-white"
            placeholder="User One"
            value={user1}
            onChange={(e) => setUser1(e.target.value)}
          />
          <span className="text-zinc-700 font-black italic">VS</span>
          <input 
            className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm w-64 text-white"
            placeholder="User Two"
            value={user2}
            onChange={(e) => setUser2(e.target.value)}
          />
          <button 
            onClick={handleCompare}
            disabled={loading}
            className="bg-white text-black px-8 py-3 rounded-2xl font-black text-xs hover:bg-emerald-500 hover:text-white transition-all ml-4 disabled:opacity-50"
          >
            {loading ? "ANALYZING..." : "BATTLE"}
          </button>
        </div>
      </div>

      {data1 && data2 && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* User 1 Column */}
          <UserBrief data={data1} align="right" />

          {/* Comparison Stats */}
          <div className="space-y-3 py-4">
            <CompRow 
              label="Git Score" 
              val1={data1.stats.git_score} 
              val2={data2.stats.git_score} 
              winner={getWinner(data1.stats.git_score, data2.stats.git_score)}
              suffix="%"
            />
            <CompRow 
              label="Total Stars" 
              val1={data1.stats.total_stars} 
              val2={data2.stats.total_stars} 
              winner={getWinner(data1.stats.total_stars, data2.stats.total_stars)}
            />
            <CompRow 
              label="Avg Stars/Repo" 
              val1={(data1.stats.total_stars / (data1.stats.repo_count || 1)).toFixed(1)} 
              val2={(data2.stats.total_stars / (data2.stats.repo_count || 1)).toFixed(1)} 
              winner={getWinner(data1.stats.total_stars / (data1.stats.repo_count || 1), data2.stats.total_stars / (data2.stats.repo_count || 1))}
            />
            <CompRow 
              label="Public Repos" 
              val1={data1.stats.repo_count} 
              val2={data2.stats.repo_count} 
              winner={getWinner(data1.stats.repo_count, data2.stats.repo_count)}
            />
            <CompRow 
              label="Followers" 
              val1={data1.profile.followers} 
              val2={data2.profile.followers} 
              winner={getWinner(data1.profile.followers, data2.profile.followers)}
            />
            <CompRow 
              label="Current Streak" 
              val1={data1.profile.streak} 
              val2={data2.profile.streak} 
              winner={getWinner(data1.profile.streak, data2.profile.streak)}
              suffix="d"
            />
          </div>

          {/* User 2 Column */}
          <UserBrief data={data2} align="left" />
        </div>
      )}
    </div>
  );
};

const UserBrief = ({ data, align }) => (
  <div className={`flex flex-col items-center ${align === 'right' ? 'md:items-end' : 'md:items-start'} gap-4`}>
    <div className="relative group">
        <img 
            src={data.profile.avatar} 
            className="w-32 h-32 rounded-[32px] border-4 border-zinc-900 shadow-2xl relative z-10 object-cover" 
            alt="pfp" 
        />
        <div className="absolute -inset-2 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className={`text-center ${align === 'right' ? 'md:text-right' : 'md:text-left'}`}>
      <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">
        {data.profile.name || data.profile.username}
      </h2>
      <p className="text-emerald-500 font-bold text-sm font-mono">@{data.profile.username}</p>
    </div>
  </div>
);

const CompRow = ({ label, val1, val2, winner, suffix = "" }) => (
  <div className="bg-zinc-950 border border-zinc-900/50 p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden group transition-all hover:bg-zinc-900/30">
    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center italic">{label}</span>
    <div className="flex justify-between items-center px-4 relative z-10">
      <span className={`text-xl font-black italic transition-all ${winner === 'left' ? 'text-emerald-500 scale-110' : 'text-zinc-600'}`}>
        {val1}{suffix}
      </span>
      <div className="h-1 w-1 rounded-full bg-zinc-800" />
      <span className={`text-xl font-black italic transition-all ${winner === 'right' ? 'text-emerald-500 scale-110' : 'text-zinc-600'}`}>
        {val2}{suffix}
      </span>
    </div>
    {/* Victory Glow Indicator */}
    {winner !== 'draw' && (
        <div className={`absolute top-0 bottom-0 w-1 transition-all duration-500 ${winner === 'left' ? 'left-0 bg-emerald-500' : 'right-0 bg-emerald-500'}`} />
    )}
  </div>
);

export default Compare;