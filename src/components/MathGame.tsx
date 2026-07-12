import React, { useState, useEffect, useRef } from 'react';
import { Flame, Sparkles, HelpCircle, Swords, RotateCcw, Send, AlertTriangle, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { CatCharacter, UserAccount, MathQuestion } from '../types';
import { CAT_CHARACTERS, saveGoogleSheetRow, saveGoogleSheetRowAsync } from '../data';
import Swal from 'sweetalert2';

interface MathGameProps {
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  onGameFinished: () => void;
}

export default function MathGame({ currentUser, setCurrentUser, onGameFinished }: MathGameProps) {
  // Find current cat details
  const selectedCat = CAT_CHARACTERS.find((c) => c.id === currentUser.characterId) || CAT_CHARACTERS[0];

  // Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [catBlocks, setCatBlocks] = useState(8); // height of cat's brick tower in blocks
  const [lavaBlocks, setLavaBlocks] = useState(0); // height of lava in blocks
  const [lavaRiseAmount, setLavaRiseAmount] = useState(0); // randomized rise for current round

  // Question States
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(5.0); // 5 seconds limit
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  // Stats for the current round
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({ text: '', type: null });

  // Refs for tracking time accurately
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Generate math question based on level/score
  const generateMathQuestion = (currentScore: number): MathQuestion => {
    let num1 = 0;
    let num2 = 0;
    let op = '+';
    let correctAnswer = 0;

    // Determine level from score
    let currentLevel = 1;
    if (currentScore >= 350) currentLevel = 5;
    else if (currentScore >= 220) currentLevel = 4;
    else if (currentScore >= 120) currentLevel = 3;
    else if (currentScore >= 50) currentLevel = 2;

    setLevel(currentLevel);

    if (currentLevel === 1) {
      // Level 1: Simple Addition/Subtraction under 10
      op = Math.random() > 0.5 ? '+' : '-';
      if (op === '+') {
        num1 = Math.floor(Math.random() * 8) + 1;
        num2 = Math.floor(Math.random() * 8) + 1;
        correctAnswer = num1 + num2;
      } else {
        num1 = Math.floor(Math.random() * 9) + 2;
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // avoid negative
        correctAnswer = num1 - num2;
      }
    } else if (currentLevel === 2) {
      // Level 2: Addition/Subtraction under 30 & Multiplication under 5x5
      const roll = Math.random();
      if (roll < 0.4) {
        op = '+';
        num1 = Math.floor(Math.random() * 20) + 5;
        num2 = Math.floor(Math.random() * 20) + 5;
        correctAnswer = num1 + num2;
      } else if (roll < 0.8) {
        op = '-';
        num1 = Math.floor(Math.random() * 25) + 10;
        num2 = Math.floor(Math.random() * 15) + 1;
        correctAnswer = num1 - num2;
      } else {
        op = '×';
        num1 = Math.floor(Math.random() * 4) + 2;
        num2 = Math.floor(Math.random() * 5) + 1;
        correctAnswer = num1 * num2;
      }
    } else if (currentLevel === 3) {
      // Level 3: Addition/Subtraction under 100, Multiplication under 9x9
      const roll = Math.random();
      if (roll < 0.3) {
        op = '+';
        num1 = Math.floor(Math.random() * 60) + 15;
        num2 = Math.floor(Math.random() * 40) + 10;
        correctAnswer = num1 + num2;
      } else if (roll < 0.6) {
        op = '-';
        num1 = Math.floor(Math.random() * 80) + 20;
        num2 = Math.floor(Math.random() * 50) + 5;
        correctAnswer = num1 - num2;
      } else {
        op = '×';
        num1 = Math.floor(Math.random() * 8) + 2;
        num2 = Math.floor(Math.random() * 8) + 2;
        correctAnswer = num1 * num2;
      }
    } else if (currentLevel === 4) {
      // Level 4: Multiplication and simple Division
      const roll = Math.random();
      if (roll < 0.5) {
        op = '×';
        num1 = Math.floor(Math.random() * 11) + 2;
        num2 = Math.floor(Math.random() * 9) + 2;
        correctAnswer = num1 * num2;
      } else {
        op = '÷';
        num2 = Math.floor(Math.random() * 8) + 2; // divisor
        correctAnswer = Math.floor(Math.random() * 9) + 2; // result
        num1 = correctAnswer * num2; // dividend
      }
    } else {
      // Level 5: Harder math + Multiplications + Divisions
      const roll = Math.random();
      if (roll < 0.4) {
        op = '×';
        num1 = Math.floor(Math.random() * 15) + 3;
        num2 = Math.floor(Math.random() * 11) + 3;
        correctAnswer = num1 * num2;
      } else if (roll < 0.8) {
        op = '÷';
        num2 = Math.floor(Math.random() * 11) + 3;
        correctAnswer = Math.floor(Math.random() * 12) + 2;
        num1 = correctAnswer * num2;
      } else {
        // Special 3 numbers! (e.g. a + b * c)
        op = '×';
        const offset = Math.floor(Math.random() * 15) + 5;
        num1 = Math.floor(Math.random() * 8) + 2;
        num2 = Math.floor(Math.random() * 6) + 2;
        correctAnswer = offset + (num1 * num2);
        return {
          questionText: `${offset} + (${num1} × ${num2})`,
          correctAnswer,
          choices: generateChoices(correctAnswer),
          num1,
          num2,
          op
        };
      }
    }

    const questionText = `${num1} ${op} ${num2}`;

    return {
      questionText,
      correctAnswer,
      choices: generateChoices(correctAnswer),
      num1,
      num2,
      op
    };
  };

  const generateChoices = (correct: number): number[] => {
    const choicesSet = new Set<number>([correct]);
    while (choicesSet.size < 4) {
      const offset = Math.floor(Math.random() * 15) - 7;
      if (offset !== 0) {
        choicesSet.add(correct + offset);
      }
    }
    return Array.from(choicesSet).sort(() => Math.random() - 0.5);
  };

  // Start a new game
  const handleStartGame = () => {
    setIsPlaying(true);
    setScore(0);
    setLevel(1);
    setCatBlocks(10); // Start with safe margin of 10 blocks
    setLavaBlocks(0); // Lava starts at 0
    setTotalQuestionsAnswered(0);
    setTotalCorrect(0);
    setUserAnswer('');
    setFeedbackMsg({ text: '', type: null });
    
    // Settle initial randomized lava rise for next round
    const initialLavaRise = Math.floor(Math.random() * 3) + 1; // 1-3 blocks initial
    setLavaRiseAmount(initialLavaRise);

    // Setup first question
    nextRoundQuestion(0, 10, 0, initialLavaRise);
  };

  // Setup next round
  const nextRoundQuestion = (
    currentScore: number,
    currentCatBlocks: number,
    currentLavaBlocks: number,
    nextLavaRise: number
  ) => {
    // Generate new question
    const q = generateMathQuestion(currentScore);
    setCurrentQuestion(q);
    setUserAnswer('');
    setTimeLeft(5.0);

    // Reset countdown refs
    startTimeRef.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current!);
          handleTimeOut(q, currentScore, currentCatBlocks, currentLavaBlocks, nextLavaRise);
          return 0;
        }
        return parseFloat((prev - 0.1).toFixed(1));
      });
    }, 100);
  };

  // Handle timeout (reaching 5 seconds)
  const handleTimeOut = (
    question: MathQuestion,
    currentScore: number,
    currentCatBlocks: number,
    currentLavaBlocks: number,
    currentLavaRise: number
  ) => {
    setTotalQuestionsAnswered((p) => p + 1);
    
    // Lava rises up!
    const newLavaLevel = currentLavaBlocks + currentLavaRise;
    setLavaBlocks(newLavaLevel);

    setFeedbackMsg({
      text: `⏳ หมดเวลา! คำตอบที่ถูกคือ ${question.correctAnswer} (ลาวาพุ่งขึ้น +${currentLavaRise} ชั้น!)`,
      type: 'error'
    });

    // Check if lava reached the cat
    if (newLavaLevel >= currentCatBlocks) {
      triggerGameOver(currentScore, currentCatBlocks, newLavaLevel);
    } else {
      // Pick next round's lava rise (1-5 blocks)
      const nextLavaRise = Math.floor(Math.random() * 5) + 1;
      setLavaRiseAmount(nextLavaRise);
      
      setTimeout(() => {
        nextRoundQuestion(currentScore, currentCatBlocks, newLavaLevel, nextLavaRise);
      }, 2000);
    }
  };

  // Submit Answer
  const handleAnswerSubmit = (e?: React.FormEvent, clickedChoice?: number) => {
    if (e) e.preventDefault();
    if (!currentQuestion || !isPlaying) return;

    // Clear interval immediately to freeze timer
    if (timerRef.current) clearInterval(timerRef.current);

    const enteredAnswer = clickedChoice !== undefined ? clickedChoice : parseInt(userAnswer);
    const correctVal = currentQuestion.correctAnswer;
    const isCorrect = enteredAnswer === correctVal;

    const endOfTurnTime = Date.now();
    const durationSeconds = (endOfTurnTime - startTimeRef.current) / 1000;
    
    setTotalQuestionsAnswered((p) => p + 1);

    let nextCatBlocks = catBlocks;
    let nextLavaBlocks = lavaBlocks;
    let nextScore = score;

    if (isCorrect) {
      setTotalCorrect((p) => p + 1);
      
      // Determine reward blocks based on response speed
      let blocksRewarded = 2;
      let speedClass = 'เอาตัวรอดทันฉิวเฉียด! 🐢';
      if (durationSeconds <= 2.0) {
        blocksRewarded = 6;
        speedClass = 'เร็วปานกามเทพ! ⚡⚡';
      } else if (durationSeconds <= 3.0) {
        blocksRewarded = 4;
        speedClass = 'ปานกลางดีเลิศ! 👍';
      }

      nextCatBlocks = catBlocks + blocksRewarded;
      setCatBlocks(nextCatBlocks);

      // Score points
      const scoreGained = blocksRewarded * 10;
      nextScore = score + scoreGained;
      setScore(nextScore);

      setFeedbackMsg({
        text: `🎉 ถูกต้อง! (${speedClass} ได้รับ +${blocksRewarded} บล็อก, +${scoreGained} คะแนน)`,
        type: 'success'
      });
    } else {
      // Answered incorrectly
      setFeedbackMsg({
        text: `❌ ผิดพลาด! คำตอบที่ถูกคือ ${correctVal}`,
        type: 'error'
      });
    }

    // Now, after user answers (whether right or wrong), the lava rises for this round!
    const newLavaLevel = lavaBlocks + lavaRiseAmount;
    setLavaBlocks(newLavaLevel);

    // Check Game Over condition
    if (newLavaLevel >= nextCatBlocks) {
      triggerGameOver(nextScore, nextCatBlocks, newLavaLevel);
    } else {
      // Settle next round lava rise: 1-5 blocks
      const nextLavaRise = Math.floor(Math.random() * 5) + 1;
      setLavaRiseAmount(nextLavaRise);

      setTimeout(() => {
        nextRoundQuestion(nextScore, nextCatBlocks, newLavaLevel, nextLavaRise);
      }, 2000);
    }
  };

  // Trigger game over sequences
  const triggerGameOver = async (finalScore: number, finalCatHeight: number, finalLavaHeight: number) => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Save score to Google Sheet Mock & Users DB
    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Update local user highscore in LocalStorage accounts
    const storedUsersRaw = localStorage.getItem('lava_cat_users_mock');
    if (storedUsersRaw) {
      const users: UserAccount[] = JSON.parse(storedUsersRaw);
      const userIndex = users.findIndex(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
      if (userIndex !== -1) {
        if (finalScore > users[userIndex].highScore) {
          users[userIndex].highScore = finalScore;
          users[userIndex].progressLevel = Math.max(users[userIndex].progressLevel, level);
          localStorage.setItem('lava_cat_users_mock', JSON.stringify(users));
          
          // Update current logged-in user state
          setCurrentUser({
            ...currentUser,
            highScore: finalScore,
            progressLevel: Math.max(currentUser.progressLevel, level)
          });
        }
      }
    }

    // Show loading saving score alert
    Swal.fire({
      title: 'กำลังเชื่อมต่อและบันทึกคะแนนจริงลง Google Sheets...',
      html: `
        <div class="space-y-3 font-sans text-left p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
          <p class="text-xs text-slate-600 mt-2 text-center font-bold">กรุณารอสักครู่ ระบบกำลังจัดส่งข้อมูลคะแนนไปยัง Google Apps Script Web App... 🚀</p>
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Append / Save score row onto our simulated and REAL Google Sheet
    const { success } = await saveGoogleSheetRowAsync({
      fullName: currentUser.fullName,
      characterSelected: `${selectedCat.emoji} ${selectedCat.name}`,
      highScore: finalScore,
      progressLevel: level,
      timestamp: timestampStr
    });

    // Display beautiful dramatic SweetAlert Game Over popup as required
    Swal.fire({
      icon: 'error',
      title: '🌋 GAME OVER! แมวร่วงลาวา!',
      html: `
        <div class="space-y-3 font-sans text-left p-2 bg-slate-50 border border-slate-200 rounded-2xl">
          <p class="text-sm">ลาวาร้อนระอุได้สูงพุ่งขึ้นมาถึงชั้น <strong class="text-red-600">${finalLavaHeight}</strong> และท่วมตัวน้องแมวที่อยู่ชั้น <strong class="text-orange-600">${finalCatHeight}</strong> แล้ว!</p>
          <div class="grid grid-cols-2 gap-2 pt-2 text-center text-xs font-bold">
            <div class="bg-blue-100 p-2 rounded-xl">
              <span class="text-blue-800">คะแนนรอบนี้</span>
              <p class="text-lg font-black text-blue-900">${finalScore} PTS</p>
            </div>
            <div class="bg-orange-100 p-2 rounded-xl">
              <span class="text-orange-800">ระดับความยากท้ายสุด</span>
              <p class="text-lg font-black text-orange-950">เลเวล ${level}</p>
            </div>
          </div>
          <p class="text-[11px] text-center text-[#276a3c] bg-[#e2f0d9] p-2 rounded-lg font-semibold mt-2">
            ${success 
              ? '✅ บันทึกและซิงค์ข้อมูลกับสเปรดชีต Google Sheet จริงสำเร็จเรียบร้อยแล้ว!' 
              : '📊 บันทึกข้อมูลแบบออฟไลน์สำเร็จเรียบร้อยแล้ว! (ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือ URL Web App ของคุณ)'}
            <br/>
            (Spreadsheet ID: 16etW0JmPfmzz...5V51dA)
          </p>
        </div>
      `,
      confirmButtonText: 'รับทราบสถิติ',
      confirmButtonColor: '#f97316',
      allowOutsideClick: false
    }).then(() => {
      onGameFinished();
    });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Keyboard helper
  const handleKeypadPress = (val: string) => {
    if (val === 'CLEAR') {
      setUserAnswer('');
    } else if (val === 'ENTER') {
      handleAnswerSubmit();
    } else if (val === '-') {
      // Allow minus sign for division/subtraction if needed
      setUserAnswer((p) => (p.startsWith('-') ? p.substring(1) : '-' + p));
    } else {
      setUserAnswer((p) => p + val);
    }
  };

  // Build physical height bar elements
  const renderGameVisualizer = () => {
    const maxVisibleRows = 16;
    const rows = [];

    // Calculate vertical coordinates: 1 to 16
    for (let r = maxVisibleRows; r >= 1; r--) {
      const isLava = r <= lavaBlocks;
      const isCatStanding = r === catBlocks;
      const isBlock = r <= catBlocks && r > lavaBlocks;
      const isThreatenedLavaRise = r > lavaBlocks && r <= (lavaBlocks + lavaRiseAmount);

      rows.push(
        <div key={r} className="h-7 w-full flex items-center relative border-b border-white/5 font-mono text-[9px]">
          {/* Row label */}
          <span className="w-6 text-right pr-2 text-slate-500 font-bold select-none">{r}</span>

          {/* Cell block item */}
          <div className="flex-1 h-full relative transition-all duration-500">
            {isLava && (
              <div className="absolute inset-0 lava flex items-center justify-center text-white font-extrabold select-none shadow-inner border-t border-yellow-400">
                🌋 ลาวาเดือดปุดๆ
              </div>
            )}

            {isThreatenedLavaRise && !isBlock && (
              <div className="absolute inset-0 bg-red-500/20 border-y border-dashed border-red-500 flex items-center justify-center text-red-700 font-extrabold text-[9px] uppercase animate-pulse select-none">
                🔥 ลาวากำลังจะท่วมถึง (+{lavaRiseAmount})
              </div>
            )}

            {isBlock && (
              <div className="absolute inset-x-2 inset-y-0.5 block rounded shadow-md flex items-center justify-center text-slate-800 font-black text-xs select-none">
                🧱 บล็อกอิฐหนีภัย
              </div>
            )}

            {isCatStanding && (
              <div className="absolute inset-x-0 -top-5 flex flex-col items-center justify-center z-10 animate-bounce">
                <span className="text-4xl filter drop-shadow-md">{selectedCat.emoji}</span>
                <span className="bg-slate-900/80 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full border border-white/20 whitespace-nowrap">
                  {selectedCat.name}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT: Game Screen visual block display (6 Columns) */}
      <div className="lg:col-span-5 flex flex-col glass-panel p-4 rounded-3xl border border-white/60 shadow-md relative min-h-[480px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <Flame className="w-4.5 h-4.5 text-red-600" />
            <span>พิกัดเอาชีวิตรอดเสมือนจริง</span>
          </div>
          <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            ภัยพิบัติระดับ: Lv. {level}
          </span>
        </div>

        {/* Visualizer Area */}
        <div className="flex-1 bg-sky-200/50 backdrop-blur-xs rounded-2xl border border-sky-300/40 p-2 overflow-hidden flex flex-col justify-end relative shadow-inner">
          {/* Drifting Clouds in the background */}
          <div className="absolute top-8 left-0 text-3xl animate-float-slow select-none opacity-40">☁️</div>
          <div className="absolute top-24 left-1/3 text-4xl animate-float-medium select-none opacity-50">☁️</div>
          <div className="absolute top-16 right-4 text-2xl animate-float-fast select-none opacity-30">☁️</div>

          {/* Active grid board rendering */}
          <div className="space-y-0.5 z-10">
            {renderGameVisualizer()}
          </div>

          {/* Lava alert warning if lava too high */}
          {(catBlocks - lavaBlocks <= 3) && isPlaying && (
            <div className="absolute top-4 inset-x-4 bg-red-600 text-white text-xs font-black p-2 rounded-xl border border-red-500 shadow-md text-center animate-pulse z-30 flex items-center justify-center gap-1">
              <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-300" />
              <span>ลาวากระชั้นชิดเข้ามาแล้ว! รีบคิดคำตอบด่วน! 🚨</span>
            </div>
          )}
        </div>

        {/* Height readout */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-bold">
          <div className="bg-amber-100 text-amber-900 p-2 rounded-xl border border-amber-200">
            <span className="text-[10px] text-amber-700">ความสูงบล็อกแมว</span>
            <p className="text-base font-black">{isPlaying ? catBlocks : '-'} ชั้น</p>
          </div>
          <div className="bg-red-100 text-red-900 p-2 rounded-xl border border-red-200">
            <span className="text-[10px] text-red-700">ระดับน้ำลาวาสูง</span>
            <p className="text-base font-black text-red-600">{isPlaying ? lavaBlocks : '-'} ชั้น</p>
          </div>
        </div>
      </div>

      {/* RIGHT: Math controller and interactive panels (7 Columns) */}
      <div className="lg:col-span-7 flex flex-col justify-between glass-panel p-6 rounded-3xl border border-white/60 shadow-md relative min-h-[480px]">
        {/* Game Stats and Start State */}
        {!isPlaying ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-orange-100 border-2 border-orange-400 flex items-center justify-center text-5xl filter drop-shadow-md animate-bounce">
              {selectedCat.emoji}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-800">
                พร้อมที่จะช่วยคุณคู่หู {selectedCat.name} หรือยัง?
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                ในฐานะผู้เล่น คุณจะต้องแก้โจทย์คณิตศาสตร์ (บวก, ลบ, คูณ, หาร) ภายในเวลาข้อละ 5 วินาที 
                ยิ่งตอบถูกเร็ว บล็อกหอคอยจะถูกต่อเพิ่มสูงขึ้นเพื่อเอาชีวิตรอดจากระดับลาวาเดือดที่สุ่มสูงขึ้น 1-5 บล็อกทุกรอบ
              </p>
            </div>

            <button
              onClick={handleStartGame}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-base rounded-2xl shadow-lg hover:shadow-xl hover:shadow-orange-200 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Swords className="w-5 h-5" />
              <span>เริ่มตะลุยลุยด่าน (START SURVIVAL)</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between space-y-6">
            {/* Top Score & Round status bar */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-100 p-2 rounded-xl border border-slate-200">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">คะแนนของคุณ</span>
                <p className="text-lg font-black text-indigo-700">{score} PTS</p>
              </div>
              <div className="bg-orange-100 p-2 rounded-xl border border-orange-200">
                <span className="text-[9px] font-bold text-orange-700 uppercase tracking-wider">รอบลาวาเพิ่ม</span>
                <p className="text-lg font-black text-orange-800">+{lavaRiseAmount} บล็อก</p>
              </div>
              <div className="bg-emerald-100 p-2 rounded-xl border border-emerald-200">
                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">ตอบถูก/ตอบทั้งหมด</span>
                <p className="text-sm font-black text-emerald-800 mt-1">{totalCorrect}/{totalQuestionsAnswered} ข้อ</p>
              </div>
            </div>

            {/* Middle: Math Question & Timer area */}
            <div className="bg-white/60 border border-white/80 p-5 rounded-2xl text-center space-y-4 relative overflow-hidden">
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">โจทย์ข้อที่ {totalQuestionsAnswered + 1}</span>
                <span className="text-xs font-black text-orange-600 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current text-amber-500 animate-pulse" />
                  เลเวล {level}
                </span>
              </div>

              {/* Huge Math Expression */}
              {currentQuestion && (
                <div className="py-2">
                  <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight font-mono">
                    {currentQuestion.questionText} = ?
                  </span>
                </div>
              )}

              {/* Countdown Progress bar (5.0s timer limit) */}
              <div className="space-y-1 text-left">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>จับเวลาจำกัดข้อ</span>
                  <span className={timeLeft <= 1.5 ? 'text-red-600 font-extrabold animate-pulse' : ''}>
                    {timeLeft.toFixed(1)} วินาที
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden border border-slate-300">
                  <div
                    style={{ width: `${(timeLeft / 5) * 100}%` }}
                    className={`h-full transition-all duration-100 rounded-full ${
                      timeLeft <= 1.5
                        ? 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
                        : timeLeft <= 3.0
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Input / Choice toggling */}
            <div className="space-y-4">
              {/* Text answer input form */}
              <form onSubmit={handleAnswerSubmit} className="flex gap-2">
                <input
                  type="number"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="พิมพ์คำตอบของคุณที่นี่..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  autoFocus
                  className="flex-1 px-4 py-3 bg-white/70 focus:bg-white border-2 border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 rounded-xl outline-none transition-all font-mono font-black text-lg text-slate-800"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>ส่งคำตอบ</span>
                </button>
              </form>

              {/* Multiple Choice buttons helper */}
              {currentQuestion && (
                <div className="space-y-2">
                  <p className="text-[10px] text-center font-bold text-slate-500 uppercase tracking-widest">
                    หรือเลือกตอบข้อช้อยส์ลัดด่วนด้านล่างนี้ 👇
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {currentQuestion.choices.map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => handleAnswerSubmit(undefined, choice)}
                        className="py-3 px-2 bg-slate-100 hover:bg-orange-100 border border-slate-200 hover:border-orange-400 rounded-xl font-mono font-extrabold text-base text-slate-800 transition-all active:scale-95 cursor-pointer"
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Virtual Touch Numeric Keypad for Mobile devices */}
              <div className="bg-slate-200/40 p-2.5 rounded-2xl border border-slate-300/30 space-y-1.5">
                <div className="grid grid-cols-3 gap-1 text-sm font-bold font-mono">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleKeypadPress(k)}
                      className="py-2 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs cursor-pointer text-slate-700"
                    >
                      {k}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('-')}
                    className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs font-bold cursor-pointer text-slate-700"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs cursor-pointer text-slate-700"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('CLEAR')}
                    className="py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg shadow-2xs font-bold cursor-pointer"
                  >
                    ลบทั้งหมด
                  </button>
                </div>
              </div>
            </div>

            {/* Answer Feedbacks Alert banner */}
            <div className="min-h-12 flex items-center justify-center">
              {feedbackMsg.text && (
                <div
                  className={`w-full p-2.5 rounded-xl text-center text-xs font-bold flex items-center justify-center space-x-2 border animate-pulse ${
                    feedbackMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {feedbackMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4.5 h-4.5 text-red-600 shrink-0" />
                  )}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating action tools */}
        {isPlaying && (
          <div className="pt-3 border-t border-white/20 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
            <span>แมวพิทักษ์: {selectedCat.breed}</span>
            <button
              onClick={() => {
                Swal.fire({
                  title: 'ยอมแพ้หรืองดรบ?',
                  text: 'ต้องการจบรอบเกมและประเมินบันทึกคะแนนเลยหรือไม่?',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#f97316',
                  cancelButtonColor: '#cbd5e1',
                  confirmButtonText: 'ใช่ ยอมแพ้และบันทึกคะแนน',
                  cancelButtonText: 'เล่นต่อ'
                }).then((res) => {
                  if (res.isConfirmed) {
                    triggerGameOver(score, catBlocks, lavaBlocks);
                  }
                });
              }}
              className="text-red-500 hover:text-red-700 cursor-pointer"
            >
              ยอมแพ้ (SURRENDER)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
