import { CatCharacter, LeaderboardEntry } from './types';

export const CAT_CHARACTERS: CatCharacter[] = [
  {
    id: 'orange-tabby',
    name: 'ส้มจี๊ด (Orange Tabby)',
    breed: 'แมวส้ม',
    emoji: '🐱',
    description: 'แมวส้มผู้ร่าเริงและซน คล่องแคล่วว่องไว ทนทานความร้อนได้ดีเยี่ยม!',
    color: 'bg-amber-400',
    borderColor: 'border-amber-600',
    stats: { speed: '⚡⚡⚡⚡⚡', jump: '⚡⚡⚡', luck: '⚡⚡' }
  },
  {
    id: 'persian',
    name: 'คุณนายปุย (Persian)',
    breed: 'แมวเปอร์เซีย',
    emoji: '🦁',
    description: 'แมวขนฟูสุดสง่างาม มีพลังสมาธิสูงช่วยให้เวลาตอบผิดแล้วลดความสูงของลาวาลง!',
    color: 'bg-pink-300',
    borderColor: 'border-pink-500',
    stats: { speed: '⚡⚡', jump: '⚡⚡⚡⚡', luck: '⚡⚡⚡⚡' }
  },
  {
    id: 'siamese',
    name: 'ถุงเงิน (Siamese)',
    breed: 'แมววิเชียรมาศ',
    emoji: '😾',
    description: 'แมวไทยโบราณมงคล มีสติปัญญาเฉียบแหลม คำนวณโจทย์บวกบล็อกเสริมได้เร็วกว่าปกติ!',
    color: 'bg-yellow-100',
    borderColor: 'border-amber-800',
    stats: { speed: '⚡⚡⚡⚡', jump: '⚡⚡', luck: '⚡⚡⚡⚡' }
  },
  {
    id: 'scottish-fold',
    name: 'พี่พับ (Scottish Fold)',
    breed: 'แมวสก็อตติชโฟลด์',
    emoji: '🐱👓',
    description: 'แมวหูพับใส่แว่นผู้รอบรู้ มีโชคนำพา หากตอบถูกจะมีสิทธิ์สุ่มได้โบนัสบล็อกเพิ่ม!',
    color: 'bg-slate-300',
    borderColor: 'border-slate-500',
    stats: { speed: '⚡⚡⚡', jump: '⚡⚡⚡', luck: '⚡⚡⚡⚡⚡' }
  }
];

// Seed some initial cool mock leaderboard data so it looks populated and realistic immediately
export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'user_1',
    fullName: 'สมชาย รักคณิต',
    characterSelected: 'ส้มจี๊ด (Orange Tabby) 🐱',
    highScore: 380,
    progressLevel: 7,
    timestamp: '2026-07-11 15:30:12'
  },
  {
    id: 'user_2',
    fullName: 'สุดสวย แมวพับ',
    characterSelected: 'พี่พับ (Scottish Fold) 🐱👓',
    highScore: 310,
    progressLevel: 5,
    timestamp: '2026-07-11 16:15:45'
  },
  {
    id: 'user_3',
    fullName: 'เก่งกาจ รักดี',
    characterSelected: 'ถุงเงิน (Siamese) 😾',
    highScore: 240,
    progressLevel: 4,
    timestamp: '2026-07-11 17:40:00'
  },
  {
    id: 'user_4',
    fullName: 'หนูดี มีตังค์',
    characterSelected: 'คุณนายปุย (Persian) 🦁',
    highScore: 190,
    progressLevel: 3,
    timestamp: '2026-07-11 18:22:10'
  },
  {
    id: 'user_5',
    fullName: 'กิตติศักดิ์ บินหลา',
    characterSelected: 'ส้มจี๊ด (Orange Tabby) 🐱',
    highScore: 120,
    progressLevel: 2,
    timestamp: '2026-07-11 19:10:55'
  }
];

// Helper to save simulated Google Sheet items to LocalStorage
export const getGoogleSheetData = (): LeaderboardEntry[] => {
  const data = localStorage.getItem('lava_cat_google_sheet_mock');
  if (!data) {
    localStorage.setItem('lava_cat_google_sheet_mock', JSON.stringify(INITIAL_LEADERBOARD));
    return INITIAL_LEADERBOARD;
  }
  return JSON.parse(data);
};

// Real Google Apps Script Web App URL Management
export const getGoogleAppsScriptUrl = (): string => {
  const saved = localStorage.getItem('lava_cat_apps_script_url');
  const oldUrls = [
    'https://script.google.com/macros/s/AKfycby2Jf9-W4EmhGmYfmsCV49wur-oEtS1ae7cj67tnpJaQ5X7bUNEgYCT83dAIPxhfFuZ/exec',
    'https://script.google.com/macros/s/AKfycbwAIRuYwTg6JHfiL9_pTlxoEkRSm-x7m7M_wjnGtTcBqRmvGB_jtluIz4OXCcWGVDhm/exec'
  ];
  if (!saved || oldUrls.includes(saved)) {
    return 'https://script.google.com/macros/s/AKfycbzWufl3zZWcElcWAmAnsa7sNdNMczZfukuTGYtzd0qdF0HKZnq4Gy-Wq_vbEwmSbUom/exec';
  }
  return saved;
};

export const setGoogleAppsScriptUrl = (url: string) => {
  localStorage.setItem('lava_cat_apps_script_url', url);
};

export const saveGoogleSheetRow = (row: Omit<LeaderboardEntry, 'id'> & { id?: string }): LeaderboardEntry[] => {
  const current = getGoogleSheetData();
  const existingIndex = current.findIndex(r => r.fullName === row.fullName);
  let targetId = row.id;
  
  if (existingIndex !== -1) {
    targetId = current[existingIndex].id;
    // If user already has a row, update highscore if current is higher
    if (row.highScore > current[existingIndex].highScore) {
      current[existingIndex] = {
        ...current[existingIndex],
        highScore: row.highScore,
        progressLevel: Math.max(current[existingIndex].progressLevel, row.progressLevel),
        characterSelected: row.characterSelected,
        timestamp: row.timestamp
      };
    } else {
      // Just update timestamp and latest character if requested, but keep high score
      current[existingIndex].timestamp = row.timestamp;
    }
  } else {
    // Add new user row
    const newId = row.id || 'user_' + (current.length + 1) + '_' + Math.floor(Math.random() * 1000);
    targetId = newId;
    current.push({
      id: newId,
      fullName: row.fullName,
      characterSelected: row.characterSelected,
      highScore: row.highScore,
      progressLevel: row.progressLevel,
      timestamp: row.timestamp
    });
  }
  
  // Sort by highscore desc
  const sorted = [...current].sort((a, b) => b.highScore - a.highScore);
  localStorage.setItem('lava_cat_google_sheet_mock', JSON.stringify(sorted));

  // Trigger the real fetch asynchronously to the Google Apps Script Web App
  const url = getGoogleAppsScriptUrl();
  if (url) {
    const payload = {
      id: targetId,
      fullName: row.fullName,
      characterSelected: row.characterSelected,
      highScore: row.highScore,
      progressLevel: row.progressLevel,
      timestamp: row.timestamp
    };
    
    console.log('Syncing record to Google Apps Script Web App:', payload);
    
    // We send using no-cors to bypass browser CORS pre-flight block, ensuring data gets sent.
    fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    })
    .then(() => {
      console.log('Real-time sync to Google Sheets dispatched successfully!');
    })
    .catch((error) => {
      console.warn('Real-time sync error:', error);
    });
  }
  
  return sorted;
};

export const saveGoogleSheetRowAsync = async (row: Omit<LeaderboardEntry, 'id'> & { id?: string }): Promise<{ sorted: LeaderboardEntry[]; success: boolean }> => {
  const current = getGoogleSheetData();
  const existingIndex = current.findIndex(r => r.fullName === row.fullName);
  let targetId = row.id;
  
  if (existingIndex !== -1) {
    targetId = current[existingIndex].id;
    // If user already has a row, update highscore if current is higher
    if (row.highScore > current[existingIndex].highScore) {
      current[existingIndex] = {
        ...current[existingIndex],
        highScore: row.highScore,
        progressLevel: Math.max(current[existingIndex].progressLevel, row.progressLevel),
        characterSelected: row.characterSelected,
        timestamp: row.timestamp
      };
    } else {
      // Just update timestamp and latest character if requested, but keep high score
      current[existingIndex].timestamp = row.timestamp;
    }
  } else {
    // Add new user row
    const newId = row.id || 'user_' + (current.length + 1) + '_' + Math.floor(Math.random() * 1000);
    targetId = newId;
    current.push({
      id: newId,
      fullName: row.fullName,
      characterSelected: row.characterSelected,
      highScore: row.highScore,
      progressLevel: row.progressLevel,
      timestamp: row.timestamp
    });
  }
  
  // Sort by highscore desc
  const sorted = [...current].sort((a, b) => b.highScore - a.highScore);
  localStorage.setItem('lava_cat_google_sheet_mock', JSON.stringify(sorted));

  const url = getGoogleAppsScriptUrl();
  if (url) {
    const payload = {
      id: targetId,
      fullName: row.fullName,
      characterSelected: row.characterSelected,
      highScore: row.highScore,
      progressLevel: row.progressLevel,
      timestamp: row.timestamp
    };
    
    console.log('Syncing record to Google Apps Script Web App (Async):', payload);
    
    try {
      const fetchPromise = fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      
      const delayPromise = new Promise(resolve => setTimeout(resolve, 1500));
      await Promise.all([fetchPromise, delayPromise]);
      
      console.log('Real-time sync to Google Sheets completed (Async)!');
      return { sorted, success: true };
    } catch (error) {
      console.warn('Real-time sync error (Async):', error);
      return { sorted, success: false };
    }
  }
  
  return { sorted, success: false };
};
