import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  query 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Wrench, 
  Wind, 
  Refrigerator, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  LogIn, 
  LogOut, 
  Phone, 
  MapPin,
  Package,
  Menu,
  X,
  Lock
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

// CONFIGURACIÓN GLOBAL DE WHATSAPP
const WHATSAPP_NUMBER = "+526673312378"; // Tu número corregido

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

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Lavadora',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Error de Autenticación:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(!!u?.email);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const unsubscribe = onSnapshot(
      productsRef, 
      (snapshot) => {
        const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortedProds = prods.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(sortedProds);
      }, 
      (err) => {
        console.error("Error de Firestore:", err);
        setError("Error de permisos. El admin debe estar logueado para editar.");
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setView('admin');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    await signInAnonymously(auth);
    setIsAdmin(false);
    setView('home');
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setError("Debes ser administrador para añadir productos.");
      return;
    }
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), {
        ...newProduct,
        price: parseFloat(newProduct.price),
        createdAt: new Date().toISOString(),
        userId: user.uid
      });
      setNewProduct({ name: '', price: '', category: 'Lavadora', description: '', imageUrl: '' });
      setView('catalog');
    } catch (err) {
      setError("No se pudo guardar. Verifica tus permisos en Firebase.");
    }
  };

  const deleteProduct = async (id) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id));
    } catch (err) {
      setError("Error al eliminar el artículo.");
    }
  };

  const renderLogin = () => (
    <div className="max-w-md mx-auto px-6 py-20 animate-in zoom-in-95 duration-300">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center">
        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="text-blue-600 w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Acceso Dueño</h2>
        <p className="text-gray-500 mb-8">Ingresa tus credenciales para gestionar el inventario.</p>
        
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-lg">
            Entrar al Panel
          </button>
        </form>
        <button onClick={() => setView('home')} className="mt-6 text-gray-400 font-bold hover:text-gray-600 text-sm">
          Volver al Inicio
        </button>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-16 pb-20 animate-in fade-in duration-500">
      <section className="relative h-[500px] flex items-center justify-center text-white overflow-hidden rounded-3xl mt-4 mx-4 shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=2070" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
          alt="Taller"
        />
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">Soluciones Reales para tu Hogar</h1>
          <p className="text-xl mb-10 text-blue-100">Reparación certificada y venta de equipos premium con garantía total.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => setView('catalog')} className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-blue-500/50">
              Explorar Tienda
            </button>
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola RefriMaster, solicito un técnico a domicilio.")}`} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-4 rounded-full font-bold transition-all shadow-lg"
            >
              Solicitar Técnico
            </a>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Qué necesitas hoy?</h2>
          <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Refrigeración', icon: <Refrigerator className="w-12 h-12 text-blue-600"/>, desc: 'Especialistas en carga de gas, compresores y tarjetas electrónicas.' },
            { title: 'Lavado', icon: <Wrench className="w-12 h-12 text-blue-600"/>, desc: 'Arreglamos transmisiones, bombas y sensores de todas las marcas.' },
            { title: 'Climatización', icon: <Wind className="w-12 h-12 text-blue-600"/>, desc: 'Instalación profesional y mantenimiento preventivo para aire puro.' },
          ].map((item, i) => (
            <div key={i} className="group p-10 bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all text-center">
              <div className="mb-6 flex justify-center transform group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderCatalog = () => (
    <div className="container mx-auto px-6 py-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Equipos Disponibles</h2>
          <p className="text-gray-500">Artículos revisados y listos para entrega inmediata.</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-full text-blue-700 font-bold text-sm">
          {products.length} Equipos en inventario
        </div>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-400">Nuestro catálogo se está actualizando</h3>
          <p className="text-gray-400 mt-2">Vuelve pronto para ver nuestras novedades.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all group">
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={p.imageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000"} 
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-blue-900 px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-sm">
                  {p.category}
                </div>
              </div>
              <div className="p-8">
                <h3 className="font-bold text-xl mb-2 text-gray-800">{p.name}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{p.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold uppercase">Precio</span>
                    <span className="text-3xl font-black text-blue-600">${p.price}</span>
                  </div>
                  <a 
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola RefriMaster, me interesa el equipo: ${p.name}. ¿Sigue disponible?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    <ShoppingBag className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAdmin = () => {
    if (!isAdmin) return renderLogin();

    return (
      <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in duration-500">
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">Panel Maestro</h2>
            <p className="text-gray-500 font-medium">Control total sobre tus artículos en venta.</p>
          </div>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl sticky top-28">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-blue-600">
                <Plus className="w-6 h-6" /> Nuevo Artículo
              </h3>
              <form onSubmit={addProduct} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase ml-1">Nombre</label>
                  <input required className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="Lavadora Samsung..." value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase ml-1">Precio ($)</label>
                  <input required type="number" className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="0.00" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase ml-1">Categoría</label>
                  <select className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                    <option>Lavadora</option>
                    <option>Refrigerador</option>
                    <option>Aire Acondicionado</option>
                    <option>Secadora</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase ml-1">Imagen (Link)</label>
                  <input required className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm" placeholder="URL de la foto..." value={newProduct.imageUrl} onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase ml-1">Descripción</label>
                  <textarea required className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium h-32 resize-none" placeholder="Detalles del equipo..." value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-lg">
                  Publicar Ahora
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-gray-800 ml-2">Inventario Activo</h3>
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 border-b border-gray-50">
                    <tr>
                      <th className="p-6 text-xs font-black text-gray-400 uppercase">Equipo</th>
                      <th className="p-6 text-xs font-black text-gray-400 uppercase">Precio</th>
                      <th className="p-6 text-xs font-black text-gray-400 uppercase text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <img src={p.imageUrl} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                            <div>
                              <div className="font-bold text-gray-900">{p.name}</div>
                              <div className="text-xs text-blue-600 font-bold uppercase">{p.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 font-black text-gray-900 text-lg">${p.price}</td>
                        <td className="p-6 text-right">
                          <button onClick={() => deleteProduct(p.id)} className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative w-24 h-24 mb-6 text-blue-600">
        <div className="absolute inset-0 border-8 border-blue-50 rounded-full"></div>
        <div className="absolute inset-0 border-8 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-blue-900 font-black tracking-widest animate-pulse uppercase text-sm">Validando Acceso</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
            <div className="bg-blue-600 p-3 rounded-[18px] text-white transform group-hover:rotate-12 transition-transform shadow-lg shadow-blue-200">
              <Refrigerator className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-blue-900 leading-none">REFRI<span className="text-blue-600">MASTER</span></span>
              <span className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase">Service & Sales</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10 font-bold">
            <button onClick={() => setView('home')} className={`text-sm uppercase tracking-widest transition-colors ${view === 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}`}>Inicio</button>
            <button onClick={() => setView('catalog')} className={`text-sm uppercase tracking-widest transition-colors ${view === 'catalog' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}`}>Tienda</button>
            
            <div className="h-8 w-px bg-gray-100"></div>

            {isAdmin ? (
              <button onClick={() => setView('admin')} className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-5 py-2.5 rounded-full transition-all">
                Panel Admin
              </button>
            ) : (
              <button onClick={() => setView('admin')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-all">
                <LogIn className="w-4 h-4" /> Acceso Dueño
              </button>
            )}
            
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola RefriMaster, necesito información sobre un servicio.")}`} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
            >
              WhatsApp
            </a>
          </div>

          <button className="md:hidden text-blue-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </nav>

      <main className="min-h-[70vh]">
        {view === 'home' && renderHome()}
        {view === 'catalog' && renderCatalog()}
        {view === 'admin' && renderAdmin()}
      </main>

      <footer className="bg-blue-950 text-white pt-24 pb-12 px-6 mt-20 rounded-t-[60px]">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-black mb-6 text-white">RefriMaster<span className="text-blue-500">.</span></h3>
            <p className="text-blue-200/60 max-w-sm mb-10 leading-loose">
              Tu aliado de confianza en el mantenimiento de electrodomésticos. No solo arreglamos aparatos, devolvemos la tranquilidad a tu hogar.
            </p>
            <div className="flex gap-4">
               <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="bg-white/5 p-4 rounded-2xl hover:bg-blue-600 transition-colors cursor-pointer"><Phone className="w-6 h-6"/></a>
               <div className="bg-white/5 p-4 rounded-2xl hover:bg-blue-600 transition-colors cursor-pointer"><MapPin className="w-6 h-6"/></div>
            </div>
          </div>
          <div>
            <h4 className="font-black mb-8 text-blue-400 uppercase tracking-widest text-xs">Empresa</h4>
            <ul className="space-y-4 text-sm font-bold text-blue-100/70">
              <li><button onClick={() => setView('home')} className="hover:text-white transition-colors">Sobre Nosotros</button></li>
              <li><button onClick={() => setView('catalog')} className="hover:text-white transition-colors">Catálogo de Venta</button></li>
              <li><button onClick={() => setView('admin')} className="hover:text-white transition-colors">Panel Admin</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-8 text-blue-400 uppercase tracking-widest text-xs">Atención Directa</h4>
            <p className="text-blue-100/70 text-sm mb-2">Lunes a Sábado</p>
            <p className="text-2xl font-black mb-6 text-white">9:00 AM — 6:00 PM</p>
            <p className="text-xs text-blue-500 font-black uppercase tracking-tighter bg-blue-900/50 inline-block px-3 py-1 rounded-md">Servicios de Urgencia 24h</p>
          </div>
        </div>
      </footer>
    </div>
  );
}