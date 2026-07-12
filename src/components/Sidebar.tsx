import React from 'react';
import { Trophy, Gamepad2, Database, LogOut, HelpCircle, Flame, Heart } from 'lucide-react';
import { CatCharacter, UserAccount } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserAccount | null;
  selectedCat: CatCharacter | null;
  onLogout: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  selectedCat,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="w-full md:w-80 flex flex-col glass-panel border-r border-white/40 h-auto md:h-full justify-between p-6 shrink-0 relative overflow-hidden glint-effect rounded-2xl md:rounded-none">
      {/* Background soft glow */}
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-8 relative z-10">
        {/* Brand/Logo Header */}
        <div className="flex items-center space-x-3 bg-white/40 p-3 rounded-2xl border border-white/50 shadow-xs">
          <div className="p-2 bg-gradient-to-br from-red-500 to-amber-500 rounded-xl text-white shadow-md animate-bounce">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight leading-tight">
              Lava Cat
            </h1>
            <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
              Math Survival
            </span>
          </div>
        </div>

        {/* User Status Card */}
        {currentUser && (
          <div className="bg-white/50 backdrop-blur-xs p-4 rounded-2xl border border-white/60 shadow-xs space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl filter drop-shadow-md animate-pulse">
                {selectedCat?.emoji || '🐱'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">ผู้เล่นที่ล็อกอิน</p>
                <h3 className="text-sm font-bold text-slate-800 truncate">{currentUser.fullName}</h3>
              </div>
            </div>
            
            <div className="pt-2 border-t border-white/40 grid grid-cols-2 gap-2 text-center">
              <div className="bg-amber-100/60 p-1.5 rounded-lg">
                <p className="text-[10px] font-bold text-amber-700">คะแนนสูงสุด</p>
                <p className="text-xs font-extrabold text-amber-800">{currentUser.highScore} PTS</p>
              </div>
              <div className="bg-sky-100/60 p-1.5 rounded-lg">
                <p className="text-[10px] font-bold text-sky-700">เลเวลสูงสุด</p>
                <p className="text-xs font-extrabold text-sky-800">Lv. {currentUser.progressLevel}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menus */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600 tracking-wider uppercase px-2 mb-2">เมนูหลัก / NAVIGATION</p>
          
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-white shadow-md scale-102 font-bold'
                : 'text-slate-700 hover:bg-white/40 hover:text-slate-950 hover:scale-102'
            }`}
          >
            <Trophy className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <div>อันดับนักเอาตัวรอด</div>
              <p className="text-[10px] opacity-80 font-normal">ตารางคะแนนสูงสุดแบบเรียลไทม์</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                // Return to login
                setActiveTab('login');
              } else {
                setActiveTab('game');
              }
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
              activeTab === 'game' || activeTab === 'login'
                ? 'bg-emerald-500 text-white shadow-md scale-102 font-bold'
                : 'text-slate-700 hover:bg-white/40 hover:text-slate-950 hover:scale-102'
            }`}
          >
            <Gamepad2 className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <div>{currentUser ? 'สมรภูมิตะลุยคำนวณ' : 'เข้าสู่ระบบ / ลงทะเบียน'}</div>
              <p className="text-[10px] opacity-80 font-normal">
                {currentUser ? 'เริ่มเล่นเกมคิดเลขหนีลาวา' : 'กรอกชื่อและเลือกตัวละครแมว'}
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('sheet')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
              activeTab === 'sheet'
                ? 'bg-blue-600 text-white shadow-md scale-102 font-bold'
                : 'text-slate-700 hover:bg-white/40 hover:text-slate-950 hover:scale-102'
            }`}
          >
            <Database className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <div>ฐานข้อมูล Google Sheets</div>
              <p className="text-[10px] opacity-80 font-normal">จำลองเชื่อมต่อ Spreadsheet</p>
            </div>
          </button>
        </div>

        {/* How to Play Section */}
        <div className="bg-white/40 p-4 rounded-2xl border border-white/40 space-y-3">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-orange-600" />
            <span>กติกาการเอาตัวรอด 🌋</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
            <li>ลาวาจะสูงขึ้นสุ่ม <strong className="text-red-600">1-5 บล็อก</strong> ทุกๆ ข้อ</li>
            <li>ตอบถูกเพื่อเพิ่มบล็อกอิฐยืนหนีน้ำลาวา</li>
            <li>
              <strong>ตอบเร็วได้เปรียบ!</strong>
              <div className="ml-4 mt-1 text-[11px] space-y-0.5 text-slate-600">
                <p>⚡ 1-2 วินาที: <strong className="text-emerald-700">+6 บล็อก</strong></p>
                <p>⚡ 3 วินาที: <strong className="text-blue-700">+4 บล็อก</strong></p>
                <p>⚡ 4-5 วินาที: <strong className="text-amber-700">+2 บล็อก</strong></p>
              </div>
            </li>
            <li>จำกัดเวลาข้อละ <strong className="text-red-600">5 วินาที</strong> เท่านั้น!</li>
            <li>ถ้าลาวาสูงจนท่วมถึงพี่แมว = <strong className="text-red-700 font-bold">GAME OVER!</strong></li>
          </ul>
        </div>
      </div>

      <div className="mt-8 space-y-4 relative z-10">
        {currentUser && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white py-2.5 px-4 rounded-xl font-bold transition-all shadow-sm hover:shadow-md cursor-pointer text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ / LOGOUT</span>
          </button>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t border-white/20">
          <p className="text-[11px] font-bold text-slate-500 tracking-wide flex items-center justify-center gap-1">
            <span>© 2026 Copyright</span>
            <span>|</span>
            <span>พัฒนาโดย Mama</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </aside>
  );
}
