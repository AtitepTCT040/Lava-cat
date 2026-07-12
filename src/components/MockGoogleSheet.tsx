import React, { useState, useEffect } from 'react';
import { Database, FileSpreadsheet, Code, Copy, Check, Send, Sparkles, RefreshCw } from 'lucide-react';
import { getGoogleSheetData, getGoogleAppsScriptUrl, setGoogleAppsScriptUrl } from '../data';
import { LeaderboardEntry } from '../types';
import Swal from 'sweetalert2';

export default function MockGoogleSheet() {
  const [sheetRows, setSheetRows] = useState<LeaderboardEntry[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [appsScriptUrl, setAppsScriptUrl] = useState(getGoogleAppsScriptUrl());
  const [isSavedUrl, setIsSavedUrl] = useState(false);

  const sheetId = '16etW0JmPfmzz_Si0P9Dn6GgyUaenUFwyzez4p5V51dA';

  const loadData = () => {
    setSheetRows(getGoogleSheetData());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleAppsScriptUrl(appsScriptUrl);
    setIsSavedUrl(true);
    setTimeout(() => setIsSavedUrl(false), 2000);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'บันทึก Google Apps Script API URL สำเร็จ!',
      showConfirmButton: false,
      timer: 2000
    });
  };

  const handleRefresh = () => {
    setSyncing(true);
    setTimeout(() => {
      loadData();
      setSyncing(false);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'อัปเดตดึงข้อมูลจาก Google Sheets จำลองเสร็จสิ้น!',
        showConfirmButton: false,
        timer: 2000
      });
    }, 800);
  };

  const appsScriptCode = `// Google Apps Script สำหรับรับข้อมูลจากเกม Lava Cat Math Survival
// วิธีติดตั้ง:
// 1. ไปที่ Google Sheet ของคุณ -> กดที่เมนู "ส่วนขยาย" (Extensions) -> เลือก "Apps Script"
// 2. ลบโค้ดเดิมออกทั้งหมด แล้ววางโค้ดนี้ลงไปแทน
// 3. กดปุ่มบันทึก (ไอคอนแผ่นดิสก์)
// 4. กดปุ่ม "การใช้งานได้" (Deploy) -> "การจัดการการใช้งานได้ใหม่" (New deployment)
// 5. เลือกประเภทเป็น "เว็บแอป" (Web app)
// 6. ตั้งค่าการเข้าถึง:
//    - Execute as (เรียกใช้งานในฐานะ): Me (อีเมลของคุณเอง)
//    - Who has access (ผู้มีสิทธิ์เข้าถึง): Anyone (ทุกคน) **สำคัญมาก! ห้ามลืม**
// 7. กดปุ่ม Deploy -> คัดลอก "URL ของเว็บแอป" (Web app URL) ที่ลงท้ายด้วย /exec นำมาวางในเกมเพื่อเริ่มใช้งานจริง!

function doGet(e) {
  return ContentService.createTextOutput("🚀 ระบบเชื่อมต่อ Lava Cat Math Survival API ทำงานได้ปกติ 100%! บันทึกคะแนนลง Google Sheet ได้แน่นอน")
                       .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var sheet;
    var sheetId = "${sheetId}";
    
    // ลองเชื่อมต่อสเปรดชีตแบบเปิดตาม ID ก่อน ถ้าไม่ได้ให้ใช้ Active Spreadsheet
    try {
      if (sheetId && sheetId !== "") {
        sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
      } else {
        sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      }
    } catch (err) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
    
    // ตั้งค่าหัวตาราง (Headers) อัตโนมัติถ้าหากเป็นชีตว่างเปล่า
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "ID ผู้เล่น", 
        "ชื่อผู้เล่น (Full Name)", 
        "ตัวละครที่เลือก (Character)", 
        "คะแนนสูงสุด (High Score)", 
        "เลเวลสูงสุดที่ผ่าน (Max Level)", 
        "เวลาอัปเดต (Timestamp)"
      ]);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    // ค้นหาชื่อซ้ำเพื่อทำการอัปเดตสถิติคะแนนที่ดีที่สุด (Highscore) เท่านั้น
    var rows = sheet.getDataRange().getValues();
    var foundIndex = -1;
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][1] === data.fullName) {
        foundIndex = i + 1; // +1 สำหรับ 1-based index และข้ามแถวหัวข้อ
        break;
      }
    }
    
    var timestamp = new Date();
    
    if (foundIndex !== -1) {
      // ตรวจสอบว่าคะแนนใหม่สูงกว่าคะแนนสูงสุดเดิมหรือไม่
      var oldScore = Number(rows[foundIndex - 1][3]) || 0;
      if (data.highScore > oldScore) {
        sheet.getRange(foundIndex, 3).setValue(data.characterSelected);
        sheet.getRange(foundIndex, 4).setValue(data.highScore);
        sheet.getRange(foundIndex, 5).setValue(data.progressLevel);
        sheet.getRange(foundIndex, 6).setValue(timestamp);
      } else {
        // อัปเดตเฉพาะเวลาล่าสุดและตัวละครหลักที่เล่นล่าสุด
        sheet.getRange(foundIndex, 3).setValue(data.characterSelected);
        sheet.getRange(foundIndex, 6).setValue(timestamp);
      }
    } else {
      // เพิ่มข้อมูลแถวใหม่สำหรับผู้ใช้ใหม่ (Column A - F)
      sheet.appendRow([
        data.id || "user_" + Utilities.getUuid().substring(0, 8),
        data.fullName,
        data.characterSelected,
        data.highScore,
        data.progressLevel,
        timestamp
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Synced successfully!" }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'คัดลอกโค้ดสคริปต์ลงคลิปบอร์ดแล้ว!',
      showConfirmButton: false,
      timer: 2000
    });
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden glint-effect border border-white/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Database className="w-32 h-32 text-blue-600" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              GOOGLE SHEETS API INTEGRATION
            </span>
            <h2 className="text-2xl font-extrabold text-slate-800">ระบบจำลองการเชื่อมต่อฐานข้อมูล</h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              จำลองกลไกส่งผลคะแนนหลังจบเกมไปยัง Google Sheet โดยอ้างอิง ID สเปรดชีตเป้าหมาย: 
              <code className="mx-1 px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-rose-600 font-mono text-xs select-all">
                {sheetId}
              </code>
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={syncing}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-sm shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'กำลังดึงข้อมูลล่าสุด...' : 'รีเฟรชสเปรดชีต'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Google Apps Script Endpoint Config */}
      <div className="glass-panel p-5 rounded-2xl border border-white/50 space-y-3">
        <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-sm">
          <Send className="w-4 h-4 text-orange-600" />
          <span>การเชื่อมต่อ Google Apps Script Web App จริง (Real Web App API Sync)</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          เมื่อท่านเล่นเกมชนะหรือร่วงลงลาวา ระบบจะจัดส่งผลคะแนนผู้เล่นโดยอัตโนมัติไปยัง API Web App ด้านล่างนี้ในรูปแบบ POST JSON เพื่อบันทึกลงในสเปรดชีตจริงแบบ Real-time:
        </p>
        <form onSubmit={handleSaveUrl} className="flex gap-2">
          <input
            type="url"
            value={appsScriptUrl}
            onChange={(e) => setAppsScriptUrl(e.target.value)}
            placeholder="ใส่ URL ของ Google Apps Script Web App (https://script.google.com/.../exec)"
            required
            className="flex-1 px-3 py-2 text-xs bg-white/70 focus:bg-white border border-slate-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 rounded-xl outline-none transition-all font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow transition-all active:scale-95 shrink-0 cursor-pointer flex items-center space-x-1"
          >
            {isSavedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Send className="w-3.5 h-3.5" />}
            <span>{isSavedUrl ? 'บันทึกสำเร็จ!' : 'บันทึก URL'}</span>
          </button>
        </form>
      </div>

      {/* Main Google Sheets Emulator */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col font-sans">
        {/* Google Sheets Header Interface */}
        <div className="bg-[#f9fbfd] border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-[#107c41] rounded-lg text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700">Lava Cat Math Survival Database</span>
                <span className="bg-[#e2f0d9] text-[#276a3c] text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#c5e0b4]">
                  เชื่อมต่อแล้ว
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-xs sm:max-w-md">
                ID: {sheetId}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium overflow-x-auto py-1">
            <span className="px-2 py-1 hover:bg-slate-100 rounded cursor-pointer">ไฟล์</span>
            <span className="px-2 py-1 hover:bg-slate-100 rounded cursor-pointer">แก้ไข</span>
            <span className="px-2 py-1 hover:bg-slate-100 rounded cursor-pointer">ดู</span>
            <span className="px-2 py-1 hover:bg-slate-100 rounded cursor-pointer">รูปแบบ</span>
            <span className="px-2 py-1 hover:bg-slate-100 rounded cursor-pointer">ข้อมูล</span>
            <span className="px-2 py-1 hover:bg-slate-100 rounded cursor-pointer">เครื่องมือ</span>
          </div>
        </div>

        {/* Spreadsheet Grid Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              {/* Row Header column designations A, B, C, D, E, F */}
              <tr className="bg-[#f3f3f3] text-slate-500 border-b border-slate-300">
                <th className="w-10 text-center border-r border-slate-300 p-1 select-none font-bold"></th>
                <th className="border-r border-slate-300 px-3 py-1 text-center font-bold">A</th>
                <th className="border-r border-slate-300 px-3 py-1 text-center font-bold">B</th>
                <th className="border-r border-slate-300 px-3 py-1 text-center font-bold">C</th>
                <th className="border-r border-slate-300 px-3 py-1 text-center font-bold">D</th>
                <th className="border-r border-slate-300 px-3 py-1 text-center font-bold">E</th>
                <th className="border-r border-slate-300 px-3 py-1 text-center font-bold text-center">F</th>
              </tr>
              {/* Label Column Titles */}
              <tr className="bg-[#e9f5ed] text-[#107c41] border-b border-slate-300 font-bold text-center">
                <td className="bg-[#f3f3f3] border-r border-slate-300 p-1 text-center select-none text-slate-400 font-bold">1</td>
                <td className="border-r border-slate-300 px-3 py-2 text-left">ID (รหัสผู้ใช้)</td>
                <td className="border-r border-slate-300 px-3 py-2 text-left">Full_Name (ชื่อ-นามสกุล)</td>
                <td className="border-r border-slate-300 px-3 py-2 text-left">Character_Selected (ตัวละครที่เลือก)</td>
                <td className="border-r border-slate-300 px-3 py-2 text-right">High_Score (คะแนนสูงสุดที่ทำได้)</td>
                <td className="border-r border-slate-300 px-3 py-2 text-center">Progress_Level (ความยากสูงสุด)</td>
                <td className="border-r border-slate-300 px-3 py-2 text-left">Timestamp (วัน-เวลาที่บันทึก)</td>
              </tr>
            </thead>
            <tbody>
              {sheetRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-sans italic">
                    ยังไม่มีข้อมูลใน Spreadsheet จำลองนี้ เริ่มเล่นเกมเพื่อบันทึกคะแนนใหม่!
                  </td>
                </tr>
              ) : (
                sheetRows.map((row, idx) => (
                  <tr key={row.id} className="border-b border-slate-200 hover:bg-[#f2f8f4] text-slate-700">
                    <td className="bg-[#f3f3f3] border-r border-slate-300 p-1 text-center select-none text-slate-400 font-bold font-mono">
                      {idx + 2}
                    </td>
                    <td className="border-r border-slate-200 px-3 py-2 truncate text-slate-400 text-[11px] font-mono">
                      {row.id}
                    </td>
                    <td className="border-r border-slate-200 px-3 py-2 font-sans font-medium text-slate-800">
                      {row.fullName}
                    </td>
                    <td className="border-r border-slate-200 px-3 py-2">
                      {row.characterSelected}
                    </td>
                    <td className="border-r border-slate-200 px-3 py-2 text-right font-extrabold text-blue-700">
                      {row.highScore}
                    </td>
                    <td className="border-r border-slate-200 px-3 py-2 text-center font-bold text-amber-700">
                      Lv. {row.progressLevel}
                    </td>
                    <td className="border-r border-slate-200 px-3 py-2 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {row.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Spreadsheet Footer Status bar */}
        <div className="bg-[#e9f5ed] px-4 py-2 text-[10px] text-[#276a3c] font-semibold flex flex-col sm:flex-row justify-between border-t border-slate-200 gap-2">
          <span>🎯 แผ่นงานที่ 1/1 (LavaCatRecords)</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping inline-block" />
            เชื่อมต่อแบบเรียลไทม์กับสเปรดชีต id : {sheetId}
          </span>
        </div>
      </div>

      {/* Copyable Google Apps Script Code block */}
      <div className="glass-panel p-6 rounded-2xl border border-white/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <Code className="w-5 h-5 text-indigo-600" />
            <span>โค้ดหลังบ้านจริง (Google Apps Script Integration Code)</span>
          </div>
          
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1.5 bg-white/60 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'คัดลอกสำเร็จ!' : 'คัดลอกโค้ดสคริปต์'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          หากท่านต้องการเชื่อมต่อเกมนี้กับ Google Sheets จริงๆ 
          สามารถสร้าง Google Sheet ใหม่ แล้วไปที่เมนู <strong className="text-slate-800">Extensions &gt; Apps Script</strong> 
          จากนั้นคัดลอกโค้ดสคริปต์ด้านล่างนี้ไปวางเพื่อรันเป็น Web App สำหรับรับข้อมูล API ได้ทันที!
        </p>

        <div className="relative">
          <pre className="bg-slate-900 text-indigo-100 text-[11px] p-4 rounded-xl overflow-x-auto max-h-56 font-mono border border-slate-800 shadow-inner">
            {appsScriptCode}
          </pre>
          <div className="absolute top-2 right-2 bg-slate-800 text-slate-400 text-[9px] px-2 py-0.5 rounded uppercase font-bold select-none tracking-widest">
            JavaScript (GAS)
          </div>
        </div>
      </div>
    </div>
  );
}
