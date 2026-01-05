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
  Menu, X, Home, Info, UserCheck
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
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Lavadora', description: '', imageUrl: '' });

  // Reset de scroll y cierre de menú al cambiar de vista
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
    <div className="space-y-16 animate-in fade-in duration-500 pb-20">
      <section className="relative h-[550px] flex items-center justify-center text-white overflow-hidden rounded-[40px] mt-4 mx-4 shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=2070" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.3]" 
          alt="Técnico profesional reparando un electrodoméstico" 
        />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 backdrop-blur-md border border-blue-500/30 px-4 py-2 rounded-full mb-8">
            <ShieldCheck size={16} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Servicio 100% Garantizado</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter uppercase leading-[0.9]">Tecnología <br/><span className="text-blue-500">en Movimiento</span></h1>
          <p className="text-blue-100/70 font-bold uppercase text-xs tracking-widest mb-10 max-w-xl mx-auto">Reparación profesional de electrodomésticos con refacciones originales.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => setView('catalog')} className="bg-blue-600 hover:bg-blue-500 px-12 py-5 rounded-2xl font-black shadow-xl transition-all hover:scale-105 uppercase text-xs tracking-widest">Explorar Tienda</button>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="bg-white text-blue-950 px-12 py-5 rounded-2xl font-black shadow-xl transition-all hover:bg-gray-100 uppercase text-xs tracking-widest">Agendar Servicio</a>
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
            { icon: <Refrigerator size={28}/>, title: 'Refrigeración', desc: 'Sistemas de gas y tarjetas inverter.' },
            { icon: <Wrench size={28}/>, title: 'Lavado', desc: 'Transmisiones y mantenimiento preventivo.' },
            { icon: <Wind size={28}/>, title: 'Aires', desc: 'Limpieza profunda y recarga de refrigerante.' },
            { icon: <Zap size={28}/>, title: 'Electricidad', desc: 'Instalaciones industriales y residenciales.', premium: true }
          ].map((s, i) => (
            <div key={i} className={`p-10 bg-white rounded-[35px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group ${s.premium ? 'ring-2 ring-blue-600/10' : ''}`}>
              <div className="bg-gray-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                {s.icon}
              </div>
              <h3 className="font-black text-xl mb-3 uppercase tracking-tighter text-gray-900">{s.title}</h3>
              <p className="text-gray-500 text-[11px] font-bold uppercase leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-20 mx-4 rounded-[50px] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div className="container mx-auto px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-black mb-8 uppercase tracking-tighter leading-none">Proceso <br/><span className="text-blue-500">Eficiente</span></h2>
              <div className="space-y-6">
                {['Diagnóstico Preciso', 'Cotización Transparente', 'Reparación Express'].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-2xl font-black text-blue-500">0{i+1}</span>
                    <span className="font-black uppercase tracking-widest text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-600 p-12 rounded-[40px] text-center shadow-3xl shadow-blue-500/20">
              <Award size={48} className="mx-auto mb-6" aria-hidden="true" />
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter leading-none">Confianza Total</h3>
              <p className="text-blue-100/70 font-bold text-xs uppercase mb-8 leading-relaxed tracking-wider">Más de una década brindando soluciones técnicas en Culiacán, Sinaloa.</p>
              <button onClick={() => setView('about')} className="bg-white text-blue-900 px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-50 transition-colors shadow-lg">Conocer Más</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderCatalog = () => {
    const filteredProducts = filter === 'Todos' ? products : products.filter(p => p.category === filter);
    return (
      <div className="container mx-auto px-6 py-16 animate-in slide-in-from-bottom-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <div className="text-center md:text-left">
            <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">Stock Disponible</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900">Tienda <span className="text-blue-600">Master</span></h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            {['Todos', 'Lavadora', 'Refrigerador', 'Aire Acondicionado', 'Electricidad'].map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-gray-400 hover:text-blue-600'}`}>{cat}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(p => (
            <div key={p.id} className="group bg-white rounded-[40px] overflow-hidden border border-gray-50 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
              <div className="h-72 overflow-hidden relative">
                <img 
                  src={p.imageUrl} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  alt={`Imagen de ${p.name}`} 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-6 left-6 bg-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-lg text-blue-600 tracking-tighter">{p.category}</div>
              </div>
              <div className="p-10 flex flex-col flex-grow">
                <h3 className="font-black text-xl mb-3 text-slate-900 uppercase tracking-tight leading-tight">
                  {p.name}
                </h3>
                <p className="text-gray-500 text-[10px] mb-8 font-bold uppercase leading-relaxed tracking-wider whitespace-pre-wrap">
                  {p.description}
                </p>
                <div className="mt-auto flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-blue-600/70 font-black uppercase tracking-widest mb-1">Precio Final</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">${p.price.toLocaleString()}</span>
                  </div>
                  <a 
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola Jorge Ernesto, me interesa: ${p.name}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={`Comprar ${p.name} por WhatsApp`}
                    className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all"
                  >
                    <ShoppingBag size={20}/>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAbout = () => (
    <div className="container mx-auto px-6 py-20 animate-in fade-in duration-700">
      <div className="grid md:grid-cols-2 gap-20 items-center">
        <div className="text-slate-900">
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Sobre Nosotros</span>
          <h2 className="text-5xl md:text-6xl font-black mb-8 uppercase tracking-tighter leading-[0.9]">Profesionalismo <br/>en cada <span className="text-blue-600">detalle.</span></h2>
          <p className="text-gray-500 text-sm font-bold leading-relaxed mb-10 uppercase tracking-wide">RefriMaster nace con la misión de dignificar el servicio técnico en Sinaloa, combinando honestidad, rapidez y el uso de las últimas herramientas tecnológicas.</p>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-10 bg-white border border-gray-100 rounded-[35px] shadow-sm hover:shadow-lg transition-all">
                <p className="text-5xl font-black text-blue-600 tracking-tighter">10+</p>
                <p className="text-[10px] font-black uppercase text-gray-400 mt-2 tracking-widest">Años de Trayectoria</p>
            </div>
            <div className="p-10 bg-white border border-gray-100 rounded-[35px] shadow-sm hover:shadow-lg transition-all">
                <p className="text-5xl font-black text-blue-600 tracking-tighter">100%</p>
                <p className="text-[10px] font-black uppercase text-gray-400 mt-2 tracking-widest">Garantía Extendida</p>
            </div>
          </div>
        </div>
        <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/10 blur-[60px] rounded-full"></div>
            <img 
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1000" 
              className="rounded-[50px] shadow-3xl relative z-10 grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
              alt="Equipo de trabajo profesional" 
            />
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => {
    if (!isAdmin) return (
      <div className="max-w-md mx-auto py-24 px-6">
        <div className="bg-white p-14 rounded-[50px] shadow-2xl border border-gray-50 text-center">
          <div className="bg-blue-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-3xl shadow-blue-500/30">
            <Lock size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter text-slate-900 leading-none">Acceso <br/>Maestro</h2>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input type="email" placeholder="Usuario" className="w-full p-5 rounded-2xl bg-gray-50 outline-none font-black text-slate-700 uppercase text-[10px] tracking-widest border border-transparent focus:border-blue-500 transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Contraseña" className="w-full p-5 rounded-2xl bg-gray-50 outline-none font-black text-slate-700 uppercase text-[10px] tracking-widest border border-transparent focus:border-blue-500 transition-all" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl hover:bg-blue-600 transition-all uppercase tracking-widest mt-6 text-[10px]">Verificar Credenciales</button>
          </form>
        </div>
      </div>
    );
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-slate-900">
        <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8 text-center md:text-left">
          <div>
            <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">Administración Central</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Panel Maestro</h2>
          </div>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-sm"><LogOut size={16}/> Cerrar Sesión</button>
        </div>
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4 bg-white p-10 rounded-[45px] shadow-2xl border border-gray-50 sticky top-32 h-fit">
            <h3 className="text-xs font-black mb-10 text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                {editingId ? "Editando Equipo" : "Registrar Equipo"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Nombre Comercial</label>
                <input required className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-black text-[11px] uppercase border-2 border-transparent focus:border-blue-100 transition-all" placeholder="Ej. Lavadora LG 20kg" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Precio de Inversión</label>
                <input required type="number" className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-black text-[11px] uppercase border-2 border-transparent focus:border-blue-100 transition-all" placeholder="Monto MXN" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Categoría del Servicio</label>
                <select className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-black text-[11px] uppercase cursor-pointer" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option>Lavadora</option><option>Refrigerador</option><option>Aire Acondicionado</option><option>Secadora</option><option>Electricidad</option></select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">URL de Imagen</label>
                <input required className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-black text-[9px] text-blue-400 border-2 border-transparent focus:border-blue-100 transition-all" placeholder="https://..." value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Ficha Técnica / Descripción</label>
                <textarea required className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-black text-[11px] h-36 resize-none uppercase border-2 border-transparent focus:border-blue-100 transition-all" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              </div>
              <button className="w-full bg-blue-600 text-white font-black py-6 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-[10px] mt-6">{editingId ? "Guardar Cambios" : "Publicar Equipo"}</button>
            </form>
          </div>
          <div className="lg:col-span-8">
            <h3 className="text-xl font-black mb-10 uppercase tracking-[0.4em] text-slate-400 ml-6">Inventario en Red</h3>
            <div className="grid gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-[30px] flex items-center justify-between border border-gray-50 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner shrink-0">
                        <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                    </div>
                    <div>
                        <div className="font-black text-slate-900 text-lg tracking-tighter uppercase text-center sm:text-left">{p.name}</div>
                        <div className="flex justify-center sm:justify-start gap-4 mt-1">
                            <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest">${p.price.toLocaleString()}</span>
                            <span className="text-gray-300 font-black text-[10px] uppercase tracking-widest italic">{p.category}</span>
                        </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {setEditingId(p.id); setNewProduct(p); window.scrollTo({top: 0, behavior: 'smooth'});}} 
                      aria-label={`Editar ${p.name}`}
                      className="w-12 h-12 flex items-center justify-center bg-gray-50 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <Edit3 size={18}/>
                    </button>
                    <button 
                      onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', p.id))} 
                      aria-label={`Eliminar ${p.name}`}
                      className="w-12 h-12 flex items-center justify-center bg-gray-50 text-slate-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-8"></div>
      <p className="text-slate-900 font-black tracking-[0.5em] uppercase text-[9px] animate-pulse">Cargando Infraestructura...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Botón Flotante WhatsApp - Icono Corregido */}
      <a 
        href={`https://wa.me/${WHATSAPP_NUMBER}`} 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-10 right-10 z-[100] bg-green-500 text-white p-4 rounded-3xl shadow-3xl hover:scale-110 active:scale-95 transition-all group flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      {/* Menú Lateral (Sidebar) Móvil */}
      <div className={`fixed inset-0 z-[110] transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMenuOpen(false)}
        ></div>
        <div className={`absolute top-0 left-0 h-full w-[80%] max-w-[320px] bg-white shadow-2xl transition-transform duration-500 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center">
                 <img src="./favicon.png" className="w-6 h-6 object-contain" alt="RefriMaster Logo" />
              </div>
              <span className="text-xl font-black uppercase tracking-tighter">Refri<span className="text-blue-600">Master</span></span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} aria-label="Cerrar menú" className="text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="p-8 flex-grow space-y-2">
            {[
              { id: 'home', label: 'Inicio', icon: <Home size={20}/> },
              { id: 'catalog', label: 'Catálogo', icon: <ShoppingBag size={20}/> },
              { id: 'about', label: 'Nosotros', icon: <Info size={20}/> }
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${view === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-gray-50 hover:text-blue-600'}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
          <div className="p-8 border-t border-gray-50 mt-auto">
            {/* ACCESO DISCRETO PARA ADMINISTRADOR */}
            <button 
              onClick={() => setView('admin')}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-blue-600 transition-colors mb-6 ml-4"
            >
              <Lock size={12}/> Acceso Administrativo
            </button>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-slate-900 text-white p-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl">
              <Phone size={16} /> Contacto Directo
            </a>
          </div>
        </div>
      </div>

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100 h-24 flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('home')}>
          <div className="bg-blue-600 w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center group-hover:rotate-12 transition-transform overflow-hidden">
             <img src="./favicon.png" className="w-8 h-8 object-contain" alt="Logo RefriMaster" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Refri<span className="text-blue-600">Master</span></span>
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em] mt-1 opacity-60">Service & Sales</span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-12 items-center">
          {['home', 'catalog', 'about'].map((v) => (
            <button key={v} onClick={() => setView(v)} className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative pb-1 ${view === v ? 'text-blue-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600' : 'text-slate-400 hover:text-slate-900'}`}>{v === 'home' ? 'Inicio' : v === 'catalog' ? 'Catálogo' : 'Nosotros'}</button>
          ))}
          <button onClick={() => setView('admin')} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${view === 'admin' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}><Lock size={14}/> Acceso</button>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl shadow-xl hover:bg-blue-600 transition-all font-black text-[10px] uppercase tracking-widest">Contacto Directo</a>
        </div>

        <button onClick={() => setIsMenuOpen(true)} aria-label="Abrir menú" className="md:hidden p-3 bg-gray-50 text-slate-900 rounded-xl hover:bg-gray-100 transition-colors">
          <Menu size={24} />
        </button>
      </nav>

      <main className="min-h-[70vh]">{view === 'home' && renderHome()} {view === 'catalog' && renderCatalog()} {view === 'about' && renderAbout()} {view === 'admin' && renderAdmin()}</main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white pt-20 pb-10 px-10 mt-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"></div>
        
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-white/10 pb-16">
            
            <div className="col-span-1 md:col-span-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                   <img src="./favicon.png" className="w-5 h-5 object-contain" alt="RefriMaster Logo" />
                </div>
                <h3 className="text-xl font-black tracking-tighter uppercase leading-none italic">RefriMaster<span className="text-blue-500">.</span></h3>
              </div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">Soluciones integrales de refrigeración y climatización en Culiacán. Calidad técnica garantizada.</p>
              <div className="flex gap-4">
                  <a href="#" aria-label="Facebook RefriMaster" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all text-gray-400 hover:text-white"><Facebook size={16}/></a>
                  <a href="#" aria-label="Instagram RefriMaster" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all text-gray-400 hover:text-white"><Instagram size={16}/></a>
              </div>
            </div>

            <div className="col-span-1 space-y-6">
              <h4 className="font-black text-blue-400 uppercase tracking-[0.3em] text-[10px]">Mapa del Sitio</h4>
              <ul className="space-y-3">
                {['home', 'catalog', 'about', 'admin'].map(item => (
                    <li key={item}>
                        <button onClick={() => setView(item)} className="text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors tracking-widest flex items-center gap-2 group">
                            <div className="w-1 h-1 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {item === 'home' ? 'Inicio' : item === 'catalog' ? 'Catálogo' : item === 'about' ? 'Nosotros' : 'Admin'}
                        </button>
                    </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 space-y-6">
              <h4 className="font-black text-blue-400 uppercase tracking-[0.3em] text-[10px]">Contacto Técnico</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                    <Phone size={14} className="text-blue-500 mt-1 shrink-0" aria-hidden="true" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest">667 331 2378</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Lunes — Sábado</span>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <Mail size={14} className="text-blue-500 mt-1 shrink-0" aria-hidden="true" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest lowercase">contacto@refrimaster.mx</span>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <MapPin size={14} className="text-blue-500 mt-1 shrink-0" aria-hidden="true" />
                    <div className="flex flex-col text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Culiacán, Sinaloa, México.
                    </div>
                </li>
              </ul>
            </div>

            <div className="col-span-1">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400">Disponible Ahora</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase leading-relaxed tracking-wider">¿Tienes una emergencia eléctrica o de refrigeración? Contáctanos de inmediato para soporte 24/7.</p>
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-blue-600 px-6 py-3 rounded-xl hover:bg-blue-500 transition-all">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">Urgencias</span>
                        <ExternalLink size={12} className="text-white" />
                    </a>
                </div>
            </div>

          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-500">
              © 2026 RefriMaster Corporation • Todos los derechos reservados.
            </div>
            <div className="flex gap-8 text-[9px] font-black tracking-[0.3em] uppercase text-gray-500 italic">
               Design by Jorge Ernesto Chavez Puente
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}