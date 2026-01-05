import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Wrench, Wind, Refrigerator, ShoppingBag, Plus, Trash2, LogIn, LogOut, 
  Phone, MapPin, Package, Menu, X, Lock, Edit3, ShieldCheck, Clock, Award, Flashlight
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Lavadora', description: '', imageUrl: '' });

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

  const renderLogin = () => (
    <div className="max-w-md mx-auto px-6 py-20 animate-in zoom-in-95 duration-300">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center">
        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden">
          <img src="./favicon.png" className="w-14 h-14 object-contain" alt="Logo" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-6">Acceso Dueño</h2>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input type="email" placeholder="Correo" className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none font-medium" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none font-medium" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-lg hover:bg-blue-700 transition-all">Entrar al Panel</button>
        </form>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-16 pb-20 animate-in fade-in duration-500">
      <section className="relative h-[500px] flex items-center justify-center text-white overflow-hidden rounded-[40px] mt-4 mx-4 shadow-2xl">
        <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=2070" className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" alt="Banner" />
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">Soluciones Reales para tu Hogar</h1>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => setView('catalog')} className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-full font-bold shadow-lg transition-all">Explorar Tienda</button>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="bg-white text-blue-900 px-10 py-4 rounded-full font-bold shadow-lg transition-all">Solicitar Técnico</a>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-16 tracking-tight">¿Qué necesitas hoy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 bg-white rounded-[35px] shadow-sm border border-gray-100 group hover:shadow-xl transition-all">
                <Refrigerator className="w-12 h-12 text-blue-600 mx-auto mb-6 group-hover:scale-110 transition-transform"/>
                <h3 className="text-xl font-black mb-4">Refrigeración</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-xs">Carga de gas, compresores y tarjetas electrónicas con garantía.</p>
            </div>
            <div className="p-8 bg-white rounded-[35px] shadow-sm border border-gray-100 group hover:shadow-xl transition-all">
                <Wrench className="w-12 h-12 text-blue-600 mx-auto mb-6 group-hover:scale-110 transition-transform"/>
                <h3 className="text-xl font-black mb-4">Lavado</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-xs">Reparación de transmisiones y bombas con refacciones originales.</p>
            </div>
            <div className="p-8 bg-white rounded-[35px] shadow-sm border border-gray-100 group hover:shadow-xl transition-all">
                <Wind className="w-12 h-12 text-blue-600 mx-auto mb-6 group-hover:scale-110 transition-transform"/>
                <h3 className="text-xl font-black mb-4">Aires</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-xs">Instalación profesional y mantenimiento preventivo profundo.</p>
            </div>
            <div className="p-8 bg-white rounded-[35px] shadow-sm border border-gray-100 group hover:shadow-xl transition-all border-t-4 border-t-blue-600">
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors text-blue-600 group-hover:text-white">
                  <Package className="w-8 h-8 transition-colors"/>
                </div>
                <h3 className="text-xl font-black mb-4">Electricidad</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-xs">Instalación de proyectos eléctricos integrales, desde residencias hasta naves industriales.</p>
            </div>
          </div>
      </section>
    </div>
  );

  const renderAbout = () => (
    <div className="container mx-auto px-6 py-20 animate-in fade-in duration-700">
      <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
        <div>
          <span className="text-blue-600 font-black tracking-widest uppercase text-xs">Nuestra Historia</span>
          <h2 className="text-5xl font-black text-gray-900 mt-4 mb-8 leading-tight">Más que técnicos, somos tus aliados.</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6 font-medium">En RefriMaster, profesionalizamos el servicio técnico para devolver la armonía a tu hogar con rapidez y honestidad.</p>
        </div>
        <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1000" className="rounded-[40px] shadow-2xl" alt="Sobre Nosotros" />
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-blue-50/50 p-10 rounded-[35px] border border-blue-100">
          <ShieldCheck className="w-10 h-10 text-blue-600 mb-6"/><h4 className="text-xl font-black mb-4">Confianza</h4><p className="text-gray-500 text-sm font-medium leading-relaxed">Garantía real en cada equipo vendido y reparado.</p>
        </div>
        <div className="bg-blue-50/50 p-10 rounded-[35px] border border-blue-100">
          <Clock className="w-10 h-10 text-blue-600 mb-6"/><h4 className="text-xl font-black mb-4">Rapidez</h4><p className="text-gray-500 text-sm font-medium leading-relaxed">Entendemos tu urgencia. Atendemos reportes el mismo día.</p>
        </div>
        <div className="bg-blue-50/50 p-10 rounded-[35px] border border-blue-100">
          <Award className="w-10 h-10 text-blue-600 mb-6"/><h4 className="text-xl font-black mb-4">Experiencia</h4><p className="text-gray-500 text-sm font-medium leading-relaxed">Técnicos certificados en constante capacitación.</p>
        </div>
      </div>
    </div>
  );

  const renderCatalog = () => (
    <div className="container mx-auto px-6 py-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div><h2 className="text-4xl font-black text-gray-900 tracking-tight">Equipos Disponibles</h2><p className="text-gray-500 font-medium">Calidad garantizada.</p></div>
        <div className="bg-blue-600 px-6 py-2 rounded-full text-white font-bold text-sm shadow-lg shadow-blue-200">{products.length} Equipos</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map(p => (
          <div key={p.id} className="group bg-white rounded-[35px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
            <div className="h-72 overflow-hidden relative">
              <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.name} />
              <div className="absolute top-5 left-5 bg-white/80 backdrop-blur-md text-blue-700 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase shadow-lg">{p.category}</div>
            </div>
            <div className="p-8 flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50/30">
              <h3 className="font-black text-2xl mb-3 text-gray-800 leading-tight">{p.name}</h3>
              <p className="text-gray-500 text-sm mb-8 line-clamp-3 font-medium leading-relaxed">{p.description}</p>
              <div className="mt-auto pt-6 border-t flex justify-between items-center">
                <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-black uppercase mb-1">Precio</span><span className="text-3xl font-black text-gray-900">${p.price.toLocaleString()}</span></div>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Interés: ${p.name}`} target="_blank" className="bg-blue-600 text-white p-5 rounded-[22px] shadow-xl hover:rotate-6 transition-all"><ShoppingBag /></a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAdmin = () => {
    if (!isAdmin) return renderLogin();
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-black">Panel Maestro</h2>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all"><LogOut size={20}/> Salir</button>
        </div>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[32px] shadow-2xl sticky top-28 border border-blue-50">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-blue-600">{editingId ? <Edit3 /> : <Plus />} {editingId ? "Editar" : "Nuevo"}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-medium" placeholder="Nombre" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <input required type="number" className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-medium" placeholder="Precio ($)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                <select className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-medium" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option>Lavadora</option><option>Refrigerador</option><option>Aire Acondicionado</option><option>Secadora</option></select>
                <input required className="w-full p-4 rounded-2xl bg-gray-50 outline-none text-sm" placeholder="Link Imagen (ImgBB)" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                {newProduct.imageUrl && <div className="p-2 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200"><img src={newProduct.imageUrl} className="w-full h-40 object-cover rounded-xl" onError={e => e.target.src="https://placehold.co/400x300?text=Error+Link"} /></div>}
                <textarea required className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-medium h-32 resize-none" placeholder="Descripción" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                <button className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-lg hover:bg-blue-700 transition-all">{editingId ? "Actualizar" : "Publicar Ahora"}</button>
                {editingId && <button onClick={() => {setEditingId(null); setNewProduct({name:'', price:'', category:'Lavadora', description:'', imageUrl:''})}} className="w-full text-gray-400 font-bold text-sm mt-2">Cancelar</button>}
              </form>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[30px] flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <img src={p.imageUrl} className="w-20 h-20 rounded-2xl object-cover" />
                  <div><div className="font-black text-gray-900 text-lg">{p.name}</div><div className="text-blue-600 font-bold">${p.price}</div></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {setEditingId(p.id); setNewProduct(p); window.scrollTo(0,0);}} className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={20}/></button>
                  <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', p.id))} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
      <div className="w-24 h-24 bg-blue-600 rounded-[30px] shadow-2xl animate-bounce flex items-center justify-center overflow-hidden">
        <img src="./favicon.png" className="w-14 h-14 object-contain" alt="Loading Logo" />
      </div>
      <p className="text-blue-900 font-black tracking-widest animate-pulse uppercase text-sm">RefriMaster Cargando...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 h-24 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
          <div className="bg-blue-600 p-2 rounded-2xl text-white shadow-lg group-hover:rotate-12 transition-transform w-14 h-14 flex items-center justify-center overflow-hidden">
            <img src="./favicon.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-blue-900 leading-none">REFRI<span className="text-blue-600">MASTER</span></span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Service & Sales</span>
          </div>
        </div>
        <div className="hidden md:flex gap-10 font-bold text-sm items-center">
          <button onClick={() => setView('home')} className={view === 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}>INICIO</button>
          <button onClick={() => setView('catalog')} className={view === 'catalog' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}>TIENDA</button>
          <button onClick={() => setView('about')} className={view === 'about' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}>NOSOTROS</button>
          <button onClick={() => setView('admin')} className="text-gray-400 hover:text-blue-600 flex items-center gap-2"><Lock size={16}/> ADMIN</button>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all">WhatsApp</a>
        </div>
      </nav>

      <main>{view === 'home' && renderHome()} {view === 'catalog' && renderCatalog()} {view === 'about' && renderAbout()} {view === 'admin' && renderAdmin()}</main>

      <footer className="bg-blue-950 text-white pt-24 pb-12 px-6 mt-20 rounded-t-[60px]">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-black mb-6 text-white flex items-center gap-3">
              <img src="./favicon.png" className="w-12 h-12 object-contain" alt="Footer Logo" />
              RefriMaster<span className="text-blue-500">.</span>
            </h3>
            <p className="text-blue-200/60 max-w-sm mb-10 leading-loose">Tu aliado de confianza en el mantenimiento de electrodomésticos. Devolvemos la tranquilidad a tu hogar.</p>
            <div className="flex gap-4">
               <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="bg-white/5 p-4 rounded-2xl hover:bg-blue-600 transition-all"><Phone size={24}/></a>
               <div className="bg-white/5 p-4 rounded-2xl hover:bg-blue-600 transition-all"><MapPin size={24}/></div>
            </div>
          </div>
          <div>
            <h4 className="font-black mb-8 text-blue-400 uppercase tracking-widest text-xs">Empresa</h4>
            <ul className="space-y-4 text-sm font-bold text-blue-100/70">
              <li><button onClick={() => setView('about')} className="hover:text-white">Sobre Nosotros</button></li>
              <li><button onClick={() => setView('catalog')} className="hover:text-white">Catálogo</button></li>
              <li><button onClick={() => setView('admin')} className="hover:text-white">Admin</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-8 text-blue-400 uppercase tracking-widest text-xs">Atención</h4>
            <p className="text-blue-100/70 text-sm mb-2 font-bold">Lunes a Sábado</p>
            <p className="text-2xl font-black mb-6">9:00 AM — 6:00 PM</p>
            <span className="text-[10px] text-blue-500 font-black uppercase bg-blue-900/50 px-3 py-1 rounded-md">Urgencias 24h</span>
          </div>
        </div>
      </footer>
    </div>
  );
}