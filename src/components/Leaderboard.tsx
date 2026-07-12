import React, { useState, useEffect } from 'react';
import { Trophy, Search, Sparkles, Flame, User, Swords, Zap, HelpCircle } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { getGoogleSheetData } from '../data';

interface LeaderboardProps {
  onStartPlaying: () => void;
  isLoggedIn: boolean;
}

export default function Leaderboard({ onStartPlaying, isLoggedIn }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setEntries(getGoogleSheetData());
  }, []);

  // Filter list in real-time
  const filteredEntries = entries.filter((entry) =>
    entry.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.characterSelected.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Derive stats
  const totalPlayers = entries.length;
  const maxScore = entries.length > 0 ? Math.max(...entries.map((e) => e.highScore)) : 0;
  const highestLevel = entries.length > 0 ? Math.max(...entries.map((e) => e.progressLevel)) : 0;

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Welcome & Banner section with Shimmer/Glint effect */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/60 shadow-md glint-effect">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">
            <Flame className="w-4 h-4 text-orange-600 animate-pulse" />
            <span>สมรภูมิคณิตศาสตร์ท้าน้ำลาวาสุดระทึก!</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-none">
            Lava Cat <span className="text-orange-600">Math Survival</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
            ยินดีต้อนรับสู่แดนภูเขาไฟคณิตศาสตร์! เหล่าแก๊งน้องแมวเผลอขึ้นมาเดินเล่นบนหอคอยอิฐแล้วเกิดภูเขาไฟระเบิดพ่นลาวาเดือดพล่านขึ้นมา! 
            ทางรอดเดียวคือคุณต้องช่วยน้องแมวแก้โจทย์เลขคณิตศาสตร์ให้รวดเร็วที่สุดเพื่อสร้างอิฐหนีน้ำลาวาที่กำลังสูงขึ้นอย่างต่อเนื่อง!
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onStartPlaying}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-sm transition-all shadow-md hover:shadow-lg hover:shadow-orange-200 flex items-center space-x-2 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>{isLoggedIn ? 'ท้าทายตะลุยด่านเลย!' : 'เข้าสู่ระบบแล้วลุยกันเลย!'}</span>
            </button>
            
            <div className="px-4 py-3 rounded-xl bg-white/40 border border-white/50 text-xs text-slate-700 font-semibold flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>ตอบถูกภายใน 2 วินาทีแรก รับโบนัสบล็อกสูงสุด +6 ชั้น!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/50 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-700">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ผู้รอดชีวิตทั้งหมด</p>
            <p className="text-lg font-black text-slate-800">{totalPlayers} คน</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/50 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 rounded-xl text-amber-700">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">คะแนนสูงสุดในเซิร์ฟเวอร์</p>
            <p className="text-lg font-black text-slate-800">{maxScore} PTS</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/50 flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-xl text-red-700 animate-pulse">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">เลเวลอันตรายสูงสุด</p>
            <p className="text-lg font-black text-slate-800">เลเวล {highestLevel}</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/60 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-amber-500 fill-amber-100" />
            <h3 className="text-lg font-extrabold text-slate-800">
              ทำเนียบน้องแมวผู้รอดชีวิตสูงสุด (Leaderboard)
            </h3>
          </div>

          {/* Search bar with real-time filtering */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="ค้นหารายชื่อผู้เล่น หรือพันธุ์แมว..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white/50 focus:bg-white border border-slate-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/50 rounded-xl outline-none transition-all placeholder:text-slate-400 font-sans font-medium"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 text-slate-600 text-xs font-bold tracking-wider uppercase border-b border-white/60">
                <th className="px-6 py-4 text-center w-20">อันดับ</th>
                <th className="px-6 py-4">ผู้รอดชีวิต</th>
                <th className="px-6 py-4">สายพันธุ์น้องแมว</th>
                <th className="px-6 py-4 text-right">คะแนนสูงสุด</th>
                <th className="px-6 py-4 text-center">ระดับความยาก</th>
                <th className="px-6 py-4 text-center">เวลาบันทึกสถิติล่าสุด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 font-medium italic">
                    {searchTerm ? '🔍 ไม่พบข้อมูลที่ค้นหา ลองค้นหาใหม่อีกครั้ง' : 'ยังไม่มีผู้รอดชีวิตร่วมทำสถิติเลย...'}
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry, index) => {
                  const originalIndex = entries.findIndex((e) => e.id === entry.id);
                  const rank = originalIndex !== -1 ? originalIndex + 1 : index + 1;
                  
                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-white/40 transition-all font-medium text-slate-700 text-sm ${
                        rank === 1 ? 'bg-amber-100/30 font-semibold' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="px-6 py-4 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-amber-900 font-bold text-sm shadow-md animate-bounce">
                            🥇
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-slate-800 font-bold text-sm shadow-sm">
                            🥈
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-600/30 text-amber-900 font-bold text-sm shadow-xs">
                            🥉
                          </span>
                        ) : (
                          <span className="font-bold text-slate-500">{rank}</span>
                        )}
                      </td>

                      {/* Name Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <span className="font-extrabold text-slate-800 text-base">{entry.fullName}</span>
                          {rank <= 3 && <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />}
                        </div>
                      </td>

                      {/* Cat selected Column */}
                      <td className="px-6 py-4">
                        <span className="bg-white/60 border border-white/80 px-2.5 py-1 rounded-full text-xs font-bold text-slate-700 flex items-center w-fit">
                          {entry.characterSelected}
                        </span>
                      </td>

                      {/* High Score Column */}
                      <td className="px-6 py-4 text-right font-extrabold text-base text-blue-700 font-mono">
                        {entry.highScore} <span className="text-xs font-bold text-slate-400 font-sans">PTS</span>
                      </td>

                      {/* Progress Level Column */}
                      <td className="px-6 py-4 text-center">
                        <span className="bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1 rounded-full text-xs font-black">
                          Lv. {entry.progressLevel}
                        </span>
                      </td>

                      {/* Date/Time Column */}
                      <td className="px-6 py-4 text-center text-xs text-slate-400 font-mono">
                        {entry.timestamp}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
