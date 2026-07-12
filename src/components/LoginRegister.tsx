import React, { useState } from 'react';
import { User, Lock, Heart, Swords, Sparkles, AlertCircle } from 'lucide-react';
import { CAT_CHARACTERS } from '../data';
import { CatCharacter, UserAccount } from '../types';
import Swal from 'sweetalert2';

interface LoginRegisterProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export default function LoginRegister({ onLoginSuccess }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(CAT_CHARACTERS[0].id);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน',
        confirmButtonColor: '#f97316'
      });
      return;
    }

    if (!isLogin && !fullName.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกชื่อ-นามสกุลจริง',
        confirmButtonColor: '#f97316'
      });
      return;
    }

    setLoading(true);

    // Simulate database saving / delay for premium loading feel
    setTimeout(() => {
      setLoading(false);
      
      const storedUsersRaw = localStorage.getItem('lava_cat_users_mock');
      const users: (UserAccount & { password?: string })[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

      if (isLogin) {
        // Handle Login
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password);
        if (user) {
          onLoginSuccess({
            username: user.username,
            fullName: user.fullName,
            characterId: user.characterId,
            highScore: user.highScore || 0,
            progressLevel: user.progressLevel || 1
          });
          
          Swal.fire({
            icon: 'success',
            title: 'เข้าสู่ระบบสำเร็จ!',
            text: `ยินดีต้อนรับกลับมา, คุณ ${user.fullName}!`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เข้าสู่ระบบล้มเหลว',
            text: 'ไม่พบชื่อผู้ใช้นี้ หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง หรือสมัครสมาชิกใหม่',
            confirmButtonColor: '#f97316'
          });
        }
      } else {
        // Handle Register
        const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase().trim());
        if (userExists) {
          Swal.fire({
            icon: 'warning',
            title: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว',
            text: 'กรุณาใช้ชื่อผู้ใช้อื่นในการลงทะเบียนใหม่',
            confirmButtonColor: '#f97316'
          });
          return;
        }

        const newUser = {
          username: username.trim(),
          password: password,
          fullName: fullName.trim(),
          characterId: selectedCatId,
          highScore: 0,
          progressLevel: 1
        };

        users.push(newUser);
        localStorage.setItem('lava_cat_users_mock', JSON.stringify(users));

        onLoginSuccess({
          username: newUser.username,
          fullName: newUser.fullName,
          characterId: newUser.characterId,
          highScore: newUser.highScore,
          progressLevel: newUser.progressLevel
        });

        Swal.fire({
          icon: 'success',
          title: 'สมัครสมาชิกสำเร็จ!',
          text: `ยินดีต้อนรับเข้าสู่อาณาจักรเอาชีวิตรอด, คุณ ${newUser.fullName}!`,
          timer: 2500,
          showConfirmButton: false
        });
      }
    }, 1200);
  };

  const selectedCat = CAT_CHARACTERS.find(c => c.id === selectedCatId) || CAT_CHARACTERS[0];

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row glass-panel rounded-3xl border border-white/60 shadow-xl overflow-hidden relative min-h-[500px] animate-fade-in">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl animate-pulse">🐱</span>
          </div>
          <div className="text-center space-y-1">
            <p className="text-lg font-extrabold tracking-wide">กำลังเตรียมสมรภูมิรบ...</p>
            <p className="text-xs text-slate-300">กำลังประมวลผลเซฟข้อมูลผู้เล่นของคุณ</p>
          </div>
        </div>
      )}

      {/* Decorative Visual side banner */}
      <div className="w-full md:w-5/12 bg-gradient-to-br from-orange-500 via-amber-500 to-red-600 p-8 flex flex-col justify-between text-white relative overflow-hidden shrink-0">
        {/* Lava effects */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-red-800/40 to-transparent pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          <span className="bg-white/20 border border-white/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            STORY PREVIEW 🌋
          </span>
          
          <h2 className="text-2xl font-black tracking-tight leading-none">
            ช่วยน้องแมวให้รอดชีวิตจากกองเพลิงลาวา!
          </h2>
          
          <p className="text-xs text-amber-50/90 leading-relaxed font-medium">
            พวกเราเดินเพลินในวิหารโบราณ จู่ๆ แผ่นดินก็ไหวจนลาวาปะทุขึ้นมา! 
            ความรู้คณิตศาสตร์ของคุณเท่านั้นที่จะเป็นกุญแจสำคัญในการยกหอคอยบล็อกอิฐพาน้องแมวขึ้นสูงให้พ้นภัย!
          </p>
        </div>

        {/* Selected character spotlight preview */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mt-6 relative z-10 text-center space-y-3 shadow-inner">
          <p className="text-xs font-bold text-amber-200 uppercase tracking-widest">พรีวิวตัวละครที่เลือก</p>
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center text-5xl filter drop-shadow-md animate-bounce">
            {selectedCat.emoji}
          </div>
          <div>
            <h4 className="text-sm font-extrabold">{selectedCat.name}</h4>
            <p className="text-[10px] text-amber-100 font-semibold">{selectedCat.breed}</p>
          </div>
          <p className="text-[11px] text-white/90 italic leading-snug px-2">
            "{selectedCat.description}"
          </p>
          <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-1 text-[10px]">
            <div>
              <p className="text-amber-200 font-bold">ความเร็ว</p>
              <p className="tracking-tighter">{selectedCat.stats.speed}</p>
            </div>
            <div>
              <p className="text-amber-200 font-bold">การกระโดด</p>
              <p className="tracking-tighter">{selectedCat.stats.jump}</p>
            </div>
            <div>
              <p className="text-amber-200 font-bold">ความโชคดี</p>
              <p className="tracking-tighter">{selectedCat.stats.luck}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Form */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center bg-white/40">
        {/* Toggle Form Tabs */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setFullName('');
            }}
            className={`flex-1 py-2 rounded-xl text-sm font-extrabold transition-all duration-300 ${
              isLogin
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            เข้าสู่ระบบ (Login)
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-xl text-sm font-extrabold transition-all duration-300 ${
              !isLogin
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ลงทะเบียนใหม่ (Register)
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span>{isLogin ? 'กรอกบัญชีผู้เล่นเดิม' : 'สมัครสมาชิกร่วมเอาตัวรอด'}</span>
          </h3>

          <div className="space-y-3">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อผู้ใช้ (Username) *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="เช่น somchai_cat"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/60 focus:bg-white border border-slate-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/50 rounded-xl outline-none transition-all text-sm text-slate-800 font-medium"
                />
                <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">รหัสผ่าน (Password) *</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/60 focus:bg-white border border-slate-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/50 rounded-xl outline-none transition-all text-sm text-slate-800 font-medium"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>

            {/* Full Name (For register only) */}
            {!isLogin && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อ-นามสกุลจริง (Full Name) *</label>
                <input
                  type="text"
                  placeholder="เช่น สมชาย รักคณิตดี"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/60 focus:bg-white border border-slate-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/50 rounded-xl outline-none transition-all text-sm text-slate-800 font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">ชื่อนี้จะนำไปบันทึกลง Google Sheet ของห้องเรียน</p>
              </div>
            )}
          </div>

          {/* Character Selection Grid (For Register Only) */}
          {!isLogin && (
            <div className="space-y-2 animate-fade-in">
              <label className="block text-xs font-bold text-slate-600">เลือกตัวละครแมวคู่หูประจำกาย *</label>
              <div className="grid grid-cols-2 gap-2">
                {CAT_CHARACTERS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                      selectedCatId === cat.id
                        ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-400/20 shadow-xs scale-102'
                        : 'bg-white/40 border-slate-200 hover:bg-white/80 hover:scale-101'
                    }`}
                  >
                    <span className="text-3xl filter drop-shadow-sm">{cat.emoji}</span>
                    <div className="min-w-0">
                      <h5 className="text-xs font-extrabold text-slate-800 truncate">{cat.name}</h5>
                      <span className="text-[9px] font-bold text-slate-500">{cat.breed}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tips notification */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-amber-800">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
            <p className="text-[10px] leading-snug font-medium">
              <strong>ข้อมูลจำลอง:</strong> ระบบจะใช้ LocalStorage เพื่อบันทึกข้อมูลตัวละครและคะแนนสูงสุดของผู้เล่นทุกชื่อ 
              ท่านสามารถสมัครสมาชิกชื่อผู้ใช้ใหม่ได้เพื่อลองเปลี่ยนตัวละครแมวตัวอื่นได้ตลอดเวลา!
            </p>
          </div>

          {/* Submit Button with Scale & Shadow deepen effect */}
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg hover:shadow-orange-200 transition-all cursor-pointer"
          >
            <Swords className="w-4.5 h-4.5 animate-pulse" />
            <span>{isLogin ? 'ตกลง เข้าสู่ระบบเดิม' : 'ยืนยันลงทะเบียนและสวมบทบาท'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
