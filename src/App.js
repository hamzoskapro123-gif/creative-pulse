import React, { useState, useEffect } from 'react';
import { 
  Activity, Send, Menu, X, PlayCircle, 
  Palette, Terminal, PenTool, Calendar, 
  ArrowLeft, Code, Lightbulb, Mail, 
  Phone, CheckCircle, Lock, Layout, Briefcase, 
  Globe, Image as ImageIcon, Crown,
  Star, Quote, Eye, EyeOff, Users, Plus, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, setDoc, deleteDoc } from "firebase/firestore";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCIwky-mqyCNtuYxCcukmR1rXiQscs-naM",
  authDomain: "creative-pulse-64bce.firebaseapp.com",
  projectId: "creative-pulse-64bce",
  storageBucket: "creative-pulse-64bce.firebasestorage.app",
  messagingSenderId: "429693826752",
  appId: "1:429693826752:web:0cd038948f7dc9e4cc1f25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Custom Social Media Icons (SVGs) ---
const InstagramIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);
const TwitterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);
const LinkedinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('main'); 
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [portfolioWorks, setPortfolioWorks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch Reviews and Portfolio works
  useEffect(() => {
    // Reviews Listener
    const qReviews = query(collection(db, "reviews"), orderBy("timestamp", "desc"));
    const unsubReviews = onSnapshot(qReviews, (snapshot) => {
      setReviews(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Portfolio Listener
    const qWorks = query(collection(db, "works"), orderBy("timestamp", "desc"));
    const unsubWorks = onSnapshot(qWorks, (snapshot) => {
      setPortfolioWorks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubReviews(); unsubWorks(); };
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdminLoggedIn(true);
        setCurrentUser(user);
      } else {
        setIsAdminLoggedIn(false);
        setCurrentUser(null);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Secret URL check for /ADMIN ---
  useEffect(() => {
    const path = window.location.pathname.replace('/', '').toUpperCase();
    const hash = window.location.hash.replace('#', '').replace('/', '').toUpperCase();
    
    if (path === 'ADMIN' || hash === 'ADMIN' || hash.includes('/ADMIN')) {
      setCurrentRoute('admin_login');
      window.history.pushState({}, '', '/'); // Clean URL silently
    }
  }, []);

  const revealVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-[#090d16] flex justify-center items-center"><Activity className="w-10 h-10 text-violet-500 animate-spin" /></div>;
  }

  if (currentRoute === 'admin_login') {
    return <AdminLogin onLogin={() => setCurrentRoute('admin')} onBack={() => setCurrentRoute('main')} />;
  }
  
  if (currentRoute === 'admin') {
    return isAdminLoggedIn ? 
      <AdminDashboard setRoute={setCurrentRoute} setAdminStatus={setIsAdminLoggedIn} portfolioWorks={portfolioWorks} currentUser={currentUser} /> : 
      <AdminLogin onLogin={() => setCurrentRoute('admin')} onBack={() => setCurrentRoute('main')} />;
  }

  return (
    <div dir="rtl" className="text-slate-200 antialiased min-h-screen bg-[#090d16]" style={{ fontFamily: "'Cairo', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #090d16; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #8b5cf6; }
        .glass-card { background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .glass-nav { background: rgba(9, 13, 22, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
        .pulse-line { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw 3s linear infinite; }
        @keyframes draw { 0% { stroke-dashoffset: 1000; } 50% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -1000; } }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.95); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.8); }
        .star-rating input { display: none; }
        .star-rating label { float: left; cursor: pointer; color: #334155; transition: color 0.2s; }
        .star-rating label:before { content: '\\2605'; font-family: "Font Awesome 5 Free"; font-weight: 900; font-size: 1.5rem; padding-left: 0.25rem; }
        .star-rating input:checked ~ label { color: #fbbf24; }
        .star-rating label:hover, .star-rating label:hover ~ label { color: #fbbf24; }
        .review-marquee { display: flex; gap: 1.5rem; width: max-content; animation: scroll-rtl 40s linear infinite; }
        .review-marquee:hover { animation-play-state: paused; }
        @keyframes scroll-rtl { 0% { transform: translateX(0); } 100% { transform: translateX(var(--scroll-w)); } }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-violet-800/10 blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-emerald-500/5 blur-[100px] animate-blob" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-[40%] left-[30%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full bg-violet-600/5 blur-[150px] animate-blob" style={{ animationDelay: '5s' }}></div>
      </div>

      <Header />
      <main>
        <Hero revealVariant={revealVariant} />
        <Portfolio works={portfolioWorks} revealVariant={revealVariant} />
        <Blog revealVariant={revealVariant} />
        <Contact revealVariant={revealVariant} />
        <ReviewsSection reviews={reviews.filter(r => r.approved)} revealVariant={revealVariant} />
      </main>
      <Footer setRoute={setCurrentRoute} isAdminLoggedIn={isAdminLoggedIn} />
    </div>
  );
}

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 glass-nav ${isScrolled ? 'py-2 shadow-2xl bg-[#090d16]/95' : 'py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#home" className="text-2xl font-black tracking-wider bg-gradient-to-r from-violet-500 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3 group">
          <div className="relative flex items-center justify-center h-11 w-11 rounded-xl overflow-hidden border border-violet-500/30 bg-slate-900 group-hover:border-violet-500/80 transition-all duration-300 shadow-md shadow-violet-500/10">
            {/* هنا قمنا باستبدال أيقونة الـ Activity بصورتك */}
            <img src="/my-logo.png" alt="نبض الإبداع" className="w-full h-full object-cover" />
            <span className="absolute inline-flex h-full w-full rounded-xl bg-violet-500 opacity-5 animate-pulse"></span>
          </div>
          <span>نبض الإبداع</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 font-semibold text-[15px]">
          <a href="#home" className="text-violet-500 hover:text-violet-400 transition duration-300">الرئيسية</a>
          <a href="#portfolio" className="text-slate-400 hover:text-violet-500 transition duration-300">معرض الأعمال</a>
          <a href="#blog" className="text-slate-400 hover:text-violet-500 transition duration-300">المدونة</a>
          <a href="#contact" className="text-slate-400 hover:text-violet-500 transition duration-300">تواصل معي</a>
          <a href="#reviews" className="text-slate-400 hover:text-violet-500 transition duration-300">آراء العملاء</a>
        </nav>

        <div className="hidden md:flex items-center">
          <a href="#contact" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center">
            <Send className="w-4 h-4 ml-2" /> ابدأ مشروعك
          </a>
        </div>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-slate-300 hover:text-white">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden absolute top-full left-0 w-full glass-card border-t border-slate-800 overflow-hidden">
            <div className="px-6 py-6 flex flex-col gap-5 text-lg font-bold">
              <a onClick={() => setIsMobileMenuOpen(false)} href="#home" className="text-violet-500 py-2 border-b border-slate-800/50">الرئيسية</a>
              <a onClick={() => setIsMobileMenuOpen(false)} href="#portfolio" className="text-slate-400 py-2 border-b border-slate-800/50">معرض الأعمال</a>
              <a onClick={() => setIsMobileMenuOpen(false)} href="#blog" className="text-slate-400 py-2 border-b border-slate-800/50">المدونة</a>
              <a onClick={() => setIsMobileMenuOpen(false)} href="#contact" className="text-slate-400 py-2 border-b border-slate-800/50">تواصل معي</a>
              <a onClick={() => setIsMobileMenuOpen(false)} href="#reviews" className="text-slate-400 py-2">آراء العملاء</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero({ revealVariant }) {
  return (
    <section id="home" className="min-h-screen relative flex items-center pt-24 md:pt-16 z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 py-12 w-full">
        
        {/* Left Copy */}
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariant}
          className="lg:col-span-7 flex flex-col justify-center text-center lg:text-right"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-500 text-xs md:text-sm font-bold border border-violet-500/20 mb-6 self-center lg:self-start">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>مرحبًا بك في فضاء حمزة الحاكم الإبداعي</span>
          </div>
          
          {/* التعديل هنا: استخدام leading-loose وزيادة التباعد */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-loose sm:leading-[1.7] mb-6">
            <span className="block mb-4">
               معك <span className="bg-gradient-to-l from-violet-500 via-purple-400 to-emerald-400 bg-clip-text text-transparent">حمزة الحاكم</span>
            </span>
            <span className="text-white relative">
               مؤسس نبض الإبداع
            </span>
          </h1>
          
          <p className="text-slate-400 text-base sm:text-lg md:text-xl font-light mb-10 max-w-2xl leading-relaxed self-center lg:self-start">
            نحن لا نصمم فقط، بل نضخ النبض والحياة في الهويات البصرية، منشورات السوشال ميديا، وتجربة الويب والمواقع الإلكترونية المبتكرة لنجعل فكرتك تنبض جمالاً وقوة.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
            <a href="#portfolio" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 text-white font-black text-center shadow-xl shadow-violet-500/25 hover:shadow-violet-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 ml-2" /> عرض النبضات الإبداعية
            </a>
            <a href="#contact" className="w-full sm:w-auto px-8 py-4 rounded-full glass-card border border-slate-700/60 hover:border-violet-500 text-slate-300 hover:text-white font-bold text-center hover:-translate-y-1 transition-all duration-300">
              ابدأ نقاش مشروعك
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} viewport={{ once: true }} className="lg:col-span-5 flex justify-center items-center relative">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full flex justify-center items-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-slate-800 animate-[spin_40s_linear_infinite]"></div>
            <div className="absolute inset-4 rounded-full border border-violet-500/10 animate-[spin_20s_linear_infinite_reverse]"></div>
            <div className="absolute inset-10 rounded-full bg-gradient-to-tr from-violet-900/40 to-emerald-900/10 blur-2xl animate-pulse"></div>
            
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full overflow-hidden border border-slate-800/80 glass-card shadow-2xl z-10 flex flex-col items-center justify-center p-6">
              <svg className="w-full h-32" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 50 L80 50 L95 20 L110 80 L125 10 L140 90 L155 35 L170 65 L185 50 L290 50" stroke="rgba(255,255,255,0.06)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path className="pulse-line" d="M10 50 L80 50 L95 20 L110 80 L125 10 L140 90 L155 35 L170 65 L185 50 L290 50" stroke="url(#pulseGradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="pulseGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" /><stop offset="50%" stopColor="#10b981" /><stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center mt-4">
                <h2 className="text-2xl font-black tracking-widest text-white">نبض الإبداع</h2>
                <p className="text-emerald-400 font-sans text-xs tracking-wider uppercase mt-1">Creative Pulse Design</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Portfolio({ works, revealVariant }) {
  const [selectedWork, setSelectedWork] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const getIcon = (type) => {
    switch(type) {
      case 'social': return <InstagramIcon className="w-16 h-16 text-white/20 group-hover:text-white/40 group-hover:scale-110 transition duration-500" />;
      case 'web': return <Globe className="w-16 h-16 text-white/20 group-hover:text-white/40 group-hover:scale-110 transition duration-500" />;
      case 'poster': return <ImageIcon className="w-16 h-16 text-white/20 group-hover:text-white/40 group-hover:scale-110 transition duration-500" />;
      case 'identity': return <Crown className="w-16 h-16 text-white/20 group-hover:text-white/40 group-hover:scale-110 transition duration-500" />;
      default: return <Palette className="w-16 h-16 text-white/20 group-hover:text-white/40 group-hover:scale-110 transition duration-500" />;
    }
  };

  const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'web', name: 'تطوير ويب' },
    { id: 'social', name: 'سوشال ميديا' },
    { id: 'identity', name: 'هوية بصرية' },
    { id: 'poster', name: 'بوسترات' },
  ];

  const filteredWorks = activeFilter === 'all' ? works : works.filter(w => w.type === activeFilter);

  return (
    <section id="portfolio" className="py-24 relative z-10 bg-[#090d16]/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariant} className="text-center mb-10">
          <span className="text-sm font-bold text-violet-400 uppercase tracking-widest block mb-2">نبضاتنا الفنية</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">معرض الأعمال</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-violet-400 to-violet-600 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariant} className="flex justify-center flex-wrap gap-3 mb-12">
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveFilter(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeFilter === cat.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-gray-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'}`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {works.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Palette className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>لا توجد أعمال لعرضها حالياً. سيتم إضافة أعمال قريباً من لوحة الإدارة.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredWorks.map((work, idx) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  key={work.id} 
                  onClick={() => setSelectedWork(work)} 
                  className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-violet-500/50 hover:-translate-y-2 transition-all duration-300 group cursor-pointer flex flex-col h-full"
                >
                  <div className={`h-40 w-full bg-gradient-to-tr ${work.color || 'from-slate-800 to-slate-900'} relative overflow-hidden flex items-center justify-center`}>
                    {getIcon(work.type)}
                    <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/10">
                      {categories.find(c => c.id === work.type)?.name || work.type}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow text-center">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">{work.title}</h3>
                    <p className="text-slate-400 text-xs font-light leading-relaxed line-clamp-2">{work.desc}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedWork && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#090d16]/95 backdrop-blur-xl z-[100] flex justify-center items-center p-4" onClick={() => setSelectedWork(null)}>
            <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center transition z-50"><X className="w-6 h-6" /></button>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()} className="max-w-5xl w-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] lg:max-h-[80vh]">
              <div className={`lg:col-span-7 bg-gradient-to-tr ${selectedWork.color || 'from-slate-800 to-slate-900'} flex flex-col justify-center items-center p-12 text-center rounded-t-3xl lg:rounded-tr-none lg:rounded-r-3xl relative min-h-[300px]`}>
                 <div className="text-8xl opacity-80 mb-6 animate-pulse">{getIcon(selectedWork.type)}</div>
              </div>
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto bg-gray-900">
                <div className="space-y-4">
                  <div className="inline-block px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-bold rounded-full border border-violet-500/20">
                     {categories.find(c => c.id === selectedWork.type)?.name || selectedWork.type}
                  </div>
                  <h3 className="text-2xl font-black text-white">{selectedWork.title}</h3>
                  <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">{selectedWork.desc}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Blog({ revealVariant }) {
  return (
    <section id="blog" className="py-24 relative z-10 bg-[#090d16]/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariant} className="text-center mb-16">
          <span className="text-sm font-bold text-purple-400 uppercase tracking-widest block mb-2">مشاركة المعرفة والخبرات</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">مدونة نبض الإبداع</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-violet-600 mx-auto mt-4 rounded-full"></div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariant} className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-violet-500/50 hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full">
            <div className="h-48 w-full bg-gradient-to-tr from-violet-900 to-purple-900 relative overflow-hidden flex items-center justify-center">
              <PenTool className="w-16 h-16 text-white/10 group-hover:text-white/30 group-hover:scale-110 transition duration-500" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <span className="text-xs text-slate-500 mb-3 font-semibold flex items-center gap-1"><Calendar className="w-3 h-3" /> ١٥ مايو ٢٠٢٦</span>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-400 transition-colors">أهم تريندات التصميم الجرافيكي الحديثة</h3>
              <p className="text-slate-400 text-sm font-light leading-relaxed mb-6 flex-grow">نستعرض في هذا المقال أبرز الاتجاهات الحديثة في عالم التصميم وكيفية توظيفها.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Contact({ revealVariant }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'identity', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await addDoc(collection(db, "orders"), {
        ...formData,
        type: formData.subject,
        details: formData.message,
        date: new Date().toLocaleDateString('ar-EG'),
        timestamp: serverTimestamp(),
        status: 'pending'
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error saving order: ", error);
      alert("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariant} className="text-center mb-16">
          <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest block mb-2">تواصل مع حمزة الحاكم</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">دعنا نجعل أفكارك تنبض بالواقع</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-violet-600 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariant} className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-black text-white">هل تبحث عن لمسة إبداعية لعلامتك؟</h3>
            <p className="text-slate-400 leading-relaxed font-light text-base">يسعدني دائماً استقبال الأفكار الجديدة ومناقشتها. املأ النموذج وسأقوم بالرد عليك شخصياً.</p>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl glass-card border border-slate-800">
                <span className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500"><Mail className="w-5 h-5" /></span>
                <div>
                  <p className="text-xs text-slate-500 font-bold">البريد الإلكتروني المباشر</p>
                  <a href="mailto:hamza@creative-pulse.com" className="text-sm sm:text-base text-slate-200 font-semibold hover:text-violet-500 transition">hamza@creative-pulse.com</a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } } }} className="lg:col-span-7">
            <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6 relative overflow-hidden h-full">
              <AnimatePresence>
                {submitted && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#090d16]/95 backdrop-blur-md z-20 flex flex-col justify-center items-center p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 animate-bounce"><CheckCircle className="w-10 h-10" /></div>
                    <h4 className="text-2xl font-black text-white mb-2">تم إرسال نبضتك الإبداعية بنجاح!</h4>
                    <p className="text-slate-400 max-w-sm mb-8 text-sm sm:text-base">سأتواصل معك قريباً جداً للتنسيق والبدء بالعمل.</p>
                    <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: 'identity', message: '' }); }} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-full transition-all">
                      حسناً، رائع جداً
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">الاسم الكريم <span className="text-violet-500">*</span></label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#090d16]/80 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3.5 text-white transition placeholder-slate-600" placeholder="مثال: أحمد العتيبي" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">البريد الإلكتروني <span className="text-violet-500">*</span></label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#090d16]/80 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3.5 text-white transition placeholder-slate-600" placeholder="name@domain.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">رقم الهاتف (اختياري)</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#090d16]/80 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3.5 text-white transition placeholder-slate-600" placeholder="05xxxxxxxx" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">الخدمة المطلوبة <span className="text-violet-500">*</span></label>
                    <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-[#090d16]/80 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3.5 text-white transition appearance-none cursor-pointer">
                      <option value="identity" className="bg-gray-900 text-white">هوية بصرية وشعار</option>
                      <option value="social" className="bg-gray-900 text-white">تصميم منشورات سوشال ميديا</option>
                      <option value="web" className="bg-gray-900 text-white">تصميم وتطوير موقع ويب</option>
                      <option value="poster" className="bg-gray-900 text-white">بوسترات فنية مخصصة</option>
                      <option value="other" className="bg-gray-900 text-white">مشروع مخصص آخر</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">تفاصيل الفكرة أو المشروع <span className="text-violet-500">*</span></label>
                  <textarea required rows="5" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-[#090d16]/80 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3.5 text-white transition placeholder-slate-600 resize-none" placeholder="اكتب لنا باختصار تفاصيل هويتك البصرية أو مشروعك المطلوب..."></textarea>
                </div>
                <button type="submit" disabled={isSending} className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-600 text-white font-black text-center shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center">
                  {isSending ? 'جاري الإرسال...' : <><Send className="w-4 h-4 ml-2" /> إرسال طلبي الآن</>}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ReviewsSection({ reviews, revealVariant }) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const itemWidth = 350 + 24; 
  const scrollAmount = reviews.length > 0 ? reviews.length * itemWidth : 0;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('يرجى اختيار تقييم بالنجوم.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        name,
        comment: comment.trim() || null, 
        rating,
        date: new Date().toLocaleDateString('ar-EG'),
        timestamp: serverTimestamp(),
        approved: false 
      });
      setSubmitted(true);
      setRating(0);
      setName('');
      setComment('');
    } catch (error) {
      console.error("Error adding review: ", error);
      alert("حدث خطأ أثناء إرسال التقييم. تأكد من تفعيل الصلاحيات في Firebase Rules.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-24 relative z-10 bg-[#060910] overflow-hidden">
      <div className="w-full px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealVariant} className="text-center mb-12">
          <span className="text-sm font-bold text-yellow-400 uppercase tracking-widest block mb-2">قالوا عن نبض الإبداع</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">آراء شركاء النجاح</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-amber-600 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={revealVariant} className="max-w-2xl mx-auto mb-20 relative">
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl overflow-hidden relative">
               <h3 className="text-2xl font-black text-white mb-2 text-center">أضف تقييمك</h3>
               <p className="text-slate-400 text-sm mb-6 text-center">رأيك يهمنا ويساعدنا على تقديم الأفضل دائماً.</p>
               
               <AnimatePresence>
                {submitted && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#090d16]/95 backdrop-blur-md z-20 flex flex-col justify-center items-center p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black text-white mb-2">شكراً لتقييمك!</h4>
                    <p className="text-slate-400 text-sm mb-6">تم استلام تقييمك بنجاح، سيظهر قريباً بعد المراجعة.</p>
                    <button onClick={() => setSubmitted(false)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-full transition-all">إضافة تقييم آخر</button>
                  </motion.div>
                )}
              </AnimatePresence>

               <form onSubmit={handleSubmitReview} className="space-y-5">
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 text-center">اختر التقييم <span className="text-yellow-400">*</span></label>
                    <div className="flex flex-row-reverse justify-center gap-2 star-rating text-3xl">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <React.Fragment key={star}>
                          <input type="radio" id={`star${star}`} name="rating" value={star} checked={rating === star} onChange={() => setRating(star)} />
                          <label htmlFor={`star${star}`} title={`${star} نجوم`}></label>
                        </React.Fragment>
                      ))}
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">الاسم <span className="text-violet-500">*</span></label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#090d16]/80 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-white transition placeholder-slate-600" placeholder="اسمك الكريم" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">ملاحظة (اختياري)</label>
                    <textarea rows="3" value={comment} onChange={e => setComment(e.target.value)} className="w-full bg-[#090d16]/80 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl px-4 py-3 text-white transition placeholder-slate-600 resize-none" placeholder="اكتب رأيك في الخدمة المقدمة..."></textarea>
                 </div>
                 <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-center border border-slate-700 hover:border-violet-500 transition-all duration-300">
                    {isSubmitting ? 'جاري الإرسال...' : 'نشر التقييم'}
                 </button>
               </form>
            </div>
        </motion.div>

        {reviews.length > 0 ? (
          <div className="w-full overflow-hidden relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
            <div className="review-marquee" style={{ '--scroll-w': `${scrollAmount}px` }}>
              {Array(8).fill(reviews).flat().map((review, idx) => (
                <div key={`${review.id}-${idx}`} className="w-[350px] shrink-0 bg-gray-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors flex flex-col cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                       <h4 className="font-bold text-white text-lg">{review.name}</h4>
                       <span className="text-xs text-slate-500">{review.date}</span>
                     </div>
                     <div className="flex gap-1">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} />
                       ))}
                     </div>
                  </div>
                  {review.comment && (
                    <div className="flex-grow">
                       <Quote className="w-5 h-5 text-slate-700 mb-2" />
                       <p className="text-slate-400 text-sm leading-relaxed italic line-clamp-4">"{review.comment}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500 py-12">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>كن أول من يضيف تقييماً لخدماتنا!</p>
          </div>
        )}

      </div>
    </section>
  );
}

function Footer({ setRoute, isAdminLoggedIn }) {
  return (
    <footer className="border-t border-slate-900 bg-[#060910] relative z-10 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 relative">
        <div className="text-center md:text-right flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-violet-500/30 bg-slate-900 flex items-center justify-center">
             {/* هنا قمنا باستبدال أيقونة الـ Activity في الفوتر بصورتك */}
             <img src="/my-logo.png" alt="نبض الإبداع" className="w-full h-full object-cover" />
          </div>
          <div>
            <a href="#home" className="text-xl font-black bg-gradient-to-r from-violet-500 to-emerald-400 bg-clip-text text-transparent flex items-center justify-center md:justify-start gap-2">
              نبض الإبداع
            </a>
            <p className="text-xs text-slate-500 font-semibold">بإشراف المطور والمصمم حمزة الحاكم.</p>
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <p className="text-xs text-slate-500 mb-2">&copy; ٢٠٢٦ نبض الإبداع. جميع الحقوق محفوظة.</p>
        </div>

        <button 
          onClick={() => setRoute(isAdminLoggedIn ? 'admin' : 'admin_login')} 
          className="absolute bottom-0 right-0 p-2 opacity-10 hover:opacity-100 transition-opacity" 
          title="لوحة الإدارة"
        >
          <Lock className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </footer>
  );
}

function AdminLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setIsLoading(true);

    try {
      if (isResetMode) {
        if(!email) throw new Error("يرجى كتابة البريد الإلكتروني أولاً");
        await sendPasswordResetEmail(auth, email);
        setResetMessage("تم إرسال رابط تغيير كلمة المرور لبريدك الإلكتروني.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onLogin();
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('بيانات الدخول غير صحيحة.');
      } else {
        setError(err.message || 'حدث خطأ غير متوقع.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#090d16] font-sans" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <button onClick={onBack} className="absolute top-6 right-6 text-slate-400 hover:text-white flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-xl border border-slate-800 transition">
        <ArrowLeft className="w-4 h-4" /> عودة للموقع
      </button>
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-[2rem] shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-center mb-2 text-white">
          {isResetMode ? 'استعادة كلمة المرور' : 'تسجيل دخول الإدارة'}
        </h2>
        <p className="text-slate-400 text-sm text-center mb-8">
          {isResetMode ? 'أدخل بريدك الإلكتروني لنرسل لك رابط الاستعادة' : 'منطقة خاصة بإدارة موقع نبض الإبداع'}
        </p>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full p-4 rounded-xl border border-slate-800 bg-[#090d16] text-white focus:border-violet-500 outline-none transition"
            />
          </div>
          
          {!isResetMode && (
            <div>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full p-4 rounded-xl border border-slate-800 bg-[#090d16] text-white focus:border-violet-500 outline-none transition"
              />
            </div>
          )}

          {error && <p className="text-red-400 text-sm font-bold bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>}
          {resetMessage && <p className="text-emerald-400 text-sm font-bold bg-emerald-400/10 p-3 rounded-xl border border-emerald-400/20">{resetMessage}</p>}

          <button type="submit" disabled={isLoading} className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg shadow-lg shadow-violet-500/30 transition-colors disabled:opacity-50 flex justify-center items-center">
            {isLoading ? <Activity className="w-5 h-5 animate-spin" /> : (isResetMode ? 'إرسال رابط الاستعادة' : 'تسجيل الدخول')}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center text-sm font-bold">
          <button 
            type="button"
            onClick={() => { setIsResetMode(!isResetMode); setError(''); setResetMessage(''); }} 
            className="text-slate-400 hover:text-violet-400 transition"
          >
            {isResetMode ? 'العودة لتسجيل الدخول' : 'نسيت كلمة المرور؟'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Admin Dashboard (With Role Based Access Control) ---
function AdminDashboard({ setRoute, setAdminStatus, portfolioWorks, currentUser }) {
  // 🔴 هام جداً: غير هذا الإيميل إلى إيميلك الشخصي الذي تستخدمه في Firebase 🔴
  const SUPER_ADMIN_EMAIL = "ahp_z@yahoo.com"; 

  const [orders, setOrders] = useState([]);
  const [reviewsList, setReviewsList] = useState([]); 
  const [staffRoles, setStaffRoles] = useState({}); // To hold permissions from Firestore
  
  // States for UI
  const [activeTab, setActiveTab] = useState('pending'); 
  const [activeMenu, setActiveMenu] = useState('orders'); 
  
  // States for adding work
  const [newWork, setNewWork] = useState({ title: '', category: 'تطوير ويب', type: 'web', desc: '', color: 'from-emerald-900 to-teal-900' });
  const [isAddingWork, setIsAddingWork] = useState(false);

  // States for adding staff (Super Admin only)
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPerms, setNewStaffPerms] = useState({ orders: true, portfolio: false, reviews: false });
  const [isSavingStaff, setIsSavingStaff] = useState(false);

  // 1. Check Permissions
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;
  // If SuperAdmin, they see everything. Otherwise, check their permissions from Firestore.
  // Defaulting to empty object if not found, meaning they see nothing until assigned.
  const myPermissions = isSuperAdmin ? { orders: true, portfolio: true, reviews: true } : (staffRoles[currentUser?.email] || { orders: false, portfolio: false, reviews: false });

  // 2. Data Listeners
  useEffect(() => {
    // Orders
    const qOrders = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Reviews
    const qReviews = query(collection(db, "reviews"), orderBy("timestamp", "desc"));
    const unsubReviews = onSnapshot(qReviews, (snapshot) => {
      setReviewsList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Staff Permissions (Listen to 'staff' collection)
    const qStaff = query(collection(db, "staff"));
    const unsubStaff = onSnapshot(qStaff, (snapshot) => {
      const roles = {};
      snapshot.docs.forEach(d => {
        roles[d.id] = d.data().permissions; // email is document ID
      });
      setStaffRoles(roles);
    });

    return () => { unsubOrders(); unsubReviews(); unsubStaff(); };
  }, []);

  // Set default active menu based on permissions if current menu is not allowed
  useEffect(() => {
    if (!myPermissions[activeMenu] && !isSuperAdmin) {
      if (myPermissions.orders) setActiveMenu('orders');
      else if (myPermissions.portfolio) setActiveMenu('portfolio');
      else if (myPermissions.reviews) setActiveMenu('reviews');
      else setActiveMenu('none'); // No permissions at all
    }
  }, [myPermissions, activeMenu, isSuperAdmin]);


  // --- Actions ---
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    } catch (error) { alert("حدث خطأ أثناء التحديث."); }
  };

  const toggleReviewApproval = async (reviewId, currentStatus) => {
    try {
      await updateDoc(doc(db, "reviews", reviewId), { approved: !currentStatus });
    } catch (error) { alert("حدث خطأ."); }
  };

  const handleAddWork = async (e) => {
    e.preventDefault();
    setIsAddingWork(true);
    try {
      await addDoc(collection(db, "works"), { ...newWork, timestamp: serverTimestamp() });
      setNewWork({ title: '', category: 'تطوير ويب', type: 'web', desc: '', color: 'from-emerald-900 to-teal-900' }); 
      alert("تمت إضافة العمل بنجاح!");
    } catch (error) { alert("حدث خطأ."); } 
    finally { setIsAddingWork(false); }
  };

  const handleDeleteWork = async (workId) => {
    if (window.confirm("حذف العمل نهائياً؟")) {
      try { await deleteDoc(doc(db, "works", workId)); } 
      catch (error) { alert("خطأ بالحذف."); }
    }
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!newStaffEmail) return;
    setIsSavingStaff(true);
    try {
      // Document ID is the email address (converted to lowercase for safety)
      await setDoc(doc(db, "staff", newStaffEmail.toLowerCase()), {
        permissions: newStaffPerms
      });
      setNewStaffEmail('');
      alert("تم تحديث صلاحيات الحساب بنجاح!");
    } catch (error) {
      alert("حدث خطأ أثناء حفظ الصلاحيات. تأكد من قواعد Firebase.");
    } finally {
      setIsSavingStaff(false);
    }
  };

  const handleDeleteStaff = async (emailId) => {
    if (window.confirm("حذف صلاحيات هذا الحساب؟")) {
      try { await deleteDoc(doc(db, "staff", emailId)); } 
      catch (error) { alert("خطأ بالحذف."); }
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAdminStatus(false);
      setRoute('main');
    } catch (error) {}
  };

  // Helpers
  const handleTypeChange = (e) => {
    const type = e.target.value;
    let category = ''; let color = '';
    switch(type) {
      case 'web': category = 'تطوير ويب'; color = 'from-emerald-900 to-teal-900'; break;
      case 'social': category = 'سوشال ميديا'; color = 'from-violet-900 to-purple-900'; break;
      case 'poster': category = 'بوسترات'; color = 'from-fuchsia-900 to-pink-900'; break;
      case 'identity': category = 'هوية بصرية'; color = 'from-yellow-900 to-amber-900'; break;
      default: category = 'أخرى'; color = 'from-slate-800 to-slate-900';
    }
    setNewWork({ ...newWork, type, category, color });
  };

  const filteredOrders = orders.filter(o => (o.status || 'pending') === activeTab);

  if (activeMenu === 'none') {
    return (
       <div className="min-h-screen bg-[#090d16] flex flex-col justify-center items-center text-center p-6">
          <Lock className="w-16 h-16 text-red-500 mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-2">ليس لديك صلاحيات</h2>
          <p className="text-slate-400 mb-6">هذا الحساب غير مصرح له برؤية أي قسم. تواصل مع الإدارة.</p>
          <button onClick={handleLogout} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">تسجيل الخروج</button>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] font-sans text-slate-200 flex" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-l border-slate-800 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shadow-inner">
               <Crown className="w-5 h-5" />
             </div>
             <h2 className="text-xl font-black text-white">الإدارة</h2>
          </div>
          <p className="text-[10px] text-slate-500 truncate" title={currentUser?.email}>{currentUser?.email}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {myPermissions.orders && (
            <button onClick={() => setActiveMenu('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeMenu === 'orders' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Briefcase className="w-5 h-5" /> إدارة الطلبات
            </button>
          )}
          
          {myPermissions.portfolio && (
            <button onClick={() => setActiveMenu('portfolio')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeMenu === 'portfolio' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Palette className="w-5 h-5" /> معرض الأعمال
            </button>
          )}

          {myPermissions.reviews && (
            <button onClick={() => setActiveMenu('reviews')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${activeMenu === 'reviews' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <div className="flex items-center gap-3"><Star className="w-5 h-5" /> التقييمات</div>
              {reviewsList.filter(r => !r.approved).length > 0 && (
                 <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{reviewsList.filter(r => !r.approved).length} جديد</span>
              )}
            </button>
          )}

          {/* Super Admin Only Menu */}
          {isSuperAdmin && (
             <>
               <div className="pt-4 mt-4 border-t border-slate-800"></div>
               <button onClick={() => setActiveMenu('accounts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeMenu === 'accounts' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <Users className="w-5 h-5" /> إدارة فريق العمل
               </button>
             </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full px-4 py-3 bg-red-500/10 text-red-400 rounded-xl font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          <div className="bg-gray-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-2rem)]">
            
            {/* --- ORDERS MENU --- */}
            {activeMenu === 'orders' && myPermissions.orders && (
              <>
                <div className="p-6 sm:p-8 border-b border-slate-800 shrink-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2">إدارة الطلبات الواردة</h3>
                      <p className="text-slate-400 text-sm">راجع طلبات عملائك، وافرزها حسب حالة العمل.</p>
                    </div>
                    <div className="flex bg-[#090d16] p-1.5 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto custom-scrollbar">
                      <button onClick={() => setActiveTab('pending')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'pending' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                        قيد المراجعة
                      </button>
                      <button onClick={() => setActiveTab('in_progress')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'in_progress' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                        قيد العمل
                      </button>
                      <button onClick={() => setActiveTab('completed')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'completed' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                        منتهية
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-[#060910]">
                  {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
                      <Send className="w-10 h-10 opacity-30 mb-4" />
                      <p className="text-lg font-bold">لا توجد طلبات هنا حالياً.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {filteredOrders.map(order => (
                        <div key={order.id} className="p-6 border border-slate-800 rounded-2xl bg-gray-900 group flex flex-col h-full relative overflow-hidden">
                          <div className={`absolute top-0 left-0 w-full h-1 ${activeTab === 'pending' ? 'bg-amber-400' : activeTab === 'in_progress' ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                          <h4 className="font-bold text-xl text-white mb-2">{order.name}</h4>
                          <p className="text-xs text-slate-400 mb-4">{order.email}</p>
                          <div className="bg-[#090d16] p-4 rounded-xl border border-slate-800 mb-6 flex-1">
                            <p className="text-slate-300 text-sm whitespace-pre-wrap">{order.details}</p>
                          </div>
                          <div className="flex gap-3 mt-auto pt-4 border-t border-slate-800">
                            {activeTab === 'pending' && (
                              <>
                                <button onClick={() => updateOrderStatus(order.id, 'in_progress')} className="flex-1 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl">قبول</button>
                                <button onClick={() => updateOrderStatus(order.id, 'completed')} className="flex-1 py-2 bg-slate-800 text-slate-300 text-sm font-bold rounded-xl">رفض</button>
                              </>
                            )}
                            {activeTab === 'in_progress' && (
                              <button onClick={() => updateOrderStatus(order.id, 'completed')} className="w-full py-2 bg-violet-600 text-white text-sm font-bold rounded-xl">إنهاء الطلب</button>
                            )}
                            {activeTab === 'completed' && (
                              <button onClick={() => updateOrderStatus(order.id, 'pending')} className="w-full py-2 bg-slate-800 text-slate-300 text-sm font-bold rounded-xl">إعادة للمراجعة</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* --- PORTFOLIO MENU --- */}
            {activeMenu === 'portfolio' && myPermissions.portfolio && (
              <>
                <div className="p-6 sm:p-8 border-b border-slate-800 shrink-0">
                  <h3 className="text-2xl font-black text-white mb-2">إدارة معرض الأعمال</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-[#060910] grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-5">
                    <div className="bg-gray-900 rounded-3xl p-6 border border-slate-800">
                      <h4 className="text-xl font-bold text-white mb-6">إضافة عمل جديد</h4>
                      <form onSubmit={handleAddWork} className="space-y-4">
                        <input required type="text" value={newWork.title} onChange={e => setNewWork({...newWork, title: e.target.value})} className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" placeholder="عنوان العمل" />
                        <select value={newWork.type} onChange={handleTypeChange} className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-3 text-white text-sm">
                          <option value="web">تطوير ويب</option>
                          <option value="social">سوشال ميديا</option>
                          <option value="identity">هوية بصرية</option>
                          <option value="poster">بوسترات</option>
                        </select>
                        <textarea required rows="4" value={newWork.desc} onChange={e => setNewWork({...newWork, desc: e.target.value})} className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" placeholder="وصف العمل"></textarea>
                        <button type="submit" disabled={isAddingWork} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl">نشر العمل</button>
                      </form>
                    </div>
                  </div>
                  <div className="lg:col-span-7">
                    <h4 className="text-xl font-bold text-white mb-6">الأعمال الحالية</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {portfolioWorks.map(work => (
                        <div key={work.id} className="bg-gray-900 border border-slate-800 rounded-2xl p-4">
                          <h5 className="font-bold text-white text-sm mb-1">{work.title}</h5>
                          <p className="text-slate-500 text-xs mb-4">{work.desc}</p>
                          <button onClick={() => handleDeleteWork(work.id)} className="w-full py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold">حذف</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* --- REVIEWS MENU --- */}
            {activeMenu === 'reviews' && myPermissions.reviews && (
              <>
                <div className="p-6 sm:p-8 border-b border-slate-800 shrink-0">
                  <h3 className="text-2xl font-black text-white">إدارة آراء العملاء</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-[#060910]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviewsList.map(review => (
                      <div key={review.id} className={`p-6 rounded-2xl border ${review.approved ? 'bg-gray-900 border-slate-800' : 'bg-violet-900/10 border-violet-500/30'}`}>
                         <h4 className="font-bold text-white text-lg mb-4">{review.name}</h4>
                         <p className="text-slate-300 text-sm mb-6">"{review.comment}"</p>
                         <button onClick={() => toggleReviewApproval(review.id, review.approved)} className={`w-full py-2.5 rounded-xl text-sm font-bold ${review.approved ? 'bg-slate-800 text-slate-300' : 'bg-emerald-600 text-white'}`}>
                           {review.approved ? 'إخفاء من الموقع' : 'إظهار في الموقع'}
                         </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* --- ACCOUNTS MENU (SUPER ADMIN ONLY) --- */}
            {activeMenu === 'accounts' && isSuperAdmin && (
              <>
                <div className="p-6 sm:p-8 border-b border-slate-800 shrink-0">
                  <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2"><Users className="text-emerald-400" /> إدارة فريق العمل والصلاحيات</h3>
                  <p className="text-slate-400 text-sm">حدد من يمكنه رؤية أقسام معينة في لوحة التحكم. (تذكر إنشاء الحساب لهم أولاً في Firebase).</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-[#060910] grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Form to add/edit role */}
                  <div className="lg:col-span-5">
                    <div className="bg-gray-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
                      <h4 className="text-lg font-bold text-white mb-6">إعطاء صلاحيات لحساب</h4>
                      <form onSubmit={handleSaveStaff} className="space-y-5">
                        <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2">إيميل الموظف</label>
                          <input required type="email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} className="w-full bg-[#090d16] border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white text-sm" placeholder="employee@domain.com" />
                        </div>
                        
                        <div className="space-y-3 bg-[#090d16] p-4 rounded-xl border border-slate-800">
                          <p className="text-sm font-bold text-white mb-2">الأقسام المسموح بها:</p>
                          
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={newStaffPerms.orders} onChange={e => setNewStaffPerms({...newStaffPerms, orders: e.target.checked})} className="w-5 h-5 rounded accent-emerald-500" />
                            <span className="text-slate-300 text-sm">إدارة الطلبات</span>
                          </label>
                          
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={newStaffPerms.portfolio} onChange={e => setNewStaffPerms({...newStaffPerms, portfolio: e.target.checked})} className="w-5 h-5 rounded accent-emerald-500" />
                            <span className="text-slate-300 text-sm">معرض الأعمال</span>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={newStaffPerms.reviews} onChange={e => setNewStaffPerms({...newStaffPerms, reviews: e.target.checked})} className="w-5 h-5 rounded accent-emerald-500" />
                            <span className="text-slate-300 text-sm">إدارة التقييمات</span>
                          </label>
                        </div>

                        <button type="submit" disabled={isSavingStaff} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all">
                          {isSavingStaff ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* List of current staff */}
                  <div className="lg:col-span-7">
                    <h4 className="text-xl font-bold text-white mb-6">الحسابات المصرح لها</h4>
                    <div className="space-y-4">
                      {Object.keys(staffRoles).length === 0 ? (
                        <p className="text-slate-500">لا يوجد موظفين حالياً. أنت الوحيد الذي تدير الموقع.</p>
                      ) : (
                        Object.keys(staffRoles).map(email => (
                          <div key={email} className="bg-gray-900 border border-slate-800 rounded-2xl p-5 flex justify-between items-center group">
                            <div>
                              <p className="font-bold text-white mb-2">{email}</p>
                              <div className="flex gap-2">
                                {staffRoles[email].orders && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded">الطلبات</span>}
                                {staffRoles[email].portfolio && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded">الأعمال</span>}
                                {staffRoles[email].reviews && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">التقييمات</span>}
                              </div>
                            </div>
                            <button onClick={() => handleDeleteStaff(email)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}