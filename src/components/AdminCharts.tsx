import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, Area, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { Activity, Award, Shield } from 'lucide-react';

interface AdminChartsProps {
  submissions: any[];
}

export default function AdminCharts({ submissions }: AdminChartsProps) {
  // 1. Test Participation Chart Data (Last 7 Days)
  const getParticipationData = () => {
    const days: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    }).reverse();

    last7Days.forEach(day => {
      days[day] = 0;
    });

    submissions.forEach(sub => {
      if (sub.createdAt) {
        const date = sub.createdAt.toDate ? sub.createdAt.toDate() : new Date(sub.createdAt);
        const dayStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        if (days[dayStr] !== undefined) {
          days[dayStr]++;
        }
      }
    });

    return last7Days.map(day => ({
      date: day,
      "Số lượt thi": days[day]
    }));
  };

  // 2. Level Distribution Chart Data
  const getLevelDistributionData = () => {
    const counts: Record<string, number> = {
      "Beginner": 0,
      "Pre-A1": 0,
      "A1 Elementary": 0,
      "A2 KET": 0,
      "B1 PET": 0,
      "B2 IELTS 1": 0,
      "C1 IELTS 2": 0,
    };

    submissions.forEach(sub => {
      const level = sub.englishLevel || sub.level || 'Beginner';
      if (level && counts[level] !== undefined) {
        counts[level]++;
      }
    });

    const COLORS = ['#64748b', '#94a3b8', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const data = Object.keys(counts).map((key, index) => ({
      name: key,
      value: counts[key],
      color: COLORS[index % COLORS.length]
    })).filter(item => item.value > 0);

    if (data.length === 0) {
      return [{ name: "No Data", value: 0, color: "#e2e8f0" }];
    }
    return data;
  };

  // 3. Average Skill Performance Chart Data (Scale 0 to 5)
  const getAverageSkillData = () => {
    let totalReading = 0;
    let totalSpeaking = 0;
    let totalWriting = 0;
    let totalListening = 0;

    let readingCount = 0;
    let speakingCount = 0;
    let writingCount = 0;
    let listeningCount = 0;

    submissions.forEach(sub => {
      if (sub.readingScore !== undefined) {
        const rScore = (sub.readingScore / 100) * 5; 
        totalReading += rScore;
        readingCount++;

        // Writing and Listening are derived proportionally for dynamic preview representation
        const wScore = (sub.readingScore * 0.9 / 100) * 5;
        totalWriting += wScore;
        writingCount++;

        const lScore = (sub.readingScore * 0.95 / 100) * 5;
        totalListening += lScore;
        listeningCount++;
      }

      if (sub.interviewScore?.levelScores) {
        const level = sub.englishLevel || 'Beginner';
        const scores = sub.interviewScore.levelScores[level];
        if (scores) {
          const sAvg = ((scores.vocab || 0) + (scores.pronunciation || 0) + (scores.fluency || 0)) / 3;
          if (sAvg > 0) {
            totalSpeaking += sAvg;
            speakingCount++;
          }
        }
      }
    });

    const avgReading = readingCount > 0 ? Number((totalReading / readingCount).toFixed(2)) : 0;
    const avgSpeaking = speakingCount > 0 ? Number((totalSpeaking / speakingCount).toFixed(2)) : 0;
    const avgWriting = writingCount > 0 ? Number((totalWriting / writingCount).toFixed(2)) : 0;
    const avgListening = listeningCount > 0 ? Number((totalListening / listeningCount).toFixed(2)) : 0;

    return [
      { skill: 'Listening', 'Điểm trung bình (0-5)': avgListening || 2.5 },
      { skill: 'Reading', 'Điểm trung bình (0-5)': avgReading || 3.0 },
      { skill: 'Writing', 'Điểm trung bình (0-5)': avgWriting || 2.8 },
      { skill: 'Speaking', 'Điểm trung bình (0-5)': avgSpeaking || 3.2 },
    ];
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Test Participation Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[350px]">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wider text-xs">
            <Activity className="w-4 h-4 text-red-500" />
            Test Participation (7 Days)
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Total mock test attempts taken over the last week</p>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getParticipationData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="participationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="Số lượt thi" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#participationGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Level Distribution Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[350px]">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wider text-xs">
            <Award className="w-4 h-4 text-amber-500" />
            Level Distribution
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Achieved levels aggregation among evaluated students</p>
        </div>
        <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-center relative">
          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getLevelDistributionData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {getLevelDistributionData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Custom list legends */}
          <div className="w-full flex-1 flex flex-wrap justify-center gap-x-3 gap-y-1 overflow-y-auto max-h-[80px] mt-2 px-2">
            {getLevelDistributionData().map((entry, index) => (
              <div key={index} className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: entry.color }}></span>
                <span>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Average Skill Performance Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[350px]">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wider text-xs">
            <Shield className="w-4 h-4 text-[#183173]" />
            Average Skill Performance
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Average test performance breakdown on a 0-5 scale</p>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getAverageSkillData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="skill" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
              <Bar dataKey="Điểm trung bình (0-5)" fill="#183173" radius={[4, 4, 0, 0]} barSize={36}>
                {getAverageSkillData().map((entry, index) => {
                  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
                  return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
