import React, { useState } from 'react';
import { fetchAnalysis } from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Github, ShieldCheck } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
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

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input 
          className="flex-1 p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Enter GitHub Username..."
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
          {loading ? "Analyzing..." : <><Search size={20}/> Analyze</>}
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
            <img src={data.profile.avatar} alt="avatar" className="w-24 h-24 rounded-full border-4 border-blue-500 mb-4" />
            <h2 className="text-2xl font-bold">{data.profile.username}</h2>
            <p className="text-gray-500 mt-2">{data.profile.bio || "No bio available"}</p>
          </div>

          {/* Stats Cards */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 text-blue-500 mb-2">
                <ShieldCheck /> <span className="font-bold uppercase tracking-wider text-sm">Health Score</span>
              </div>
              <div className="text-4xl font-black">{data.stats.health_score}/100</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 text-green-500 mb-2">
                <Github /> <span className="font-bold uppercase tracking-wider text-sm">Total Repos</span>
              </div>
              <div className="text-4xl font-black">{data.stats.repo_count}</div>
            </div>
          </div>

          {/* Languages Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-80">
            <h3 className="font-bold mb-4">Top Languages</h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;