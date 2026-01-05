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
  Zap, MessageCircle 
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
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Lavadora', description: '', imageUrl: '' });

  // Reset de scroll al cambiar de vista
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setProducts(prods.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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
      const data = { ...newProduct, price: parseFloat(newProduct.price), updatedAt: new Date().toISOString() };
      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingId), data);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), { ...data, createdAt: new Date().toISOString() });
      }
      setNewProduct({ name: '', price: '', category: 'Lavadora', description: '', imageUrl: '' });
      setView('catalog');
    } catch (err) { alert("Error al guardar."); }
  };

  const renderHome = () => (
    <div className="space-y-12 animate-in fade-in duration-500">
      <section className="relative h-[480px] flex items-center justify-center text-white overflow-hidden rounded-[30px] mt-4 mx-4 shadow-xl">
        <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=2070" className="absolute inset-0 w-full h-full object-cover brightness-[0.35]" alt="Banner" />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter uppercase leading-none">Soluciones Reales para tu Hogar</h1>
          <div className="flex justify-center gap-6">
            <button onClick={() => setView('catalog')} className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl font-black shadow-xl transition-all scale-105 hover:scale-110 uppercase text-sm">Tienda</button>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="bg-white text-blue-900 px-10 py-4 rounded-2xl font-black shadow-xl transition-all hover:bg-gray-100 uppercase text-sm">Agendar Técnico</a>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-black mb-12 uppercase tracking-tight text-gray-900">¿Qué necesitas hoy?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Refrigerator size={32}/>, title: 'Refrigeración', desc: 'Gas y tarjetas.' },
            { icon: <Wrench size={32}/>, title: 'Lavado', desc: 'Mantenimiento y refacciones.' },
            { icon: <Wind size={32}/>, title: 'Aires', desc: 'Limpieza e instalación.' },
            { icon: <Zap size={32}/>, title: 'Electricidad', desc: 'Proyectos y urgencias.', premium: true }
          ].map((s, i) => (
            <div key={i} className={`p-8 bg-white rounded-[30px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group ${s.premium ? 'border-t-4 border-t-blue-600' : ''}`}>
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {s.icon}
              </div>
              <h3 className="font-black text-xl mb-2 uppercase tracking-tighter">{s.title}</h3>
              <p className="text-gray-500 text-xs font-bold">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-950 py-16 mx-4 rounded-[40px] text-white text-center shadow-lg">
        <h2 className="text-3xl font-black mb-12 uppercase tracking-tighter">Servicio en 3 Pasos</h2>
        <div className="grid md:grid-cols-3 gap-8 px-8">
          {['Diagnóstico', 'Reparación', 'Garantía'].map((step, i) => (
            <div key={i} className="p-8 bg-white/5 rounded-[30px] border border-white/10">
              <span className="text-5xl font-black text-blue-500/20 mb-2 block leading-none">0{i+1}</span>
              <h4 className="text-xl font-black mb-2 uppercase">{step}</h4>
              <p className="text-blue-200/50 font-bold text-xs uppercase">Eficiencia garantizada.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderCatalog = () => {
    const filteredProducts = filter === 'Todos' ? products : products.filter(p => p.category === filter);
    return (
      <div className="container mx-auto px-6 py-12 animate-in slide-in-from-bottom-5">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 text-gray-900">
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Catálogo Maestro</h2>
          <div className="flex flex-wrap gap-2">
            {['Todos', 'Lavadora', 'Refrigerador', 'Aire Acondicionado', 'Electricidad'].map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 hover:text-blue-600'}`}>{cat}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(p => (
            <div key={p.id} className="group bg-white rounded-[35px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
              <div className="h-64 overflow-hidden relative">
                <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.name} />
                <div className="absolute top-4 left-4 bg-white/90 text-blue-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase shadow-md">{p.category}</div>
              </div>
              <div className="p-8 flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50/30">
                <h3 className="font-black text-xl mb-2 text-gray-900 leading-tight uppercase truncate">{p.name}</h3>
                <p className="text-gray-400 text-xs mb-8 line-clamp-2 font-bold uppercase leading-relaxed">{p.description}</p>
                <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">Inversión</span><span className="text-3xl font-black text-gray-900 tracking-tighter">${p.price.toLocaleString()}</span></div>
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Interés: ${p.name}`} target="_blank" className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl hover:rotate-6 transition-all shadow-blue-100"><ShoppingBag size={22}/></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAbout = () => (
    <div className="container mx-auto px-6 py-16 animate-in fade-in">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="text-gray-900">
          <h2 className="text-5xl font-black mb-8 uppercase tracking-tighter leading-none">Más que técnicos, aliados.</h2>
          <p className="text-gray-500 text-lg font-bold leading-relaxed mb-8 uppercase">Profesionalizando el servicio técnico para tu tranquilidad.</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-8 bg-blue-50 rounded-[30px] text-center shadow-inner"><p className="text-4xl font-black text-blue-600 leading-none">10+</p><p className="text-[10px] font-black uppercase text-gray-400 mt-2">Años</p></div>
            <div className="p-8 bg-blue-50 rounded-[30px] text-center shadow-inner"><p className="text-4xl font-black text-blue-600 leading-none">100%</p><p className="text-[10px] font-black uppercase text-gray-400 mt-2">Garantía</p></div>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1000" className="rounded-[40px] shadow-2xl" alt="Nosotros" />
      </div>
    </div>
  );

  const renderAdmin = () => {
    if (!isAdmin) return (
      <div className="max-w-md mx-auto py-20 px-6">
        <div className="bg-white p-12 rounded-[40px] shadow-2xl border text-center">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"><img src="./favicon.png" className="w-12 h-12 object-contain" alt="Logo" /></div>
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter text-gray-900">Acceso Maestro</h2>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input type="email" placeholder="Correo" className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-black text-gray-700 uppercase text-xs" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Contraseña" className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-black text-gray-700 uppercase text-xs" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-2xl hover:bg-blue-700 transition-all uppercase tracking-widest mt-6">Entrar</button>
          </form>
        </div>
      </div>
    );
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 text-gray-900">
        <div className="flex justify-between items-center mb-16">
          <h2 className="text-4xl font-black uppercase tracking-tighter">Panel de Gestión</h2>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-sm hover:bg-red-600 hover:text-white transition-all"><LogOut size={18}/> Salir</button>
        </div>
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 bg-white p-8 rounded-[40px] shadow-2xl border sticky top-32 h-fit">
            <h3 className="text-xl font-black mb-8 text-blue-600 uppercase tracking-tight">{editingId ? "Editar Equipo" : "Nuevo Ingreso"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required className="w-full p-4 rounded-xl bg-gray-50 outline-none font-black text-xs uppercase" placeholder="Nombre" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input required type="number" className="w-full p-4 rounded-xl bg-gray-50 outline-none font-black text-xs uppercase" placeholder="Precio ($)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              <select className="w-full p-4 rounded-xl bg-gray-50 outline-none font-black text-xs uppercase" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option>Lavadora</option><option>Refrigerador</option><option>Aire Acondicionado</option><option>Secadora</option><option>Electricidad</option></select>
              <input required className="w-full p-4 rounded-xl bg-gray-50 outline-none font-black text-[10px] text-gray-400" placeholder="Link de Imagen" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
              {newProduct.imageUrl && <div className="p-3 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 overflow-hidden"><img src={newProduct.imageUrl} className="w-full h-40 object-cover rounded-xl" /></div>}
              <textarea required className="w-full p-4 rounded-xl bg-gray-50 outline-none font-black text-xs h-36 resize-none uppercase" placeholder="Descripción" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest">{editingId ? "Actualizar" : "Publicar Ahora"}</button>
            </form>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-black ml-6 mb-10 uppercase tracking-widest">Inventario</h3>
            {products.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[30px] flex items-center justify-between border shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="flex items-center gap-6">
                  <img src={p.imageUrl} className="w-20 h-20 rounded-2xl object-cover shadow-inner" />
                  <div><div className="font-black text-gray-900 text-xl tracking-tighter uppercase">{p.name}</div><div className="text-blue-600 font-black text-xs uppercase tracking-widest mt-1">${p.price.toLocaleString()}</div></div>
                </div>
                <div className="flex gap-2 pr-4">
                  <button onClick={() => {setEditingId(p.id); setNewProduct(p); window.scrollTo(0,0);}} className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit3 size={20}/></button>
                  <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', p.id))} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-8">
      <div className="w-24 h-24 bg-blue-600 rounded-[30px] shadow-2xl animate-bounce flex items-center justify-center overflow-hidden"><img src="./favicon.png" className="w-12 h-12 object-contain" alt="Loading" /></div>
      <p className="text-blue-900 font-black tracking-[0.4em] animate-pulse uppercase text-[10px]">Iniciando RefriMaster...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="fixed bottom-10 right-10 z-[100] bg-green-500 text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group">
        <MessageCircle size={32} />
      </a>

      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 h-24 flex items-center justify-between px-10 shadow-sm">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('home')}>
          <div className="bg-blue-600 p-2 rounded-[18px] shadow-xl group-hover:rotate-12 transition-transform w-14 h-14 flex items-center justify-center overflow-hidden">
            <img src="./favicon.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-3xl font-black text-blue-900 tracking-tighter uppercase leading-none">REFRI<span className="text-blue-600">MASTER</span></span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.4em] mt-1.5">Service & Sales</span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-10 items-center">
          <button onClick={() => setView('home')} className={`text-lg font-black uppercase tracking-tight transition-colors ${view === 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}`}>Inicio</button>
          <button onClick={() => setView('catalog')} className={`text-lg font-black uppercase tracking-tight transition-colors ${view === 'catalog' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}`}>Tienda</button>
          <button onClick={() => setView('about')} className={`text-lg font-black uppercase tracking-tight transition-colors ${view === 'about' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}`}>Nosotros</button>
          <button onClick={() => setView('admin')} className={`flex items-center gap-2 text-lg font-black uppercase tracking-tight transition-all ${view === 'admin' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}><Lock size={20}/> Admin</button>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="bg-blue-600 text-white px-10 py-4 rounded-[22px] shadow-xl hover:bg-blue-700 transition-all font-black text-lg">WhatsApp</a>
        </div>
      </nav>

      <main className="min-h-[70vh]">{view === 'home' && renderHome()} {view === 'catalog' && renderCatalog()} {view === 'about' && renderAbout()} {view === 'admin' && renderAdmin()}</main>

      {/* FOOTER REDISEÑADO: COMPACTO Y PROFESIONAL */}
      <footer className="bg-blue-950 text-white pt-16 pb-8 px-10 mt-12 rounded-t-[60px] relative shadow-2xl">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 border-b border-white/5 pb-12">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img src="./favicon.png" className="w-12 h-12 object-contain bg-white p-2 rounded-2xl shadow-lg" alt="Footer Logo" />
              <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">RefriMaster<span className="text-blue-500">.</span></h3>
            </div>
            <p className="text-blue-200/40 max-w-xs font-bold uppercase text-[10px] tracking-widest italic leading-relaxed">"Expertos en devolver la tranquilidad a tu hogar con eficiencia."</p>
            <div className="flex gap-4">
               <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="bg-white/5 p-4 rounded-2xl hover:bg-blue-600 transition-all shadow-inner"><Phone size={22}/></a>
               <div className="bg-white/5 p-4 rounded-2xl hover:bg-blue-600 transition-all cursor-pointer shadow-inner"><MapPin size={22}/></div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col gap-6 md:items-center">
            <div className="space-y-4">
              <h4 className="font-black text-blue-500 uppercase tracking-widest text-[10px]">Navegación</h4>
              <ul className="grid grid-cols-1 gap-3 text-[11px] font-black text-blue-100/30 uppercase tracking-widest">
                <li><button onClick={() => setView('home')} className="hover:text-white transition-all">Inicio</button></li>
                <li><button onClick={() => setView('catalog')} className="hover:text-white transition-all">Catálogo</button></li>
                <li><button onClick={() => setView('about')} className="hover:text-white transition-all">Sobre Nosotros</button></li>
                <li><button onClick={() => setView('admin')} className="hover:text-white transition-all">Panel Admin</button></li>
              </ul>
            </div>
          </div>

          {/* Attention Column */}
          <div className="flex flex-col gap-6 md:items-end">
            <div className="space-y-4 text-right">
              <h4 className="font-black text-blue-500 uppercase tracking-widest text-[10px]">Horario de Atención</h4>
              <p className="text-3xl font-black tracking-tighter leading-none">9:00 AM — 6:00 PM</p>
              <p className="text-[10px] font-bold text-blue-100/30 uppercase">Lunes a Sábado</p>
              <div className="inline-flex items-center gap-3 bg-blue-900/40 px-6 py-3 rounded-2xl border border-blue-800/50 shadow-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Urgencias 24H</span>
              </div>
            </div>
          </div>

        </div>

        {/* Legal Bottom */}
        <div className="pt-8 text-center text-blue-300/10 text-[9px] font-black tracking-[0.6em] uppercase">
          © 2026 RefriMaster Oficial • Culiacán, Sin.
        </div>
      </footer>
    </div>
  );
}