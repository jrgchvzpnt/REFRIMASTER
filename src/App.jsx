import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Wrench, Wind, Refrigerator, ShoppingBag, Plus, Trash2, LogOut, 
  Phone, MapPin, Lock, Edit3, ShieldCheck, Clock, Award, 
  Zap, MessageCircle, Instagram, Facebook, Mail, ExternalLink,
  Menu, X, Home, Info, UserCheck, Play, ChevronLeft, ChevronRight, Eye,
  Youtube, Truck
} from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyANyFY760SJBasNC2wjF9sWu4NcOZjLqd0",
  authDomain: "refrimaster-151bf.firebaseapp.com",
  projectId: "refrimaster-151bf",
  storageBucket: "refrimaster-151bf.firebasestorage.app",
  messagingSenderId: "17061661794",
  appId: "1:17061661794:web:252b354a61eabd42f3553b",
  measurementId: "G-FQS2HRRF98"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'refrimaster-oficial';
const WHATSAPP_NUMBER = "+526673312378";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('Todos'); 
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0);
  
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    category: 'Lavadora', 
    description: '', 
    imageUrls: '', 
    videoUrl: '' 
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  }, [view]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(!!u?.email);
      setLoading(false);
      if (!u) signInAnonymously(auth).catch(console.error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    return onSnapshot(productsRef, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts([...prods].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    });
  }, [user]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setView('admin');
      setEmail(''); setPassword('');
    } catch (err) { alert("Credenciales incorrectas."); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    await signInAnonymously(auth);
    setIsAdmin(false);
    setView('home');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      const imagesArray = newProduct.imageUrls.split(',').map(url => url.trim()).filter(url => url !== '');
      const data = { 
        ...newProduct, 
        imageUrls: imagesArray,
        price: parseFloat(newProduct.price), 
        updatedAt: new Date().toISOString() 
      };

      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingId), data);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), { 
          ...data, 
          createdAt: new Date().toISOString() 
        });
      }
      setNewProduct({ name: '', price: '', category: 'Lavadora', description: '', imageUrls: '', videoUrl: '' });
      setView('catalog');
    } catch (err) { alert("Error al guardar."); }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=0` : null;
  };

  const getProductImages = (p) => {
    if (p.imageUrls && Array.isArray(p.imageUrls) && p.imageUrls.length > 0) return p.imageUrls;
    if (p.imageUrl) return [p.imageUrl];
    return ['https://images.unsplash.com/photo-1558522195-e1201b090344?q=80&w=500']; 
  };

  const renderProductModal = () => {
    if (!selectedProduct) return null;
    const images = getProductImages(selectedProduct);
    const videoEmbed = getYouTubeEmbedUrl(selectedProduct.videoUrl);
    const hasMultipleMedia = images.length > 1 || videoEmbed;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-10">
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setSelectedProduct(null)}></div>
        <div className="relative bg-white w-full max-w-6xl max-h-[95vh] rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">
          <button 
            className="absolute top-6 right-6 z-50 bg-slate-100/80 backdrop-blur-md p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl"
            onClick={() => setSelectedProduct(null)}
          >
            <X size={24} />
          </button>

          {/* Área Visual - Corregido object-contain para no cortar fotos de Coppel/Walmart */}
          <div className="w-full md:w-3/5 bg-white flex flex-col relative h-[400px] md:h-auto border-r border-gray-100">
            <div className="flex-grow flex items-center justify-center p-6 overflow-hidden relative group">
              {videoEmbed && currentGalleryIdx === images.length ? (
                <div className="w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl">
                  <iframe 
                    src={videoEmbed} 
                    className="w-full h-full" 
                    title="Demostración" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <img 
                  src={images[currentGalleryIdx]} 
                  className="w-full h-full object-contain transition-all duration-700 animate-in fade-in" 
                  alt=""
                  title=""
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              
              {hasMultipleMedia && (
                <>
                  <button 
                    onClick={() => setCurrentGalleryIdx(prev => prev > 0 ? prev - 1 : (videoEmbed ? images.length : images.length - 1))}
                    className="absolute left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button 
                    onClick={() => setCurrentGalleryIdx(prev => prev < (videoEmbed ? images.length : images.length - 1) ? prev + 1 : 0)}
                    className="absolute right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>
            
            {/* Selector de imágenes corregido */}
            {hasMultipleMedia && (
              <div className="p-6 flex gap-3 overflow-x-auto no-scrollbar justify-center bg-gray-50 border-t border-gray-100">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentGalleryIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white shadow-sm ${currentGalleryIdx === idx ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-contain" alt="" title="" onError={(e) => { e.target.parentElement.style.display = 'none'; }} />
                  </button>
                ))}
                {videoEmbed && (
                  <button 
                    onClick={() => setCurrentGalleryIdx(images.length)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-900 flex items-center justify-center text-white ${currentGalleryIdx === images.length ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent opacity-50'}`}
                  >
                    <Play size={24} fill="currentColor" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="w-full md:w-2/5 p-8 md:p-14 flex flex-col justify-between bg-white overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{selectedProduct.category}</span>
                <span className="flex items-center gap-1.5 text-green-500 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> En existencia
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight leading-[0.9] mb-8">{selectedProduct.name}</h2>
              <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest leading-relaxed mb-10 whitespace-pre-wrap">{selectedProduct.description}</p>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-4 text-slate-400">
                  <ShieldCheck size={18} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Garantía oficial RefriMaster</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <Truck size={18} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Envío e instalación a domicilio</span>
                </div>
              </div>
            </div>
            
            <div className="pt-10 border-t border-gray-100">
              <div className="flex items-end justify-between mb-10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Precio de Inversión</span>
                  <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">${selectedProduct.price.toLocaleString()}</span>
                </div>
              </div>
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola Jorge, me interesa este equipo: ${selectedProduct.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 text-white p-6 rounded-[24px] flex items-center justify-center gap-4 font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all"
              >
                <MessageCircle size={22} /> Solicitar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHome = () => (
    <div className="space-y-16 animate-in fade-in duration-500 pb-20">
      <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden rounded-[50px] mt-4 mx-4 shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=2070" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.3]" 
          alt="" 
        />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 backdrop-blur-md border border-blue-500/30 px-5 py-2.5 rounded-full mb-8">
            <ShieldCheck size={18} className="text-blue-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Servicio 100% Certificado</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-[0.85]">Especialistas <br/><span className="text-blue-500">en Frío</span></h1>
          <p className="text-blue-100/70 font-bold uppercase text-xs tracking-[0.3em] mb-12 max-w-xl mx-auto">Soluciones técnicas definitivas para tu hogar y negocio.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <button onClick={() => setView('catalog')} className="bg-blue-600 hover:bg-blue-500 px-14 py-6 rounded-2xl font-black shadow-2xl transition-all hover:scale-105 uppercase text-xs tracking-widest">Ver Catálogo</button>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="bg-white text-blue-950 px-14 py-6 rounded-2xl font-black shadow-2xl transition-all hover:bg-gray-100 uppercase text-xs tracking-widest">Agendar Cita</a>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6">
        <div className="flex flex-col items-center mb-16 text-center">
           <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.5em] mb-4">Nuestra Especialidad</span>
           <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-900">Servicios Premium</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Refrigerator size={32}/>, title: 'Refrigeración', desc: 'Gas y tarjetas inverter.' },
            { icon: <Wrench size={32}/>, title: 'Lavado', desc: 'Transmisiones y mantenimiento.' },
            { icon: <Wind size={32}/>, title: 'Aires', desc: 'Limpieza y recarga de gas.' },
            { icon: <Zap size={32}/>, title: 'Electricidad', desc: 'Instalaciones industriales.', premium: true }
          ].map((s, i) => (
            <div key={i} className={`p-12 bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group ${s.premium ? 'ring-2 ring-blue-600/10' : ''}`}>
              <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                {s.icon}
              </div>
              <h3 className="font-black text-2xl mb-4 uppercase tracking-tighter text-gray-900">{s.title}</h3>
              <p className="text-gray-500 text-xs font-bold uppercase leading-relaxed tracking-wider">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderCatalog = () => {
    const filteredProducts = filter === 'Todos' ? products : products.filter(p => p.category === filter);
    return (
      <div className="container mx-auto px-6 py-20 animate-in slide-in-from-bottom-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
          <div className="text-center md:text-left">
            <span className="text-blue-600 font-black text-[11px] uppercase tracking-[0.5em] mb-4 block">Inventario Oficial</span>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-slate-900">Showroom <span className="text-blue-600">Master</span></h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 bg-white p-3 rounded-3xl shadow-xl border border-gray-50">
            {['Todos', 'Lavadora', 'Refrigerador', 'Aire Acondicionado', 'Electricidad'].map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-7 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-transparent text-slate-400 hover:text-blue-600'}`}>{cat}</button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {filteredProducts.map(p => {
            const images = getProductImages(p);
            return (
              <div key={p.id} className="group bg-white rounded-[45px] overflow-hidden border border-gray-50 shadow-sm hover:shadow-3xl transition-all duration-700 flex flex-col h-full relative">
                <div 
                  className="h-80 overflow-hidden relative cursor-pointer bg-white"
                  onClick={() => { setSelectedProduct(p); setCurrentGalleryIdx(0); }}
                >
                  <img src={images[0]} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-1000" alt="" loading="lazy" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1558522195-e1201b090344?q=80&w=500'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end justify-center p-8 opacity-0 group-hover:opacity-100 transition-all">
                    <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase text-slate-900 shadow-2xl">
                      <Eye size={18} /> Detalles del equipo
                    </div>
                  </div>
                  <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md px-5 py-2 rounded-2xl text-[10px] font-black uppercase shadow-xl text-blue-600 tracking-tighter">{p.category}</div>
                  
                  <div className="absolute top-8 right-8 flex gap-3">
                    {images.length > 1 && (
                      <div className="bg-white/95 backdrop-blur-md w-10 h-10 rounded-2xl flex items-center justify-center text-[11px] font-black text-slate-900 shadow-xl">+{images.length - 1}</div>
                    )}
                    {p.videoUrl && (
                      <div className="bg-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200"><Play size={16} fill="currentColor" /></div>
                    )}
                  </div>
                </div>

                <div className="p-12 flex flex-col flex-grow">
                  <h3 className="font-black text-2xl mb-4 text-slate-900 uppercase tracking-tight leading-none group-hover:text-blue-600 transition-colors">{p.name}</h3>
                  <p className="text-slate-400 text-[11px] mb-10 font-bold uppercase leading-relaxed tracking-wider line-clamp-3">{p.description}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">Costo Master</span>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">${p.price.toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedProduct(p)}
                      className="bg-blue-600 text-white w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-2 transition-all active:scale-90"
                    >
                      <ShoppingBag size={24}/>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAdmin = () => {
    if (!isAdmin) return (
      <div className="max-w-md mx-auto py-32 px-6">
        <div className="bg-white p-16 rounded-[55px] shadow-3xl border border-gray-50 text-center">
          <div className="bg-blue-600 w-28 h-28 rounded-[35px] flex items-center justify-center mx-auto mb-12 shadow-3xl shadow-blue-500/30 text-white"><Lock size={50} /></div>
          <h2 className="text-4xl font-black mb-12 uppercase tracking-tighter text-slate-900 leading-none">Acceso <br/>Maestro</h2>
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <input type="email" placeholder="Usuario" className="w-full p-6 rounded-3xl bg-slate-50 outline-none font-black text-slate-700 uppercase text-[11px] tracking-[0.2em] border-2 border-transparent focus:border-blue-200 transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Contraseña" className="w-full p-6 rounded-3xl bg-slate-50 outline-none font-black text-slate-700 uppercase text-[11px] tracking-[0.2em] border-2 border-transparent focus:border-blue-200 transition-all" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="w-full bg-slate-900 text-white font-black py-7 rounded-3xl shadow-2xl hover:bg-blue-600 transition-all uppercase tracking-[0.3em] mt-8 text-[11px]">Autenticar</button>
          </form>
        </div>
      </div>
    );
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-slate-900">
        <div className="flex flex-col md:flex-row justify-between items-center mb-24 gap-10">
          <div>
            <span className="text-blue-600 font-black text-[11px] uppercase tracking-[0.5em] mb-4 block">Administración Central</span>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">Panel de Gestión</h2>
          </div>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 px-12 py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center gap-4 hover:bg-red-600 hover:text-white transition-all shadow-xl"><LogOut size={20}/> Cerrar Sesión</button>
        </div>
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4 bg-white p-12 rounded-[50px] shadow-3xl border border-gray-50 sticky top-32 h-fit">
            <h3 className="text-sm font-black mb-12 text-blue-600 uppercase tracking-[0.4em] flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
                {editingId ? "Actualizar Inventario" : "Nuevo Ingreso"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input required className="w-full p-5 rounded-2xl bg-slate-50 outline-none font-black text-[12px] uppercase border-2 border-transparent focus:border-blue-200 transition-all" placeholder="Modelo / Nombre" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input required type="number" className="w-full p-5 rounded-2xl bg-slate-50 outline-none font-black text-[12px] uppercase border-2 border-transparent focus:border-blue-200 transition-all" placeholder="Precio de Venta" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              <select className="w-full p-5 rounded-2xl bg-slate-50 outline-none font-black text-[12px] uppercase cursor-pointer" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option>Lavadora</option><option>Refrigerador</option><option>Aire Acondicionado</option><option>Secadora</option><option>Electricidad</option></select>
              <textarea required className="w-full p-5 rounded-2xl bg-slate-50 outline-none font-black text-[10px] text-blue-400 border-2 border-transparent focus:border-blue-200 transition-all h-28 resize-none" placeholder="Enlaces de fotos (separe cada una con una coma , )" value={newProduct.imageUrls} onChange={e => setNewProduct({...newProduct, imageUrls: e.target.value})} />
              
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-red-500 ml-4">Enlace de YouTube (Opcional)</label>
                <input className="w-full p-5 rounded-2xl bg-slate-50 outline-none font-black text-[10px] text-red-500 border-2 border-transparent focus:border-blue-200 transition-all" placeholder="https://youtube.com/watch?v=..." value={newProduct.videoUrl} onChange={e => setNewProduct({...newProduct, videoUrl: e.target.value})} />
              </div>

              <textarea required className="w-full p-5 rounded-2xl bg-slate-50 outline-none font-black text-[12px] h-40 resize-none uppercase border-2 border-transparent focus:border-blue-200 transition-all" placeholder="Especificaciones técnicas" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              <button className="w-full bg-blue-600 text-white font-black py-7 rounded-[28px] shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase tracking-[0.3em] text-[11px] mt-8">{editingId ? "Guardar Cambios" : "Publicar Ahora"}</button>
            </form>
          </div>
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-xl font-black uppercase tracking-[0.5em] text-slate-300 ml-8">Equipos en Stock</h3>
            {products.map(p => {
              const images = getProductImages(p);
              return (
                <div key={p.id} className="bg-white p-8 rounded-[40px] flex items-center justify-between border border-gray-50 shadow-sm hover:shadow-2xl transition-all group">
                  <div className="flex items-center gap-8">
                    <img src={images[0]} className="w-20 h-20 rounded-[24px] object-contain shadow-lg bg-white p-1" alt="" title="" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1558522195-e1201b090344?q=80&w=500'; }} />
                    <div>
                      <div className="font-black text-slate-900 uppercase text-xl tracking-tighter leading-none mb-1">{p.name}</div>
                      <div className="text-[11px] font-black text-blue-600 uppercase tracking-widest leading-none">${p.price.toLocaleString()} — {p.category}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setEditingId(p.id); setNewProduct({...p, imageUrls: p.imageUrls ? p.imageUrls.join(', ') : (p.imageUrl || ''), videoUrl: p.videoUrl || ''}); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="w-14 h-14 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit3 size={20}/></button>
                    <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', p.id))} className="w-14 h-14 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={20}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderAbout = () => (
    <div className="container mx-auto px-6 py-24 animate-in fade-in duration-700">
      <div className="grid md:grid-cols-2 gap-24 items-center">
        <div className="text-slate-900">
          <span className="text-blue-600 font-black text-[11px] uppercase tracking-[0.6em] mb-6 block">Trayectoria Master</span>
          <h2 className="text-6xl md:text-7xl font-black mb-10 uppercase tracking-tighter leading-[0.85]">Puntualidad <br/>y <span className="text-blue-600">Confianza.</span></h2>
          <p className="text-slate-400 text-sm font-bold leading-relaxed mb-12 uppercase tracking-widest">RefriMaster es el estándar de calidad en Culiacán para la reparación de equipos domésticos e industriales.</p>
          <div className="grid grid-cols-2 gap-10">
            <div className="p-12 bg-white border border-gray-50 rounded-[45px] shadow-xl">
                <p className="text-6xl font-black text-blue-600 tracking-tighter">10+</p>
                <p className="text-[11px] font-black uppercase text-slate-300 mt-4 tracking-[0.3em]">Años de Servicio</p>
            </div>
            <div className="p-12 bg-white border border-gray-50 rounded-[45px] shadow-xl">
                <p className="text-6xl font-black text-blue-600 tracking-tighter">100%</p>
                <p className="text-[11px] font-black uppercase text-slate-300 mt-4 tracking-[0.3em]">Garantía Real</p>
            </div>
          </div>
        </div>
        <div className="relative">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full"></div>
            <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1000" className="rounded-[60px] shadow-3xl relative z-10 hover:scale-105 transition-transform duration-1000" alt="" />
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-20 h-20 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-10"></div>
      <p className="text-slate-900 font-black tracking-[0.8em] uppercase text-[10px] animate-pulse">Optimizando Sistemas Master...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <a 
        href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-12 right-12 z-[100] bg-green-500 text-white p-5 rounded-[28px] shadow-3xl hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      </a>

      {renderProductModal()}

      <div className={`fixed inset-0 z-[110] transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute top-0 left-0 h-full w-[85%] max-w-[350px] bg-white transition-transform duration-500 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-10 flex items-center justify-between border-b border-slate-50">
            <span className="text-2xl font-black uppercase tracking-tighter italic">Refri<span className="text-blue-600">Master</span></span>
            <button onClick={() => setIsMenuOpen(false)} className="p-3 bg-slate-50 rounded-2xl"><X size={24} /></button>
          </div>
          <div className="p-10 flex-grow space-y-3">
            {[{ id: 'home', label: 'Inicio', icon: <Home size={22}/> }, { id: 'catalog', label: 'Catálogo', icon: <ShoppingBag size={22}/> }, { id: 'about', label: 'Nosotros', icon: <Info size={22}/> }].map(item => (
              <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-5 p-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] transition-all ${view === item.id ? 'bg-blue-600 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'}`}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>
          <div className="p-10 border-t border-slate-50 mt-auto">
            <button onClick={() => setView('admin')} className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-300 mb-8 ml-4 hover:text-blue-600 transition-colors"><Lock size={14}/> Administración</button>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-4 bg-slate-900 text-white p-6 rounded-[28px] font-black uppercase text-[11px] tracking-widest shadow-2xl transition-all active:scale-95"><Phone size={18} /> Contacto</a>
          </div>
        </div>
      </div>

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-50 h-28 flex items-center justify-between px-8 md:px-14">
        <div className="flex items-center gap-5 cursor-pointer group" onClick={() => setView('home')}>
          <div className="bg-blue-600 w-14 h-14 rounded-[22px] shadow-2xl flex items-center justify-center group-hover:rotate-12 transition-transform overflow-hidden"><img src="./favicon.png" className="w-10 h-10 object-contain" alt="" /></div>
          <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Refri<span className="text-blue-600">Master</span></span>
        </div>
        <div className="hidden md:flex gap-14 items-center">
          {['home', 'catalog', 'about'].map(v => (
            <button key={v} onClick={() => setView(v)} className={`text-[11px] font-black uppercase tracking-[0.4em] transition-all relative pb-2 ${view === v ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600' : 'text-slate-400 hover:text-slate-900'}`}>{v === 'home' ? 'Inicio' : v === 'catalog' ? 'Catálogo' : 'Nosotros'}</button>
          ))}
          <button onClick={() => setView('admin')} className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-blue-600 flex items-center gap-3"><Lock size={16}/> Acceso</button>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="bg-slate-900 text-white px-10 py-4.5 rounded-[22px] shadow-2xl hover:bg-blue-600 transition-all font-black text-[11px] uppercase tracking-widest active:scale-95">Contacto</a>
        </div>
        <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-4 bg-slate-50 rounded-2xl"><Menu size={28} /></button>
      </nav>

      <main className="min-h-[70vh]">{view === 'home' && renderHome()} {view === 'catalog' && renderCatalog()} {view === 'about' && renderAbout()} {view === 'admin' && renderAdmin()}</main>

      <footer className="bg-slate-900 text-white pt-24 pb-12 px-10 mt-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"></div>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 border-b border-white/5 pb-20 text-left">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center"><img src="./favicon.png" className="w-7 h-7 object-contain" alt="" /></div>
                <h3 className="text-2xl font-black tracking-tighter uppercase leading-none italic">RefriMaster<span className="text-blue-500">.</span></h3>
              </div>
              <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest leading-relaxed">Infraestructura técnica para sistemas de refrigeración industrial y comercial en Sinaloa.</p>
              
              <div className="flex gap-5">
                  <a href="#" className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-all text-slate-500 hover:text-white"><Facebook size={20}/></a>
                  <a href="#" className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-all text-slate-500 hover:text-white"><Instagram size={20}/></a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-red-600 transition-all text-slate-500 hover:text-white"><Youtube size={20}/></a>
              </div>
            </div>
            <div className="space-y-8">
              <h4 className="font-black text-blue-400 uppercase tracking-[0.4em] text-[11px]">Navegación</h4>
              <ul className="space-y-4">
                {['home', 'catalog', 'about', 'admin'].map(item => (
                    <li key={item}><button onClick={() => setView(item)} className="text-[11px] font-black uppercase text-slate-500 hover:text-white transition-all tracking-widest flex items-center gap-3 group"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>{item === 'home' ? 'Inicio' : item === 'catalog' ? 'Catálogo' : item === 'about' ? 'Nosotros' : 'Gestión'}</button></li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="font-black text-blue-400 uppercase tracking-[0.4em] text-[11px]">Soporte Técnico</h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                    <Phone size={18} className="text-blue-500 shrink-0" />
                    <div className="flex flex-col"><span className="text-[11px] font-black uppercase tracking-widest">667 331 2378</span><span className="text-[10px] text-slate-500 font-bold tracking-widest">Atención Express</span></div>
                </li>
                <li className="flex items-start gap-4">
                    <Mail size={18} className="text-blue-500 shrink-0" />
                    <div className="flex flex-col"><span className="text-[11px] font-black uppercase tracking-widest lowercase">contacto@refrimaster.mx</span></div>
                </li>
              </ul>
            </div>
            <div>
                <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-green-400">En Línea</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed tracking-widest">Servicio de emergencias disponible en toda el área de Culiacán.</p>
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-blue-600 px-8 py-4 rounded-2xl hover:bg-blue-500 transition-all text-white shadow-2xl shadow-blue-500/20">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Contactar</span>
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 pt-12">
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-600">© 2026 RefriMaster Corporation • Culiacán Sinaloa.</div>
            <div className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-600 italic">Desarrollo Profesional Master</div>
          </div>
        </div>
      </footer>
    </div>
  );
}