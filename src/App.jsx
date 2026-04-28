import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Home, Image as ImageIcon, BookOpen, Users, 
  ExternalLink, Calendar, Award, PlayCircle, 
  FileText, CheckSquare, User, ChevronRight, Play,
  Smartphone, Lock, Plus, Edit2, Save, Trash2, AlertCircle,
  Download, Copy, Newspaper, Tag, ChevronDown, ChevronUp,
  GripVertical, Video
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, deleteDoc } from 'firebase/firestore';

// --- 強制載入 Tailwind CSS ---
if (typeof window !== 'undefined' && !document.getElementById('tailwind-cdn')) {
  const script = document.createElement('script');
  script.id = 'tailwind-cdn';
  script.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(script);
}

// ==========================================
// ⚠️ Firebase 初始化 (已套用您的專屬金鑰)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyB_XxMKi1clOZo8nEJohR64rNhTBfzLqoA",
  authDomain: "class-website-802.firebaseapp.com",
  projectId: "class-website-802",
  storageBucket: "class-website-802.firebasestorage.app",
  messagingSenderId: "448378354222",
  appId: "1:448378354222:web:57443ae89e6bfda44cfdbf"
};

let app, auth, db;
try {
  if (Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch(e) { console.error(e); }
const appId = 'class-website-802-prod';

// --- 輔助工具：自動轉換 Google Drive 連結 ---
const processImageUrl = (url) => {
  if (!url) return '';
  const trimmedUrl = url.trim();
  const driveRegex = /drive\.google\.com\/file\/d\/([-_A-Za-z0-9]+)/;
  const match = trimmedUrl.match(driveRegex);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return trimmedUrl;
};

// --- 輔助工具：取得 YouTube 影片 ID ---
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- 輔助工具：判斷是否為支援的影片平台 ---
const isRecognizedVideo = (url) => {
  if (!url) return false;
  return getYouTubeVideoId(url) || url.includes('instagram.com') || url.includes('facebook.com') || url.includes('fb.watch');
};

// =========================================================================
// ⭐⭐⭐ 老師請看這裡：預設資料區塊 ⭐⭐⭐
// =========================================================================

const CLASS_INFO = {
  name: "八年2班 師生天地",
  slogan: "邏輯思考，探索無限可能",
  teacher: "John 老師"
};

const INITIAL_HERO_BG = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=2000';

const INITIAL_SCHEDULE = [
  { "fri": "班會", "thu": "英語", "id": 1, "wed": "彈自", "tue": "國文", "mon": "國文", "time": "08:25 - 09:10" },
  { "tue": "國文", "mon": "國文", "time": "09:20 - 10:05", "fri": "英語", "thu": "健康", "id": 2, "wed": "英語" },
  { "id": 3, "wed": "資訊", "fri": "自然", "thu": "本土語", "mon": "自然", "time": "10:15 - 11:00", "tue": "數學" },
  { "time": "11:10 - 11:55", "mon": "體育", "tue": "音樂", "wed": "公民", "id": 4, "thu": "自然", "fri": "歷史" },
  { "tue": "科技", "time": "13:20 - 14:05", "mon": "地理", "thu": "家政", "fri": "視覺", "wed": "輔導", "id": 5 },
  { "wed": "童軍", "id": 6, "thu": "數學", "fri": "數學", "time": "14:15 - 15:00", "mon": "彈英", "tue": "社團" },
  { "time": "15:15 - 16:00", "mon": "數學", "tue": "社團", "wed": "表演", "id": 7, "thu": "體育", "fri": "國文" },
  { "tue": "數學", "time": "16:10 - 16:55", "mon": "社會", "thu": "英語", "fri": "國文", "wed": "自然", "id": 8 }
];

const INITIAL_ROSTER = [
  { "id": 1, "role": "班長", "name": "楊子易", "desc": "負責統籌班級事務" },
  { "desc": "協助班長，點名簿管理", "role": "副班長", "name": "江筠苡", "id": 2 },
  { "desc": "維持班級秩序", "role": "風紀股長", "id": 3, "name": "楊淯淋" },
  { "desc": "教室佈置、作業登記", "name": "黃苡欣", "id": 4, "role": "學藝股長" },
  { "name": "張喻喬", "id": 5, "role": "衛生股長", "desc": "整潔區域檢查與維持" },
  { "desc": "帶操、體育器材借還", "name": "劉東勳", "role": "體育股長", "id": 6 },
  { "role": "總務股長", "name": "方泊淳", "id": 7, "desc": "負責班級經物品保管及維護" },
  { "role": "輔導股長", "name": "吳欣諭", "id": 8, "desc": "協助輔導活動與同學關懷" },
  { "id": 9, "name": "張晴瑜", "role": "圖書股長", "desc": "負責班級圖書管理與借閱" },
  { "desc": "負責營養午餐工作事項", "name": "謝玉茹", "role": "午餐秘書", "id": 10 }
];

const INITIAL_PHOTOS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800', title: '校慶運動會大隊接力', date: '2026-11-15' },
  { id: 2, url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800', title: '數學科展準備', date: '2026-10-20' },
  { id: 3, url: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&q=80&w=800', title: '戶外教學：科博館', date: '2026-09-05' },
  { id: 4, url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=800', title: '期中考後同樂會', date: '2026-04-10' },
];

const INITIAL_VIDEOS = [
  { id: 1, title: '三分鐘學會一元二次方程式', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ' },
  { id: 2, title: '幾何圖形基礎觀念', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ' },
];

const INITIAL_MATERIALS = [
  { id: 1, title: '會考歷屆試題彙整 (幾何篇)', url: '#', ext: 'PDF' },
  { id: 2, title: '公式記憶小卡', url: '#', ext: 'PDF' },
  { id: 3, title: '課堂講義 CH3', url: '#', ext: 'DOC' },
];

const INITIAL_AWARDS = [
  { id: 1, date: '2026-04', title: '全校運動會 精神總錦標 第一名' },
  { id: 2, date: '2026-03', title: '生活榮譽競賽 連續三週 冠軍' },
];

const INITIAL_ARTICLES = [
  { 
    id: 1, 
    title: '為什麼學數學很重要？從生活中的小事看起', 
    category: '數學教學', 
    content: '數學不只是枯燥的計算，更是一種解決問題的邏輯思維。在日常生活中，我們無時無刻都在使用數學：從超市購物比價、規劃旅遊預算，到理解新聞中的統計數據。\n\n培養良好的數學素養，能夠幫助孩子在未來面對複雜挑戰時，擁有更清晰的分析能力。希望家長們能多鼓勵孩子在生活中尋找數學的影子！', 
    url: 'https://example.com/math-life', 
    date: '2026-04-28' 
  },
  { 
    id: 2, 
    title: '面對挫折的態度：成長型思維', 
    category: '人生哲學', 
    content: '在學習的路上，難免會遇到考試不理想、或是聽不懂課程的時候。重點不是分數的高低，而是我們如何從錯誤中學習。\n\n擁有「成長型思維」的孩子，會把挑戰當成進步的階梯。與其說「我就是學不會數學」，不如換個角度想「我只是還沒找到適合我的學習方法」。讓我們一起陪伴孩子建立不怕失敗的勇氣！', 
    url: '', 
    date: '2026-04-25' 
  },
  { 
    id: 3, 
    title: 'TED-Ed：數學如何幫助我們理解世界？', 
    category: '課外影音', 
    content: '這是一部非常棒的 TED-Ed 動畫短片，用非常生動的方式解釋了為什麼數學語言能夠描述大自然中的各種現象，推薦給同學和家長們一起欣賞！', 
    url: 'https://www.youtube.com/watch?v=ObP0FjYkRNE', 
    date: '2026-04-20' 
  },
];

const SUBJECTS = [
  '國文', '英語', '數學', '自然', '地理', '歷史', '公民', '社會', 
  '體育', '音樂', '科技', '社團', '彈英', '彈自', '彈數', '輔導', 
  '資訊', '童軍', '表演', '健康', '本土語', '家政', '班會', '視覺',
  '綜合', '自習', '大掃除'
];

const STUDENTS = [
  '林丞塏', '張昱翔', '王永騰', '方泊淳', '陳宇全', '王自義', '陳俋卲', 
  '蔡豐澤', '林佾致', '楊子易', '劉東勳', '吳和諺', '黃苡欣', '林千玉', 
  '林貝芸', '張晴瑜', '江筠苡', '吳欣諭', '彭采玲', '陳湘緹', '楊淯淋', 
  '謝玉茹', '張喻喬', '王薽妤', '邱米詩'
];
// =========================================================================

// --- 共用元件：確認視窗 Modal ---
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle className="text-red-500" /> {title}
        </h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">取消</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">確認刪除</button>
        </div>
      </div>
    </div>
  );
}

// --- 共用元件：媒體嵌入顯示器 ---
function MediaEmbed({ url }) {
  if (!url) return null;

  const ytId = getYouTubeVideoId(url);
  if (ytId) {
    return (
      <div className="mt-4 relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-md">
        <iframe 
          src={`https://www.youtube.com/embed/${ytId}`} 
          className="absolute top-0 left-0 w-full h-full border-0"
          allowFullScreen 
          title="YouTube Video"
        ></iframe>
      </div>
    );
  }

  if (url.includes('instagram.com')) {
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');
    const embedUrl = `${cleanUrl}/embed`;
    return (
      <div className="mt-4 w-full max-w-md bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <iframe src={embedUrl} width="100%" height="480" frameBorder="0" scrolling="no" allowTransparency="true" title="Instagram Video"></iframe>
      </div>
    );
  }

  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`;
    return (
      <div className="mt-4 w-full max-w-2xl bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative" style={{ paddingTop: '56.25%' }}>
        <iframe src={embedUrl} className="absolute top-0 left-0 w-full h-full border-0" scrolling="no" frameBorder="0" allowFullScreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" title="Facebook Video"></iframe>
      </div>
    );
  }

  return null;
}


export default function App() {
  const [appState, setAppState] = useState({
    heroBg: INITIAL_HERO_BG,
    photos: INITIAL_PHOTOS,
    schedule: INITIAL_SCHEDULE,
    roster: INITIAL_ROSTER,
    videos: INITIAL_VIDEOS,
    materials: INITIAL_MATERIALS,
    awards: INITIAL_AWARDS,
    articles: INITIAL_ARTICLES
  });

  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPwd, setAdminPwd] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // 使用 undefined 代表「驗證尚未完成」
  const [user, setUser] = useState(undefined);

  // 1. 處理身份驗證
  useEffect(() => {
    if (!auth) {
       setUser({ uid: 'local-user' }); 
       return;
    }
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch(e) { setUser({ uid: 'local-user' }); }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
        if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  // 2. 確保驗證完成後才抓取 Firebase 資料
  useEffect(() => {
    // 驗證未完成時，不要繼續，讓 isLoaded 保持 false 顯示圈圈
    if (user === undefined) return; 

    // 本機開發或沒有連線資料庫
    if (!db || user.uid === 'local-user') {
        setIsLoaded(true);
        return;
    }
    
    // 連線 Firebase
    const docRef = doc(db, 'class_data', appId);
    const unsub = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            setAppState(prev => ({...prev, ...docSnap.data()}));
        } else {
            setDoc(docRef, appState);
        }
        setIsLoaded(true); // 確認雲端資料回來了，才解除載入畫面
    }, (err) => {
        console.error(err);
        setIsLoaded(true);
    });
    return () => unsub();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateAppState = async (newPartialState) => {
    const newState = { ...appState, ...newPartialState };
    setAppState(newState); 
    if (db && user && user.uid !== 'local-user') {
       try {
         await setDoc(doc(db, 'class_data', appId), newState, { merge: true });
       } catch(e) {}
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleAdminLoginClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowLoginModal(true);
      setAdminPwd('');
      setLoginError('');
    }
  };

  const submitLogin = () => {
    if (adminPwd === 'admin') {
      setIsAdmin(true);
      setShowLoginModal(false);
    } else {
      setLoginError('密碼錯誤，請重新輸入。');
    }
  };

  const navItems = [
    { id: 'home', label: '首頁', icon: <Home size={20} /> },
    { id: 'photos', label: '活動照片', icon: <ImageIcon size={20} /> },
    { id: 'info', label: '班級資訊', icon: <Users size={20} /> },
    { id: 'resources', label: '學習資源', icon: <BookOpen size={20} /> },
    { id: 'articles', label: '好文分享', icon: <Newspaper size={20} /> },
  ];

  if (!isLoaded) {
    return <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans selection:bg-blue-200 flex flex-col">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white/90 backdrop-blur-md py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo('home')}>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:bg-blue-700 transition-colors">2</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-wider flex items-center gap-2">
                  {CLASS_INFO.name}
                  {isAdmin && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">管理模式</span>}
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">{CLASS_INFO.slogan}</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                    ${activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-gray-900 focus:outline-none p-2">
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 px-4 animate-in fade-in slide-in-from-top-5">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors
                  ${activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 active:bg-gray-50'}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <div className="pt-6 mt-6 border-t border-gray-100">
               <a href="https://check-scores-azure.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform">
                <Smartphone size={20} />智慧校園家長通<ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}

      <main className="pt-24 pb-20 md:pb-12 flex-grow">
        {activeTab === 'home' && <HomeView navigateTo={navigateTo} isAdmin={isAdmin} heroBg={appState.heroBg} photos={appState.photos} awards={appState.awards} updateAppState={updateAppState} ConfirmModal={ConfirmModal} />}
        {activeTab === 'photos' && <PhotosView isAdmin={isAdmin} ConfirmModal={ConfirmModal} photos={appState.photos} updateAppState={updateAppState} />}
        {activeTab === 'info' && <ClassInfoView isAdmin={isAdmin} schedule={appState.schedule} roster={appState.roster} updateAppState={updateAppState} />}
        {activeTab === 'resources' && <ResourcesView isAdmin={isAdmin} ConfirmModal={ConfirmModal} videos={appState.videos} materials={appState.materials} updateAppState={updateAppState} />}
        {activeTab === 'articles' && <ArticlesView isAdmin={isAdmin} articles={appState.articles} updateAppState={updateAppState} ConfirmModal={ConfirmModal} />}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">
          <p className="text-gray-500 text-sm">© 2026 {CLASS_INFO.name}. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-400 text-xs">導師：{CLASS_INFO.teacher}</p>
            <span className="text-gray-300">|</span>
            <button onClick={handleAdminLoginClick} className={`text-xs flex items-center gap-1 ${isAdmin ? 'text-red-500 font-bold' : 'text-gray-400 hover:text-gray-600'}`}>
              <Lock size={12} /> {isAdmin ? '登出管理員' : '管理員登入'}
            </button>
          </div>
        </div>
      </footer>

      {showLoginModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">管理員登入</h3>
              <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">請輸入密碼以開啟網頁編輯模式。</p>
            <input 
              type="password" placeholder="密碼" value={adminPwd} onChange={(e) => setAdminPwd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitLogin()}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 mb-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {loginError && <p className="text-red-500 text-xs mb-4">{loginError}</p>}
            <button onClick={submitLogin} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors mt-2">登入</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// Views Components
// ==========================================

function HomeView({ navigateTo, isAdmin, heroBg, photos, awards, updateAppState, ConfirmModal }) {
  const [showEditBgModal, setShowEditBgModal] = useState(false);
  const [newHeroBg, setNewHeroBg] = useState('');
  
  const [showAddAwardModal, setShowAddAwardModal] = useState(false);
  const [newAward, setNewAward] = useState({ date: '', title: '' });
  const [deleteAwardId, setDeleteAwardId] = useState(null);

  const handleEditClick = () => {
    setNewHeroBg(heroBg);
    setShowEditBgModal(true);
  };

  const confirmChangeBg = () => {
    if (newHeroBg.trim()) {
      updateAppState({ heroBg: processImageUrl(newHeroBg) });
    }
    setShowEditBgModal(false);
  };

  const confirmAddAward = () => {
    if(newAward.title.trim()) {
      const newAwardsList = [{ id: Date.now(), date: newAward.date, title: newAward.title }, ...awards];
      updateAppState({ awards: newAwardsList });
      setShowAddAwardModal(false);
      setNewAward({ date: '', title: '' });
    }
  };

  const confirmDeleteAward = () => {
    const newAwardsList = awards.filter(a => a.id !== deleteAwardId);
    updateAppState({ awards: newAwardsList });
    setDeleteAwardId(null);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px] md:h-[500px] group bg-gray-900">
          {isAdmin && (
            <button onClick={handleEditClick} className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 text-white p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg flex items-center gap-2" title="更換封面照片">
              <Edit2 size={18} /><span className="text-sm font-medium pr-1">更換封面照片</span>
            </button>
          )}
          <img src={heroBg} alt="Hero Class" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-40" onError={(e) => { e.target.src = INITIAL_HERO_BG; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent flex flex-col justify-end p-8 md:p-12">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-4 shadow-sm">班級公告</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">歡迎來到八年2班<br/>探索邏輯與學習的樂趣</h2>
            <p className="text-gray-200 md:text-lg max-w-2xl mb-8 drop-shadow-md">記錄孩子們的成長點滴，提供豐富的數學學習資源，建立親師溝通的優質橋樑。</p>
            <a href="https://check-scores-azure.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-full font-bold hover:bg-gray-50 hover:scale-105 transition-all shadow-lg w-max">
              <Smartphone size={20} />開啟「智慧校園家長通」<ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>

      {showEditBgModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">更換首頁背景照片</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">照片網址 (URL)</label>
                <input type="text" value={newHeroBg} onChange={e => setNewHeroBg(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="可直接貼上 Google 雲端硬碟的分享連結..." />
              </div>
              <p className="text-xs text-gray-500 bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">💡</span>
                <span><strong>已支援 Google Drive！</strong><br/>請將照片設為「知道連結的人都能查看」，然後貼到上方，系統會自動轉換。</span>
              </p>
              <div className="flex gap-2 justify-end mt-6">
                <button onClick={() => setShowEditBgModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">取消</button>
                <button onClick={confirmChangeBg} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">確認更換</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { id: 'photos', title: '活動精選', desc: '精彩瞬間', icon: <ImageIcon size={28} />, color: 'bg-rose-50 text-rose-600' },
            { id: 'info', title: '班級課表', desc: '作息一覽', icon: <Calendar size={28} />, color: 'bg-emerald-50 text-emerald-600' },
            { id: 'resources', title: '線上學習', desc: '教材與影片', icon: <PlayCircle size={28} />, color: 'bg-indigo-50 text-indigo-600' },
            { id: 'articles', title: '好文分享', desc: '優質文章閱讀', icon: <Newspaper size={28} />, color: 'bg-amber-50 text-amber-600' },
          ].map((item) => (
            <button key={item.id} onClick={() => navigateTo(item.id)} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center text-center transition-all hover:-translate-y-1 group">
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>{item.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><ImageIcon className="text-blue-600" /> 最新活動</h3>
              <p className="text-gray-500 mt-1">捕捉生活中的美好片刻</p>
            </div>
            <button onClick={() => navigateTo('photos')} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">看更多 <ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {photos.length === 0 ? (
               <div className="col-span-2 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 min-h-[200px]">
                 目前尚無最新活動照片
               </div>
            ) : (
              photos.slice(0, 2).map((photo) => (
                <div key={photo.id} className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer" onClick={() => navigateTo('photos')}>
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=800'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white font-medium truncate">{photo.title}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Honor Roll */}
        <div>
           <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Award className="text-yellow-500" /> 榮譽榜</h3>
              <p className="text-gray-500 mt-1">孩子們的優異表現</p>
            </div>
            {isAdmin && (
              <button onClick={() => setShowAddAwardModal(true)} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
                <Plus size={16}/> 新增
              </button>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[200px]">
            <div className="space-y-6">
              {awards.length === 0 ? (
                 <p className="text-sm text-gray-400 text-center py-4">目前尚無榮譽紀錄</p>
              ) : (
                awards.map((award, index) => (
                  <div key={award.id} className="flex gap-4 items-start relative group">
                    {index !== awards.length - 1 && (<div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-gray-100"></div>)}
                    <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0 z-10 mt-0.5"><Award size={14} /></div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{award.date}</span>
                      <p className="text-gray-800 font-medium mt-1 leading-snug">{award.title}</p>
                    </div>
                    {isAdmin && (
                      <button onClick={() => setDeleteAwardId(award.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteAwardId !== null} 
        title="刪除榮譽紀錄" 
        message="確定要刪除這筆榮譽紀錄嗎？" 
        onCancel={() => setDeleteAwardId(null)} 
        onConfirm={confirmDeleteAward} 
      />

      {showAddAwardModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">新增榮譽紀錄</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">日期 / 年月份</label>
                <input type="text" value={newAward.date} onChange={e => setNewAward({...newAward, date: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="例如：2026-05" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">榮譽標題</label>
                <input type="text" value={newAward.title} onChange={e => setNewAward({...newAward, title: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="例如：整潔競賽 第一名" />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button onClick={() => setShowAddAwardModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">取消</button>
                <button onClick={confirmAddAward} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">確認新增</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotosView({ isAdmin, ConfirmModal, photos, updateAppState }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ title: '', url: '', date: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Drag & Drop States for Photos
  const dragPhotoItem = useRef(null);
  const dragPhotoOverItem = useRef(null);

  const handlePhotoSort = () => {
    if (dragPhotoItem.current === null || dragPhotoOverItem.current === null || dragPhotoItem.current === dragPhotoOverItem.current) return;
    const _photos = [...photos];
    const draggedItemContent = _photos.splice(dragPhotoItem.current, 1)[0];
    _photos.splice(dragPhotoOverItem.current, 0, draggedItemContent);
    dragPhotoItem.current = null;
    dragPhotoOverItem.current = null;
    updateAppState({ photos: _photos });
  };

  const handleAddPhoto = () => {
    if(!newPhoto.url || !newPhoto.title) return;
    const processedUrl = processImageUrl(newPhoto.url);
    const photo = {
      ...newPhoto,
      url: processedUrl,
      id: Date.now(),
      date: newPhoto.date || new Date().toISOString().split('T')[0]
    };
    updateAppState({ photos: [photo, ...photos] });
    setShowAddModal(false);
    setNewPhoto({ title: '', url: '', date: '' });
  };

  const triggerDelete = (e, id) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDeletePhoto = () => {
    updateAppState({ photos: photos.filter(p => p.id !== deleteConfirmId) });
    setDeleteConfirmId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="text-center mb-12 relative">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 inline-block relative">活動照片<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-blue-600 rounded-full mt-2"></div></h2>
        <p className="text-gray-500 max-w-2xl mx-auto">記錄每一刻的笑容與汗水，這裡是孩子們三年國中生活最珍貴的回憶庫。</p>
        {isAdmin && (
          <div className="absolute right-0 top-0">
             <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors">
              <Plus size={16} /> 新增照片
            </button>
          </div>
        )}
      </div>

      <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
        {photos.map((photo, index) => (
          <div 
            key={photo.id} 
            draggable={isAdmin}
            onDragStart={() => (dragPhotoItem.current = index)}
            onDragEnter={() => (dragPhotoOverItem.current = index)}
            onDragEnd={handlePhotoSort}
            onDragOver={(e) => e.preventDefault()}
            className={`break-inside-avoid relative rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-all ${isAdmin ? 'cursor-move' : 'cursor-pointer'}`} 
            onClick={() => setSelectedImage(photo)}
          >
            {isAdmin && (
              <div className="absolute top-4 left-4 z-10 bg-black/40 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm pointer-events-none">
                <GripVertical size={16} />
              </div>
            )}
            <img src={photo.url} alt={photo.title} className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700" loading="lazy" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=800'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <span className="text-white/80 text-sm mb-1">{photo.date}</span>
              <h3 className="text-white font-bold text-lg">{photo.title}</h3>
            </div>
            {isAdmin && (
              <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(photo.id); }} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md z-10">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {photos.length === 0 && <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">目前尚無活動照片</div>}

      <ConfirmModal isOpen={deleteConfirmId !== null} title="刪除照片" message="確定要刪除這張照片嗎？刪除後無法復原。" onCancel={() => setDeleteConfirmId(null)} onConfirm={() => { updateAppState({ photos: photos.filter(p => p.id !== deleteConfirmId) }); setDeleteConfirmId(null); }} />

      {showAddModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">新增照片</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">照片網址 (URL)</label>
                <input type="text" value={newPhoto.url} onChange={e => setNewPhoto({...newPhoto, url: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="可直接貼上 Google 雲端連結..." />
              </div>
              <div><label className="block text-sm text-gray-600 mb-1">標題</label><input type="text" value={newPhoto.title} onChange={e => setNewPhoto({...newPhoto, title: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">日期</label><input type="date" value={newPhoto.date} onChange={e => setNewPhoto({...newPhoto, date: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="flex gap-2 justify-end mt-6">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">取消</button>
                <button onClick={handleAddPhoto} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">確認新增</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2" onClick={() => setSelectedImage(null)}><X size={32} /></button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.url} alt={selectedImage.title} className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
            <div className="text-center mt-6">
              <h3 className="text-white text-2xl font-bold">{selectedImage.title}</h3>
              <p className="text-gray-400 mt-2">{selectedImage.date}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClassInfoView({ isAdmin, schedule, roster, updateAppState }) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [localSchedule, setLocalSchedule] = useState(schedule);
  const [localRoster, setLocalRoster] = useState(roster);
  const [isEditing, setIsEditing] = useState(false);

  const [showIOModal, setShowIOModal] = useState(false);
  const [ioType, setIoType] = useState('schedule'); 
  const [ioText, setIoText] = useState('');
  const [ioError, setIoError] = useState('');

  useEffect(() => {
    if (!isEditing) {
      setLocalSchedule(schedule);
      setLocalRoster(roster);
    }
  }, [schedule, roster, isEditing]);

  const toggleEdit = () => {
    if (isEditing) {
      updateAppState({ schedule: localSchedule, roster: localRoster });
    }
    setIsEditing(!isEditing);
  };

  const handleOpenIO = () => {
    if (activeTab === 'schedule') {
        setIoType('schedule');
        setIoText(JSON.stringify(localSchedule, null, 2));
    } else {
        setIoType('roster');
        setIoText(JSON.stringify(localRoster, null, 2));
    }
    setIoError('');
    setShowIOModal(true);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(ioText);
      if (!Array.isArray(parsed)) throw new Error('資料必須是陣列格式');
      
      if (ioType === 'schedule') {
          if (parsed.length > 0 && !('mon' in parsed[0])) throw new Error('課表欄位不正確');
          setLocalSchedule(parsed);
          updateAppState({ schedule: parsed });
      } else {
          if (parsed.length > 0 && !('role' in parsed[0])) throw new Error('名單欄位不正確');
          setLocalRoster(parsed);
          updateAppState({ roster: parsed });
      }
      setShowIOModal(false);
      alert('資料匯入成功並已套用為最新狀態！');
    } catch (err) {
      setIoError('資料格式有誤，請確認是否為標準的 JSON 格式！');
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try { document.execCommand('copy'); alert('已複製到剪貼簿！'); } 
    catch (err) { alert('複製失敗，請手動選取文字複製。'); }
    document.body.removeChild(textArea);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            班級資訊
            {isAdmin && (
               <div className="flex gap-2">
                 <button onClick={handleOpenIO} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                   <Download size={16}/> 匯入/匯出
                 </button>
                 <button onClick={toggleEdit} className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${isEditing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {isEditing ? <><Save size={16}/> 儲存變更</> : <><Edit2 size={16}/> {activeTab === 'schedule' ? '編輯課表' : '編輯名單'}</>}
                 </button>
               </div>
            )}
          </h2>
          <p className="text-gray-500">掌握作息與名單，讓校園生活更有條理</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          <button onClick={() => setActiveTab('schedule')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'schedule' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>本學期課表</button>
          <button onClick={() => setActiveTab('roster')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'roster' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>班級幹部</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'schedule' && (
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                  <th className="py-4 px-2 font-medium">時間</th>
                  <th className="py-4 px-2 font-medium">星期一</th>
                  <th className="py-4 px-2 font-medium">星期二</th>
                  <th className="py-4 px-2 font-medium">星期三</th>
                  <th className="py-4 px-2 font-medium">星期四</th>
                  <th className="py-4 px-2 font-medium">星期五</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {localSchedule.map((row, idx) => (
                  <React.Fragment key={row.id}>
                    {idx === 4 && (<tr className="bg-blue-50/50"><td colSpan="6" className="py-3 text-sm font-medium text-blue-600">午休時間 11:55 - 13:20</td></tr>)}
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2 text-sm text-gray-500 bg-gray-50/50">
                         {isEditing ? <input value={row.time} onChange={e => setLocalSchedule(localSchedule.map(r => r.id === row.id ? { ...r, time: e.target.value } : r))} className="w-full text-center border rounded p-1 focus:ring-2 focus:ring-blue-500 outline-none"/> : row.time}
                      </td>
                      {['mon', 'tue', 'wed', 'thu', 'fri'].map(day => (
                        <td key={day} className={`py-4 px-2 font-medium ${!isEditing && row[day] === '數學' ? 'text-blue-600 font-bold bg-blue-50/30' : 'text-gray-800'}`}>
                           {isEditing ? (
                              <select value={row[day]} onChange={e => setLocalSchedule(localSchedule.map(r => r.id === row.id ? { ...r, [day]: e.target.value } : r))} className="w-full text-center border rounded p-1 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value=""></option>
                                {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                              </select>
                           ) : ( row[day] )}
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'roster' && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localRoster.map((student) => (
                <div key={student.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors group ${isEditing ? 'border-blue-300 bg-blue-50/20' : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'}`}>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0"><User size={24} /></div>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input value={student.role} onChange={e => setLocalRoster(localRoster.map(s => s.id === student.id ? { ...s, role: e.target.value } : s))} className="w-full text-sm font-bold border rounded p-1" placeholder="職位"/>
                        <select value={student.name} onChange={e => setLocalRoster(localRoster.map(s => s.id === student.id ? { ...s, name: e.target.value } : s))} className="w-full text-sm text-blue-600 border rounded p-1 outline-none bg-white">
                          <option value="">選擇學生</option>
                          {STUDENTS.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                        <input value={student.desc} onChange={e => setLocalRoster(localRoster.map(s => s.id === student.id ? { ...s, desc: e.target.value } : s))} className="w-full text-xs text-gray-500 border rounded p-1" placeholder="說明"/>
                      </div>
                    ) : (
                      <><h4 className="font-bold text-gray-900">{student.role} <span className="text-blue-600 ml-1">{student.name}</span></h4><p className="text-xs text-gray-500 mt-1">{student.desc}</p></>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showIOModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold mb-2">匯入 / 匯出 {ioType === 'schedule' ? '課表' : '班級幹部名單'}</h3>
            <p className="text-sm text-gray-600 mb-4">
              您可以在此將正確資料匯出並複製。<br/>
              <span className="text-blue-600 font-medium">💡 小技巧：如果您希望這份資料「永遠變成預設值」，請將複製下來的程式碼，貼到 App.jsx 對應的星星記號區塊內！</span>
            </p>
            
            <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
              <textarea 
                className="w-full flex-1 p-4 border rounded-lg font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={ioText} onChange={(e) => setIoText(e.target.value)} spellCheck="false"
              />
            </div>
            
            {ioError && <p className="text-red-500 text-sm mt-3 font-medium">{ioError}</p>}
            
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <button onClick={() => setShowIOModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={() => {
                try { navigator.clipboard.writeText(ioText).then(()=>alert('複製成功！')); } catch(e) { fallbackCopyTextToClipboard(ioText); }
              }} className="px-4 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 flex items-center gap-1">
                <Copy size={16}/> 複製內容
              </button>
              <button onClick={handleImport} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">儲存匯入</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResourcesView({ isAdmin, ConfirmModal, videos, materials, updateAppState }) {
  // Video States
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', url: '' });
  const [deleteVideoId, setDeleteVideoId] = useState(null);
  
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editVideoData, setEditVideoData] = useState({ title: '', url: '' });

  // Material States
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', url: '' });
  const [deleteMaterialId, setDeleteMaterialId] = useState(null);
  
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editMaterialData, setEditMaterialData] = useState({ title: '', url: '' });

  // Drag & Drop States
  const dragVideoItem = useRef(null);
  const dragVideoOverItem = useRef(null);
  const dragMaterialItem = useRef(null);
  const dragMaterialOverItem = useRef(null);

  // IO States
  const [showIOModal, setShowIOModal] = useState(false);
  const [ioType, setIoType] = useState('videos');
  const [ioText, setIoText] = useState('');
  const [ioError, setIoError] = useState('');

  const handleVideoSort = () => {
    if (dragVideoItem.current === null || dragVideoOverItem.current === null || dragVideoItem.current === dragVideoOverItem.current) return;
    const _videos = [...videos];
    const draggedItemContent = _videos.splice(dragVideoItem.current, 1)[0];
    _videos.splice(dragVideoOverItem.current, 0, draggedItemContent);
    dragVideoItem.current = null;
    dragVideoOverItem.current = null;
    updateAppState({ videos: _videos });
  };

  const handleMaterialSort = () => {
    if (dragMaterialItem.current === null || dragMaterialOverItem.current === null || dragMaterialItem.current === dragMaterialOverItem.current) return;
    const _materials = [...materials];
    const draggedItemContent = _materials.splice(dragMaterialItem.current, 1)[0];
    _materials.splice(dragMaterialOverItem.current, 0, draggedItemContent);
    dragMaterialItem.current = null;
    dragMaterialOverItem.current = null;
    updateAppState({ materials: _materials });
  };

  const confirmAddVideo = () => {
    if(newVideo.title.trim() && newVideo.url.trim()) {
      const videoId = getYouTubeVideoId(newVideo.url);
      const newVideos = [...videos, { id: Date.now(), title: newVideo.title, url: newVideo.url, videoId: videoId, views: 0 }];
      updateAppState({ videos: newVideos });
      setShowAddVideoModal(false);
      setNewVideo({ title: '', url: '' });
    }
  };

  const confirmDeleteVideo = () => {
    updateAppState({ videos: videos.filter(v => v.id !== deleteVideoId) });
    setDeleteVideoId(null);
  };

  const startEditVideo = (video) => {
    setEditingVideoId(video.id);
    setEditVideoData({ title: video.title, url: video.url });
  };

  const saveEditVideo = () => {
    if(editVideoData.title.trim() && editVideoData.url.trim()) {
      const videoId = getYouTubeVideoId(editVideoData.url);
      const newVideos = videos.map(v => 
        v.id === editingVideoId ? { ...v, title: editVideoData.title, url: editVideoData.url, videoId: videoId } : v
      );
      updateAppState({ videos: newVideos });
      setEditingVideoId(null);
    }
  };

  const confirmAddMaterial = () => {
    if(newMaterial.title.trim() && newMaterial.url.trim()) {
      let ext = 'LINK';
      const urlUpper = newMaterial.url.toUpperCase();
      if (urlUpper.includes('.PDF')) ext = 'PDF';
      else if (urlUpper.includes('.DOC') || urlUpper.includes('DOCUMENT')) ext = 'DOC';
      else if (urlUpper.includes('DRIVE.GOOGLE')) ext = 'DRIVE';

      const newMats = [...materials, { id: Date.now(), title: newMaterial.title, url: newMaterial.url, ext }];
      updateAppState({ materials: newMats });
      setShowAddMaterialModal(false);
      setNewMaterial({ title: '', url: '' });
    }
  };

  const confirmDeleteMaterial = () => {
    updateAppState({ materials: materials.filter(m => m.id !== deleteMaterialId) });
    setDeleteMaterialId(null);
  };

  const startEditMaterial = (material) => {
    setEditingMaterialId(material.id);
    setEditMaterialData({ title: material.title, url: material.url });
  };

  const saveEditMaterial = () => {
    if(editMaterialData.title.trim() && editMaterialData.url.trim()) {
      let ext = 'LINK';
      const urlUpper = editMaterialData.url.toUpperCase();
      if (urlUpper.includes('.PDF')) ext = 'PDF';
      else if (urlUpper.includes('.DOC') || urlUpper.includes('DOCUMENT')) ext = 'DOC';
      else if (urlUpper.includes('DRIVE.GOOGLE')) ext = 'DRIVE';

      const newMats = materials.map(m => 
        m.id === editingMaterialId ? { ...m, title: editMaterialData.title, url: editMaterialData.url, ext: ext } : m
      );
      updateAppState({ materials: newMats });
      setEditingMaterialId(null);
    }
  };

  const handleOpenIO = (type) => {
    setIoType(type);
    setIoText(JSON.stringify(type === 'videos' ? videos : materials, null, 2));
    setIoError('');
    setShowIOModal(true);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(ioText);
      if (!Array.isArray(parsed)) throw new Error('資料必須是陣列格式');

      if (ioType === 'videos') {
        const processed = parsed.map(v => ({
          ...v,
          id: v.id || Date.now() + Math.random(),
          videoId: v.videoId || getYouTubeVideoId(v.url),
          views: v.views || 0
        }));
        updateAppState({ videos: processed });
      } else {
        const processed = parsed.map(m => {
          let ext = m.ext || 'LINK';
          if (!m.ext && m.url) {
            const urlUpper = m.url.toUpperCase();
            if (urlUpper.includes('.PDF')) ext = 'PDF';
            else if (urlUpper.includes('.DOC') || urlUpper.includes('DOCUMENT')) ext = 'DOC';
            else if (urlUpper.includes('DRIVE.GOOGLE')) ext = 'DRIVE';
          }
          return { ...m, id: m.id || Date.now() + Math.random(), ext };
        });
        updateAppState({ materials: processed });
      }
      setShowIOModal(false);
      alert(`批次匯入${ioType === 'videos' ? '影片' : '教材'}成功！`);
    } catch (err) {
      setIoError('資料格式有誤，請確認是否為標準的 JSON 格式！');
    }
  };

  const handleCopy = () => {
    try { navigator.clipboard.writeText(ioText).then(()=>alert('已複製！')); } 
    catch (err) { fallbackCopyTextToClipboard(ioText); }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text; document.body.appendChild(textArea);
    textArea.focus(); textArea.select();
    try { document.execCommand('copy'); alert('已複製！'); } catch (err) {}
    document.body.removeChild(textArea);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">數位學習資源</h2>
        <p className="text-gray-500">數學沒有捷徑，只有多聽、多看、多練</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6"><PlayCircle className="text-red-500" /> 教學影片區</h3>
            {isAdmin && (
              <div className="absolute top-6 right-6 flex gap-2">
                 <button onClick={() => handleOpenIO('videos')} className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium">
                   <Download size={16}/> 匯入/匯出
                 </button>
                 <button onClick={() => setShowAddVideoModal(true)} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
                  <Plus size={16}/> 新增影片
                </button>
              </div>
            )}
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div 
                  key={video.id} 
                  draggable={isAdmin && editingVideoId !== video.id}
                  onDragStart={() => (dragVideoItem.current = index)}
                  onDragEnter={() => (dragVideoOverItem.current = index)}
                  onDragEnd={handleVideoSort}
                  onDragOver={(e) => e.preventDefault()}
                  className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100 relative ${isAdmin && editingVideoId !== video.id ? 'cursor-move' : ''}`}
                >
                  {isAdmin && editingVideoId !== video.id && (<div className="text-gray-300 hover:text-gray-500 shrink-0 hidden md:block"><GripVertical size={20}/></div>)}
                  {editingVideoId === video.id ? (
                    <div className="flex flex-col gap-3 p-4 border border-blue-200 bg-blue-50 rounded-xl w-full">
                      <input type="text" value={editVideoData.title} onChange={e=>setEditVideoData({...editVideoData, title: e.target.value})} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="影片標題"/>
                      <input type="text" value={editVideoData.url} onChange={e=>setEditVideoData({...editVideoData, url: e.target.value})} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="YouTube 網址"/>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingVideoId(null)} className="text-gray-500 text-sm px-3 py-1.5 hover:bg-blue-100 rounded-lg">取消</button>
                        <button onClick={saveEditVideo} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 font-medium shadow-sm">儲存</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="relative w-32 md:w-40 aspect-video bg-gray-900 rounded-lg overflow-hidden shrink-0 flex items-center justify-center group-hover:opacity-90">
                        <img src={video.videoId ? `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg` : `https://images.unsplash.com/photo-1632516643720-e7f0d7e6a727?auto=format&fit=crop&q=80&w=400&sig=${video.id}`} alt="thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        <Play className="text-white w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" />
                      </a>
                      <div className="flex flex-col justify-center flex-1 pr-16">
                        <a href={video.url} target="_blank" rel="noopener noreferrer"><h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{video.title}</h4></a>
                      </div>
                      {isAdmin && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg px-1 py-0.5 shadow-sm">
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); startEditVideo(video); }} className="text-gray-500 hover:text-blue-600 p-1.5"><Edit2 size={16}/></button>
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteVideoId(video.id); }} className="text-gray-500 hover:text-red-500 p-1.5"><Trash2 size={16}/></button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              {videos.length === 0 && <p className="text-sm text-gray-400 text-center py-4">目前尚無教學影片</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <FileText className="text-blue-500" /> 補充教材下載
            </h3>
            {isAdmin && (
              <div className="absolute top-6 right-6 flex gap-2">
                 <button onClick={() => handleOpenIO('materials')} className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium">
                   <Download size={16}/> 匯入/匯出
                 </button>
                 <button onClick={() => setShowAddMaterialModal(true)} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
                  <Plus size={16}/> 新增教材
                </button>
              </div>
            )}
            <div className="space-y-2">
              {materials.map((file, index) => (
                <div 
                  key={file.id} 
                  draggable={isAdmin && editingMaterialId !== file.id}
                  onDragStart={() => (dragMaterialItem.current = index)}
                  onDragEnter={() => (dragMaterialOverItem.current = index)}
                  onDragEnd={handleMaterialSort}
                  onDragOver={(e) => e.preventDefault()}
                  className={`relative group flex items-center gap-2 ${isAdmin && editingMaterialId !== file.id ? 'cursor-move' : ''}`}
                >
                  {isAdmin && editingMaterialId !== file.id && (<div className="text-gray-300 hover:text-gray-500 shrink-0"><GripVertical size={16}/></div>)}
                  {editingMaterialId === file.id ? (
                    <div className="flex flex-col gap-2 p-3 border border-blue-200 bg-blue-50 rounded-xl w-full mb-2">
                      <input type="text" value={editMaterialData.title} onChange={e=>setEditMaterialData({...editMaterialData, title: e.target.value})} className="w-full border rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="教材標題"/>
                      <input type="text" value={editMaterialData.url} onChange={e=>setEditMaterialData({...editMaterialData, url: e.target.value})} className="w-full border rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="檔案連結"/>
                      <div className="flex justify-end gap-2 mt-1">
                        <button onClick={() => setEditingMaterialId(null)} className="text-gray-500 text-sm px-2 py-1 hover:bg-blue-100 rounded">取消</button>
                        <button onClick={saveEditMaterial} className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 shadow-sm">儲存</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex-1 w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 text-left transition-colors border border-transparent hover:border-blue-100">
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 truncate pr-14">{file.title}</span>
                        <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded group-hover:bg-blue-200 group-hover:text-blue-800 shrink-0">{file.ext}</span>
                      </a>
                      {isAdmin && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg px-1 py-0.5">
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); startEditMaterial(file); }} className="text-gray-500 hover:text-blue-600 p-1.5"><Edit2 size={14}/></button>
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteMaterialId(file.id); }} className="text-gray-500 hover:text-red-500 p-1.5"><Trash2 size={14}/></button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              {materials.length === 0 && <p className="text-sm text-gray-400 text-center py-2">目前尚無補充教材</p>}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-md text-white relative">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><CheckSquare size={20} /> 本週作業與測驗</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 bg-yellow-400 rounded-full shrink-0"></div><p className="text-sm">完成習作 Ch3-1 (P.45~P.48)</p></li>
              <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 bg-yellow-400 rounded-full shrink-0"></div><p className="text-sm">線上測驗：二次函數基礎題</p></li>
            </ul>
            <button className="mt-6 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">前往線上測驗系統</button>
          </div>
        </div>
      </div>

      <ConfirmModal isOpen={deleteVideoId !== null} title="刪除影片" message="確定移除這部教學影片嗎？" onCancel={() => setDeleteVideoId(null)} onConfirm={confirmDeleteVideo} />
      <ConfirmModal isOpen={deleteMaterialId !== null} title="刪除教材" message="確定移除這份補充教材嗎？" onCancel={() => setDeleteMaterialId(null)} onConfirm={confirmDeleteMaterial} />

      {showAddVideoModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">新增 YouTube 教學影片</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">YouTube 網址</label>
                <input type="text" value={newVideo.url} onChange={e => setNewVideo({...newVideo, url: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">影片標題</label>
                <input type="text" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button onClick={() => setShowAddVideoModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">取消</button>
                <button onClick={confirmAddVideo} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">確認新增</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddMaterialModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">新增補充教材連結</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">檔案連結 (URL)</label>
                <input type="text" value={newMaterial.url} onChange={e => setNewMaterial({...newMaterial, url: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="貼上 Google 雲端硬碟或其他檔案連結" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">教材標題</label>
                <input type="text" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="例如：第三章 講義 PDF" />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button onClick={() => setShowAddMaterialModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">取消</button>
                <button onClick={confirmAddMaterial} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">確認新增</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showIOModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold mb-2">匯入 / 匯出 {ioType === 'videos' ? '教學影片' : '補充教材'}</h3>
            <p className="text-sm text-gray-600 mb-4">
              您可以在此複製目前的資料備份，或是貼上 JSON 格式資料進行整筆匯入。<br/>
              <span className="text-blue-600 font-medium">💡 小技巧：若想永遠變成預設值，請貼到程式碼 INITIAL 區塊內。</span>
            </p>
            <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
              <textarea value={ioText} onChange={(e) => setIoText(e.target.value)} spellCheck="false" className="w-full flex-1 p-4 border rounded-lg font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>
            {ioError && <p className="text-red-500 text-sm mt-3 font-medium">{ioError}</p>}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <button onClick={() => setShowIOModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleCopy} className="flex items-center gap-1 px-4 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900"><Copy size={16}/> 複製內容</button>
              <button onClick={handleImport} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">儲存匯入</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ArticlesView({ isAdmin, articles, updateAppState, ConfirmModal }) {
  const [filterCat, setFilterCat] = useState('全部');
  const [expandedId, setExpandedId] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: '', content: '', url: '', date: '' });
  const [deleteId, setDeleteId] = useState(null);

  const categories = ['全部', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];
  const filteredArticles = filterCat === '全部' ? articles : articles.filter(a => a.category === filterCat);

  const handleOpenModal = (article = null) => {
    if (article) {
      setEditId(article.id);
      setFormData(article);
    } else {
      setEditId(null);
      setFormData({ title: '', category: '', content: '', url: '', date: new Date().toISOString().split('T')[0] });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.category.trim()) {
      alert('請至少填寫「文章標題」與「文章分類」');
      return;
    }
    if (editId) {
      const newArticles = articles.map(a => a.id === editId ? { ...formData, id: editId } : a);
      updateAppState({ articles: newArticles });
    } else {
      const newArticles = [{ ...formData, id: Date.now() }, ...articles];
      updateAppState({ articles: newArticles });
    }
    setShowModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">好文分享</h2>
          <p className="text-gray-500">精選優質好文與教育影片，一起閱讀與成長</p>
        </div>
        {isAdmin && (
          <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors">
            <Plus size={18} /> 新增文章/影片
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterCat === cat ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredArticles.map(article => {
          const isExpanded = expandedId === article.id;
          const isVideo = isRecognizedVideo(article.url);
          
          return (
            <div key={article.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1"><Tag size={12}/> {article.category}</span>
                <span className="text-gray-400 text-sm flex items-center gap-1"><Calendar size={14}/> {article.date}</span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h3>
              
              <div className={`text-gray-700 leading-relaxed whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-3'}`}>
                {article.content}
              </div>

              {/* 自動影片嵌入區域 */}
              <MediaEmbed url={article.url} />
              
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-4 flex-wrap">
                  {article.content && article.content.length > 100 && (
                    <button onClick={() => setExpandedId(isExpanded ? null : article.id)} className="text-blue-600 font-medium text-sm flex items-center gap-1 hover:text-blue-800">
                      {isExpanded ? <><ChevronUp size={16}/> 收起內容</> : <><ChevronDown size={16}/> 繼續閱讀</>}
                    </button>
                  )}
                  {article.url && (
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 font-medium text-sm flex items-center gap-1 hover:text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      {isVideo ? <><Video size={14} className="text-red-500" /> 前往影片網址</> : <><ExternalLink size={14} className="text-blue-500" /> 閱讀原文連結</>}
                    </a>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(article)} className="text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Edit2 size={16}/></button>
                    <button onClick={() => setDeleteId(article.id)} className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredArticles.length === 0 && <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">目前這個分類還沒有文章喔！</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4">{editId ? '編輯文章' : '新增文章 / 影片'}</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-600 mb-1">標題 <span className="text-red-500">*</span></label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" placeholder="請輸入標題" /></div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">文章分類 <span className="text-red-500">*</span></label>
                  <input type="text" list="article-categories" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" placeholder="輸入新分類或選擇現有分類" />
                  <datalist id="article-categories">{categories.filter(c => c !== '全部').map(cat => <option key={cat} value={cat} />)}</datalist>
                </div>
              </div>
              <div><label className="block text-sm text-gray-600 mb-1">發布日期</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">外部連結或影片網址 (選填) - 支援 YouTube, FB, IG</label><input type="text" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." /></div>
              <div><label className="block text-sm text-gray-600 mb-1">內容或心得</label><textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[150px]" placeholder="在此輸入或貼上文章內容..." /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium">取消</button>
              <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md">儲存內容</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={deleteId !== null} title="刪除文章" message="確定要刪除這篇文章嗎？刪除後將無法復原。" onCancel={() => setDeleteId(null)} onConfirm={() => { updateAppState({ articles: articles.filter(a => a.id !== deleteId) }); setDeleteId(null); }} />
    </div>
  );
}