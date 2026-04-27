import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Home, Image as ImageIcon, BookOpen, Users, 
  MessageSquare, ExternalLink, Calendar, Award, PlayCircle, 
  FileText, CheckSquare, Send, User, ChevronRight, Play,
  Smartphone, Lock, Plus, Edit2, Save, Trash2, AlertCircle,
  Download, Copy
} from 'lucide-react';

// --- 強制載入 Tailwind CSS (確保在任何環境下都有樣式) ---
if (typeof window !== 'undefined' && !document.getElementById('tailwind-cdn')) {
  const script = document.createElement('script');
  script.id = 'tailwind-cdn';
  script.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(script);
}

// --- Mock Data ---
const CLASS_INFO = {
  name: "八年2班 師生天地",
  slogan: "邏輯思考，探索無限可能",
  teacher: "John 老師"
};

const INITIAL_PHOTOS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800', title: '校慶運動會大隊接力', date: '2025-11-15' },
  { id: 2, url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800', title: '數學科展準備', date: '2025-10-20' },
  { id: 3, url: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&q=80&w=800', title: '戶外教學：科博館', date: '2025-09-05' },
  { id: 4, url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=800', title: '期中考後同樂會', date: '2025-04-10' },
  { id: 5, url: 'https://images.unsplash.com/photo-1427504494785-319ce8372379?auto=format&fit=crop&q=80&w=800', title: '班級讀書會', date: '2025-03-15' },
  { id: 6, url: 'https://images.unsplash.com/photo-1511629091441-ee46146481b6?auto=format&fit=crop&q=80&w=800', title: '校園寫生比賽', date: '2025-02-28' },
];

const INITIAL_SCHEDULE = [
  { id: 1, time: '08:10 - 09:00', mon: '國文', tue: '數學', wed: '英文', thu: '理化', fri: '數學' },
  { id: 2, time: '09:10 - 10:00', mon: '數學', tue: '英文', wed: '理化', thu: '體育', fri: '國文' },
  { id: 3, time: '10:10 - 11:00', mon: '英文', tue: '歷史', wed: '數學', thu: '公民', fri: '音樂' },
  { id: 4, time: '11:10 - 12:00', mon: '地理', tue: '國文', wed: '體育', thu: '數學', fri: '美術' },
  { id: 5, time: '13:30 - 14:20', mon: '理化', tue: '童軍', wed: '社團', thu: '英文', fri: '班會' },
  { id: 6, time: '14:30 - 15:20', mon: '輔導', tue: '理化', wed: '社團', thu: '國文', fri: '綜合' },
  { id: 7, time: '15:30 - 16:20', mon: '自習', tue: '自習', wed: '自習', thu: '自習', fri: '大掃除' },
];

const INITIAL_ROSTER = [
  { id: 1, role: '班長', name: '王大明', desc: '負責統籌班級事務' },
  { id: 2, role: '副班長', name: '林小美', desc: '協助班長，點名簿管理' },
  { id: 3, role: '風紀股長', name: '陳建宏', desc: '維持班級秩序' },
  { id: 4, role: '學藝股長', name: '張雅婷', desc: '教室佈置、作業登記' },
  { id: 5, role: '衛生股長', name: '黃俊傑', desc: '整潔區域分配與檢查' },
  { id: 6, role: '體育股長', name: '劉宇軒', desc: '帶操、體育器材借還' },
];

const INITIAL_VIDEOS = [
  { id: 1, title: '二次函數圖形解析 (重點複習)', duration: '15:20', views: 120 },
  { id: 2, title: '相似形與三角比 - 基礎觀念', duration: '22:15', views: 85 },
  { id: 3, title: '圓的性質：切線與弦', duration: '18:40', views: 92 },
];

const AWARDS = [
  { id: 1, date: '2025-11', title: '全校運動會 精神總錦標 第一名' },
  { id: 2, date: '2025-10', title: '生活榮譽競賽 連續三週 冠軍' },
  { id: 3, date: '2025-05', title: '校內數學競試 團體優等' },
];

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

// --- Main Application Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPwd, setAdminPwd] = useState('');
  const [loginError, setLoginError] = useState('');

  // 模擬使用者狀態
  const [user, setUser] = useState({ uid: 'guest-123' });
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
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
      setIsAdmin(false); // 登出
    } else {
      setShowLoginModal(true); // 打開登入視窗
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
    { id: 'discussion', label: '留言板', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans selection:bg-blue-200 flex flex-col">
      {/* Top Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white/90 backdrop-blur-md py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo area */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigateTo('home')}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:bg-blue-700 transition-colors">
                2
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-wider flex items-center gap-2">
                  {CLASS_INFO.name}
                  {isAdmin && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">管理模式</span>}
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">{CLASS_INFO.slogan}</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                    ${activeTab === item.id 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
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
               <a 
                href="https://check-scores-azure.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform"
              >
                <Smartphone size={20} />
                智慧校園家長通
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="pt-24 pb-20 md:pb-12 flex-grow">
        {activeTab === 'home' && <HomeView navigateTo={navigateTo} />}
        {activeTab === 'photos' && <PhotosView isAdmin={isAdmin} ConfirmModal={ConfirmModal} />}
        {activeTab === 'info' && <ClassInfoView isAdmin={isAdmin} />}
        {activeTab === 'resources' && <ResourcesView isAdmin={isAdmin} ConfirmModal={ConfirmModal} />}
        {activeTab === 'discussion' && <DiscussionView user={user} isAdmin={isAdmin} ConfirmModal={ConfirmModal} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">
          <p className="text-gray-500 text-sm">© 2026 {CLASS_INFO.name}. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-400 text-xs">導師：{CLASS_INFO.teacher}</p>
            <span className="text-gray-300">|</span>
            <button 
              onClick={handleAdminLoginClick}
              className={`text-xs flex items-center gap-1 ${isAdmin ? 'text-red-500 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Lock size={12} />
              {isAdmin ? '登出管理員' : '管理員登入'}
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Login Custom Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">管理員登入</h3>
              <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">請輸入密碼以開啟網頁編輯模式。</p>
            <input 
              type="password" 
              placeholder="密碼"
              value={adminPwd}
              onChange={(e) => setAdminPwd(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitLogin()}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 mb-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {loginError && <p className="text-red-500 text-xs mb-4">{loginError}</p>}
            <button 
              onClick={submitLogin} 
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors mt-2"
            >
              登入
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// Views Components
// ==========================================

function HomeView({ navigateTo }) {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px] md:h-[500px] group">
          <img 
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Class" 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent flex flex-col justify-end p-8 md:p-12">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-4 shadow-sm">
              班級公告
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
              歡迎來到八年2班<br/>探索邏輯與學習的樂趣
            </h2>
            <p className="text-gray-200 md:text-lg max-w-2xl mb-8">
              記錄孩子們的成長點滴，提供豐富的數學學習資源，建立親師溝通的優質橋樑。
            </p>
            
            {/* CTA for Parent Portal */}
            <a 
              href="https://check-scores-azure.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-full font-bold hover:bg-gray-50 hover:scale-105 transition-all shadow-lg w-max"
            >
              <Smartphone size={20} />
              開啟「智慧校園家長通」
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { id: 'photos', title: '活動精選', desc: '精彩瞬間', icon: <ImageIcon size={28} />, color: 'bg-rose-50 text-rose-600' },
            { id: 'info', title: '班級課表', desc: '作息一覽', icon: <Calendar size={28} />, color: 'bg-emerald-50 text-emerald-600' },
            { id: 'resources', title: '線上學習', desc: '教材與影片', icon: <PlayCircle size={28} />, color: 'bg-indigo-50 text-indigo-600' },
            { id: 'discussion', title: '親師交流', desc: '線上留言', icon: <MessageSquare size={28} />, color: 'bg-amber-50 text-amber-600' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center text-center transition-all hover:-translate-y-1 group"
            >
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Photos Preview & Awards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Recent Photos */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="text-blue-600" /> 最新活動
              </h3>
              <p className="text-gray-500 mt-1">捕捉生活中的美好片刻</p>
            </div>
            <button 
              onClick={() => navigateTo('photos')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              看更多 <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {INITIAL_PHOTOS.slice(0, 2).map((photo) => (
              <div key={photo.id} className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer" onClick={() => navigateTo('photos')}>
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white font-medium truncate">{photo.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Honor Roll */}
        <div>
           <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="text-yellow-500" /> 榮譽榜
              </h3>
              <p className="text-gray-500 mt-1">孩子們的優異表現</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-6">
              {AWARDS.map((award, index) => (
                <div key={award.id} className="flex gap-4 items-start relative">
                  {index !== AWARDS.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-gray-100"></div>
                  )}
                  <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0 z-10 mt-0.5">
                    <Award size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{award.date}</span>
                    <p className="text-gray-800 font-medium mt-1 leading-snug">{award.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotosView({ isAdmin, ConfirmModal }) {
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ title: '', url: '', date: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleAddPhoto = () => {
    if(!newPhoto.url || !newPhoto.title) return;
    const photo = {
      ...newPhoto,
      id: Date.now(),
      date: newPhoto.date || new Date().toISOString().split('T')[0]
    };
    setPhotos([photo, ...photos]);
    setShowAddModal(false);
    setNewPhoto({ title: '', url: '', date: '' });
  };

  const triggerDelete = (e, id) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDeletePhoto = () => {
    setPhotos(photos.filter(p => p.id !== deleteConfirmId));
    setDeleteConfirmId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="text-center mb-12 relative">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 inline-block relative">
          活動照片
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-blue-600 rounded-full mt-2"></div>
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          記錄每一刻的笑容與汗水，這裡是孩子們三年國中生活最珍貴的回憶庫。
        </p>
        
        {isAdmin && (
          <div className="absolute right-0 top-0">
             <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> 新增照片
            </button>
          </div>
        )}
      </div>

      {/* Masonry-like Grid */}
      <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="break-inside-avoid relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all"
            onClick={() => setSelectedImage(photo)}
          >
            <img 
              src={photo.url} 
              alt={photo.title} 
              className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700" 
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <span className="text-white/80 text-sm mb-1">{photo.date}</span>
              <h3 className="text-white font-bold text-lg">{photo.title}</h3>
            </div>
            {isAdmin && (
              <button 
                onClick={(e) => triggerDelete(e, photo.id)}
                className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmModal 
        isOpen={deleteConfirmId !== null}
        title="刪除照片"
        message="確定要刪除這張照片嗎？刪除後無法復原。"
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeletePhoto}
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">新增照片</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">照片網址 (URL)</label>
                <input type="text" value={newPhoto.url} onChange={e => setNewPhoto({...newPhoto, url: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">標題</label>
                <input type="text" value={newPhoto.title} onChange={e => setNewPhoto({...newPhoto, title: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">日期</label>
                <input type="date" value={newPhoto.date} onChange={e => setNewPhoto({...newPhoto, date: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">取消</button>
                <button onClick={handleAddPhoto} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">確認新增</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage.url} 
              alt={selectedImage.title} 
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
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

function ClassInfoView({ isAdmin }) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [roster, setRoster] = useState(INITIAL_ROSTER);
  const [isEditing, setIsEditing] = useState(false);

  // --- 匯入/匯出狀態 ---
  const [showIOModal, setShowIOModal] = useState(false);
  const [ioText, setIoText] = useState('');
  const [ioError, setIoError] = useState('');

  const handleScheduleChange = (id, field, value) => {
    setSchedule(schedule.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleRosterChange = (id, field, value) => {
    setRoster(roster.map(student => student.id === id ? { ...student, [field]: value } : student));
  };

  // --- 匯入/匯出邏輯 ---
  const handleOpenIO = () => {
    setIoText(JSON.stringify(schedule, null, 2));
    setIoError('');
    setShowIOModal(true);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(ioText);
      if (!Array.isArray(parsed)) throw new Error('資料必須是陣列格式');
      // 簡易檢查是否有正確的 key
      if (parsed.length > 0 && !('mon' in parsed[0] && 'time' in parsed[0])) {
         throw new Error('欄位不正確');
      }
      setSchedule(parsed);
      setShowIOModal(false);
      alert('課表匯入成功！');
    } catch (err) {
      setIoError('資料格式有誤，請確認是否為標準的 JSON 格式！');
    }
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(ioText).then(() => {
        alert('已複製到剪貼簿！');
      }).catch(err => fallbackCopyTextToClipboard(ioText));
    } catch (err) {
      fallbackCopyTextToClipboard(ioText);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert('已複製到剪貼簿！');
    } catch (err) {
      alert('複製失敗，請手動選取文字複製。');
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            班級資訊
            {/* 根據不同分頁顯示不同的編輯按鈕組合 */}
            {isAdmin && activeTab === 'schedule' && (
               <div className="flex gap-2">
                 <button 
                  onClick={handleOpenIO}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                 >
                   <Download size={16}/> 匯入/匯出
                 </button>
                 <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${isEditing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                 >
                  {isEditing ? <><Save size={16}/> 儲存變更</> : <><Edit2 size={16}/> 編輯內容</>}
                 </button>
               </div>
            )}
            {isAdmin && activeTab === 'roster' && (
               <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${isEditing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {isEditing ? <><Save size={16}/> 儲存變更</> : <><Edit2 size={16}/> 編輯名單</>}
              </button>
            )}
          </h2>
          <p className="text-gray-500">掌握作息與名單，讓校園生活更有條理</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'schedule' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            本學期課表
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'roster' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            班級幹部
          </button>
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
                {schedule.map((row, idx) => (
                  <React.Fragment key={row.id}>
                    {idx === 4 && (
                      <tr className="bg-blue-50/50">
                        <td colSpan="6" className="py-3 text-sm font-medium text-blue-600">午休時間 12:00 - 13:30</td>
                      </tr>
                    )}
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2 text-sm text-gray-500 bg-gray-50/50">
                         {isEditing ? <input value={row.time} onChange={e=>handleScheduleChange(row.id, 'time', e.target.value)} className="w-full text-center border rounded p-1"/> : row.time}
                      </td>
                      {['mon', 'tue', 'wed', 'thu', 'fri'].map(day => (
                        <td key={day} className={`py-4 px-2 font-medium ${!isEditing && row[day] === '數學' ? 'text-blue-600 font-bold bg-blue-50/30' : 'text-gray-800'}`}>
                           {isEditing ? 
                              <input value={row[day]} onChange={e=>handleScheduleChange(row.id, day, e.target.value)} className="w-full text-center border rounded p-1"/> 
                              : row[day]
                           }
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
              {roster.map((student) => (
                <div key={student.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors group ${isEditing ? 'border-blue-300 bg-blue-50/20' : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'}`}>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                    <User size={24} />
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input value={student.role} onChange={e=>handleRosterChange(student.id, 'role', e.target.value)} className="w-full text-sm font-bold border rounded p-1" placeholder="職位"/>
                        <input value={student.name} onChange={e=>handleRosterChange(student.id, 'name', e.target.value)} className="w-full text-sm text-blue-600 border rounded p-1" placeholder="姓名"/>
                        <input value={student.desc} onChange={e=>handleRosterChange(student.id, 'desc', e.target.value)} className="w-full text-xs text-gray-500 border rounded p-1" placeholder="說明"/>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-bold text-gray-900">{student.role} <span className="text-blue-600 ml-1">{student.name}</span></h4>
                        <p className="text-xs text-gray-500 mt-1">{student.desc}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg flex items-start gap-3">
              <span className="text-yellow-600 mt-0.5">⚠️</span>
              <p className="text-sm text-yellow-800">為保護學生隱私，完整全班名單與聯絡方式，請登入<a href="https://check-scores-azure.vercel.app/" className="font-bold underline ml-1">智慧校園家長通</a>查看。</p>
            </div>
          </div>
        )}
      </div>

      {/* Import/Export Modal */}
      {showIOModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold mb-2">匯入 / 匯出課表</h3>
            <p className="text-sm text-gray-600 mb-4">
              您可以在此複製目前的課表資料備份，或是貼上修改好的 JSON 格式資料進行整筆匯入。<br/>
              <span className="text-blue-600 font-medium">💡 小提醒：請保持原有 JSON 的屬性結構 (如 time, mon, tue, wed...) 以確保網頁正常解析。</span>
            </p>
            
            <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
              <textarea 
                className="w-full flex-1 p-4 border rounded-lg font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={ioText}
                onChange={(e) => setIoText(e.target.value)}
                spellCheck="false"
              />
            </div>
            
            {ioError && <p className="text-red-500 text-sm mt-3 font-medium">{ioError}</p>}
            
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <button onClick={() => setShowIOModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleCopy} className="px-4 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 flex items-center gap-1">
                <Copy size={16}/> 複製內容
              </button>
              <button onClick={handleImport} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                儲存匯入
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ResourcesView({ isAdmin, ConfirmModal }) {
  const [videos, setVideos] = useState(INITIAL_VIDEOS);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const confirmAddVideo = () => {
    if(newVideoTitle.trim()) {
      setVideos([...videos, { id: Date.now(), title: newVideoTitle, duration: '00:00', views: 0 }]);
      setShowAddVideoModal(false);
      setNewVideoTitle('');
    }
  };

  const confirmDeleteVideo = () => {
    setVideos(videos.filter(v => v.id !== deleteConfirmId));
    setDeleteConfirmId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">數位學習資源</h2>
        <p className="text-gray-500">數學沒有捷徑，只有多聽、多看、多練</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Videos Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <PlayCircle className="text-red-500" /> 教學影片區
            </h3>
            
            {isAdmin && (
              <button onClick={() => setShowAddVideoModal(true)} className="absolute top-6 right-6 flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
                <Plus size={16}/> 新增影片
              </button>
            )}

            <div className="space-y-4">
              {videos.map((video) => (
                <div key={video.id} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100 relative">
                  <div className="relative w-32 md:w-40 aspect-video bg-gray-900 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    <img 
                      src={`https://images.unsplash.com/photo-1632516643720-e7f0d7e6a727?auto=format&fit=crop&q=80&w=400&sig=${video.id}`} 
                      alt="thumbnail" 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                    />
                    <Play className="text-white w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">{video.duration}</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{video.title}</h4>
                    <p className="text-xs text-gray-500 mt-2">觀看次數：{video.views} 次</p>
                  </div>
                  
                  {isAdmin && (
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(video.id); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-2">
                      <Trash2 size={20}/>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Materials Column */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-md text-white relative">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <CheckSquare size={20} /> 本週作業與測驗
            </h3>
            {isAdmin && <button className="absolute top-4 right-4 text-white/70 hover:text-white"><Edit2 size={16}/></button>}
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 bg-yellow-400 rounded-full shrink-0"></div>
                <p className="text-sm">完成習作 Ch3-1 (P.45~P.48)</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 bg-yellow-400 rounded-full shrink-0"></div>
                <p className="text-sm">線上測驗：二次函數基礎題 (週五前提交)</p>
              </li>
            </ul>
            <button className="mt-6 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
              前往線上測驗系統
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <FileText className="text-blue-500" /> 補充教材下載
            </h3>
            {isAdmin && <button className="absolute top-6 right-6 text-blue-500 hover:text-blue-700"><Plus size={16}/></button>}
            <div className="space-y-2">
              {[
                { title: '會考歷屆試題彙整 (幾何篇)', ext: 'PDF' },
                { title: '公式記憶小卡', ext: 'PDF' },
                { title: '課堂講義 CH3', ext: 'DOC' },
              ].map((file, i) => (
                <button key={i} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 text-left group transition-colors">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 truncate pr-4">{file.title}</span>
                  <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded group-hover:bg-blue-200 group-hover:text-blue-800">{file.ext}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Video Modal */}
      <ConfirmModal 
        isOpen={deleteConfirmId !== null}
        title="刪除影片"
        message="確定要從資源列表中移除這部教學影片嗎？"
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteVideo}
      />

      {/* Add Video Modal */}
      {showAddVideoModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">新增教學影片</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">影片標題</label>
                <input 
                  type="text" 
                  value={newVideoTitle} 
                  onChange={e => setNewVideoTitle(e.target.value)} 
                  className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="例如：3-3 圓心角與圓周角" 
                />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button onClick={() => setShowAddVideoModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">取消</button>
                <button onClick={confirmAddVideo} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">確認新增</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DiscussionView({ user, isAdmin, ConfirmModal }) {
  const [messages, setMessages] = useState([
    { id: '1', text: '老師好，請問明天的數學小考範圍是哪裡？', author: '學生', role: 'student', time: '18:30' },
    { id: '2', text: '明天考第三章 3-1 到 3-2 喔！大家加油！', author: 'John 老師', role: 'teacher', time: '18:45' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [role, setRole] = useState(isAdmin ? 'teacher' : 'student'); 
  const [customName, setCustomName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // 若切換管理員模式，自動幫忙切換發言身分
    if(isAdmin) setRole('teacher');
  }, [isAdmin]);

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const displayName = customName.trim() || (role === 'teacher' ? 'John 老師' : (role === 'parent' ? '家長' : '學生'));
    
    const newMsg = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      userId: user.uid,
      author: displayName,
      role: role,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages([...messages, newMsg]);
    setNewMessage(''); 
  };

  const confirmDeleteMsg = () => {
    setMessages(messages.filter(m => m.id !== deleteConfirmId));
    setDeleteConfirmId(null);
  };

  const roleStyles = {
    teacher: { badge: 'bg-blue-100 text-blue-700', bg: 'bg-blue-50 border-blue-100', align: 'self-start' },
    parent: { badge: 'bg-amber-100 text-amber-700', bg: 'bg-white border-gray-100', align: 'self-end' },
    student: { badge: 'bg-emerald-100 text-emerald-700', bg: 'bg-white border-gray-100', align: 'self-end' },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in h-full flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">討論區 / 留言板</h2>
        <p className="text-gray-500">歡迎提問、交流學習心得或聯繫導師</p>
      </div>

      {/* Identity Selector */}
      <div className="bg-white p-4 rounded-t-2xl border border-gray-200 border-b-0 flex flex-wrap gap-4 items-center justify-between">
         <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 font-medium">發言身分：</span>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="border border-gray-300 rounded-md py-1 px-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={isAdmin} // 管理員強制為老師身分
            >
              <option value="student">學生</option>
              <option value="parent">家長</option>
              <option value="teacher">老師</option>
            </select>
         </div>
         <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 font-medium">暱稱：</span>
            <input 
              type="text" 
              placeholder="選填" 
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="border border-gray-300 rounded-md py-1 px-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-32"
            />
         </div>
      </div>

      {/* Chat Area */}
      <div className="bg-gray-50 border border-gray-200 rounded-b-2xl h-[500px] flex flex-col relative shadow-sm">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              目前還沒有留言，來當第一個發言的人吧！
            </div>
          ) : (
            messages.map((msg) => {
              const style = roleStyles[msg.role] || roleStyles.student;
              const isTeacher = msg.role === 'teacher';
              
              return (
                <div key={msg.id} className={`flex flex-col max-w-[80%] ${isTeacher ? 'items-start' : 'items-end self-end ml-auto'} group`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs text-gray-500">{msg.time}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.badge}`}>
                      {msg.role === 'teacher' ? '老師' : (msg.role === 'parent' ? '家長' : '學生')}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{msg.author}</span>
                    {isAdmin && (
                      <button onClick={() => setDeleteConfirmId(msg.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl shadow-sm border ${style.bg} ${isTeacher ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 md:p-4 bg-white border-t border-gray-200 rounded-b-2xl">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="輸入留言內容..."
              className="flex-1 resize-none border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none max-h-32 min-h-[50px]"
              rows="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button 
              type="submit"
              disabled={!newMessage.trim() || !user}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors flex items-center justify-center shrink-0 mb-1"
            >
              <Send size={20} className={newMessage.trim() ? 'translate-x-0.5 -translate-y-0.5 transition-transform' : ''} />
            </button>
          </form>
        </div>
      </div>

      {/* Delete Msg Confirm Modal */}
      <ConfirmModal 
        isOpen={deleteConfirmId !== null}
        title="刪除留言"
        message="確定要刪除這則討論區留言嗎？"
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteMsg}
      />
    </div>
  );
}