import React, { useState, useEffect } from 'react';
import { CAT_CHARACTERS } from './data';
import { UserAccount } from './types';
import Sidebar from './components/Sidebar';
import Leaderboard from './components/Leaderboard';
import LoginRegister from './components/LoginRegister';
import MathGame from './components/MathGame';
import MockGoogleSheet from './components/MockGoogleSheet';
import { Sparkles, Gamepad2, AlertCircle, Database, HelpCircle, User } from 'lucide-react';
import Swal from 'sweetalert2';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('leaderboard');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [appLoading, setAppLoading] = useState<boolean>(true);

  // Initialize and load any active session from LocalStorage
  useEffect(() => {
    // Simulated startup loading overlay (1.5s)
    const timer = setTimeout(() => {
      setAppLoading(false);
      
      const savedSession = localStorage.getItem('lava_cat_current_session');
      if (savedSession) {
        try {
          const userObj = JSON.parse(savedSession);
          setCurrentUser(userObj);
          setActiveTab('game'); // Take logged in user directly to game
          
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: `ยินดีต้อนรับกลับมา คุณ ${userObj.fullName}!`,
            showConfirmButton: false,
            timer: 2500
          });
        } catch (e) {
          console.error(e);
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Handle Login / Registration Success
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('lava_cat_current_session', JSON.stringify(user));
    setActiveTab('game'); // Direct to play area
  };

  // Handle Logout
  const handleLogout = () => {
    Swal.fire({
      title: 'คุณต้องการออกจากระบบหรือไม่?',
      text: "เซสชันปัจจุบันจะถูกยกเลิก แต่ประวัติคะแนนของคุณจะยังถูกบันทึกอยู่ในตารางอันดับและ Google Sheet!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('lava_cat_current_session');
        setCurrentUser(null);
        setActiveTab('leaderboard'); // Go back to scoreboard
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'ออกจากระบบเรียบร้อย!',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  };

  const selectedCat = currentUser
    ? CAT_CHARACTERS.find((c) => c.id === currentUser.characterId) || null
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50/50 text-slate-800 font-sans relative overflow-hidden flex flex-col">
      
      {/* 1. CLOUD EMISSION / FLOATING BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-10 left-[5%] text-5xl opacity-20 animate-float-slow">☁️</div>
        <div className="absolute top-36 left-[30%] text-6xl opacity-25 animate-float-medium">☁️</div>
        <div className="absolute top-20 left-[60%] text-4xl opacity-15 animate-float-fast">☁️</div>
        <div className="absolute top-48 left-[80%] text-5xl opacity-20 animate-float-slow">☁️</div>
        <div className="absolute top-80 left-[15%] text-5xl opacity-15 animate-float-medium">☁️</div>
        <div className="absolute top-96 left-[70%] text-6xl opacity-20 animate-float-fast">☁️</div>
      </div>

      {/* 2. APP INITIAL LOADING OVERLAY */}
      {appLoading && (
        <div className="fixed inset-0 bg-gradient-to-b from-sky-100 to-amber-100 z-50 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce">
              🐱🌋
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
              LAVA CAT MATH SURVIVAL
            </h2>
            <p className="text-xs font-bold text-orange-600 tracking-wider uppercase animate-pulse">
              กำลังดาวน์โหลดข้อมูลแมว & เชื่อมสเปรดชีต...
            </p>
            <div className="w-48 h-1 bg-slate-200 rounded-full mx-auto overflow-hidden border border-slate-300">
              <div className="h-full bg-orange-500 rounded-full animate-[shimmer_1.5s_infinite_linear]" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}

      {/* 3. CORE FRAMEWORK STRUCTURE */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 gap-6 relative z-10">
        
        {/* Left Sidebar Navigation and Information panel */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          selectedCat={selectedCat}
          onLogout={handleLogout}
        />

        {/* Right Content Panels */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 bg-white/20 backdrop-blur-md rounded-3xl border border-white/40 p-4 sm:p-6 md:p-8 shadow-xl flex flex-col justify-start relative overflow-hidden">
            
            {/* Displaying tab views */}
            {activeTab === 'leaderboard' && (
              <Leaderboard
                onStartPlaying={() => {
                  if (currentUser) {
                    setActiveTab('game');
                  } else {
                    setActiveTab('login');
                  }
                }}
                isLoggedIn={currentUser !== null}
              />
            )}

            {activeTab === 'login' && !currentUser && (
              <LoginRegister onLoginSuccess={handleLoginSuccess} />
            )}

            {activeTab === 'game' && currentUser && (
              <MathGame
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                onGameFinished={() => {
                  setActiveTab('leaderboard'); // Go back to leaderboard on finish
                }}
              />
            )}

            {activeTab === 'sheet' && (
              <MockGoogleSheet />
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}
