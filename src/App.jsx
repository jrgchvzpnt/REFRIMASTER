import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc // Añadido para editar
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
  Lock,
  Edit3 // Icono para editar
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

  // ESTADO PARA EDICIÓN
  const [editingId, setEditingId] = useState(null);

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
        setError("Error de permisos.");
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
      setError("Credenciales incorrectas.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    await signInAnonymously(auth);
    setIsAdmin(false);
    setView('home');
  };

  // FUNCIÓN PARA GUARDAR O ACTUALIZAR
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        // ACTUALIZAR EXISTENTE
        const productRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', editingId);
        await updateDoc(productRef, productData);
        setEditingId(null);
        alert("¡Producto actualizado!");
      } else {
        // CREAR NUEVO
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), {
          ...productData,
          createdAt: new Date().toISOString(),
          userId: user.uid
        });
        alert("¡Producto publicado!");
      }

      setNewProduct({ name: '', price: '', category: 'Lavadora', description: '', imageUrl: '' });
      setView('catalog');
    } catch (err) {
      alert("Error al guardar cambios.");
    }
  };

  // CARGAR DATOS PARA EDITAR
  const startEdit = (p) => {
    setEditingId(p.id);
    setNewProduct({
      name: p.name,
      price: p.price,
      category: p.category,
      description: p.description,
      imageUrl: p.imageUrl
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = async (id) => {
    if (!isAdmin || !window.confirm("¿Seguro que quieres borrar este equipo?")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id));
    } catch (err) {
      setError("Error al eliminar.");
    }
  };

  const renderLogin = () => (
    <div className="max-w-md mx-auto px-6 py-20 animate-in zoom-in-95 duration-300">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center">
        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="text-blue-600 w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Acceso Dueño</h2>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input type="email" placeholder="Correo electrónico" className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none font-medium" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none font-medium" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-lg">Entrar al Panel</button>
        </form>
        <button onClick={() => setView('home')} className="mt-6 text-gray-400 font-bold hover:text-gray-600 text-sm">Volver al Inicio</button>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-16 pb-20 animate-in fade-in duration-500">
      <section className="relative h-[500px] flex items-center justify-center text-white overflow-hidden rounded-3xl mt-4 mx-4 shadow-2xl">
        <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=2070" className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" alt="Taller" />
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">Soluciones Reales para tu Hogar</h1>
          <p className="text-xl mb-10 text-blue-100">Reparación certificada y venta de equipos premium.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => setView('catalog')} className="bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-full font-bold transition-all shadow-lg">Explorar Tienda</button>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola RefriMaster, solicito un técnico a domicilio.")}`} target="_blank" rel="noreferrer" className="bg-white text-blue-900 px-10 py-4 rounded-full font-bold shadow-lg">Solicitar Técnico</a>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-16">¿Qué necesitas hoy?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-10 bg-white rounded-3xl shadow-sm border border-gray-100 text-center">
                <Refrigerator className="w-12 h-12 text-blue-600 mx-auto mb-4"/>
                <h3 className="text-2xl font-bold mb-4">Refrigeración</h3>
                <p className="text-gray-600">Carga de gas y compresores.</p>
            </div>
            <div className="p-10 bg-white rounded-3xl shadow-sm border border-gray-100 text-center">
                <Wrench className="w-12 h-12 text-blue-600 mx-auto mb-4"/>
                <h3 className="text-2xl font-bold mb-4">Lavado</h3>
                <p className="text-gray-600">Mantenimiento y refacciones.</p>
            </div>
            <div className="p-10 bg-white rounded-3xl shadow-sm border border-gray-100 text-center">
                <Wind className="w-12 h-12 text-blue-600 mx-auto mb-4"/>
                <h3 className="text-2xl font-bold mb-4">Aires</h3>
                <p className="text-gray-600">Instalación y limpieza.</p>
            </div>
          </div>
      </section>
    </div>
  );

  const renderCatalog = () => (
    <div className="container mx-auto px-6 py-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-2">Equipos Disponibles</h2>
          <p className="text-gray-500">Calidad garantizada.</p>
        </div>
        <div className="bg-blue-600 px-6 py-2 rounded-full text-white font-bold text-sm shadow-lg">
          {products.length} Equipos
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((p) => (
          <div key={p.id} className="group bg-white rounded-[35px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
            <div className="h-72 overflow-hidden relative">
              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute top-5 left-5 bg-white/80 backdrop-blur-md text-blue-700 px-5 py-2 rounded-2xl text-[10px] font-black uppercase shadow-lg">{p.category}</div>
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="font-black text-2xl mb-3 text-gray-800 leading-tight">{p.name}</h3>
              <p className="text-gray-500 text-sm mb-8 line-clamp-3 font-medium">{p.description}</p>
              <div className="mt-auto pt-6 border-t flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Precio</span>
                  <span className="text-3xl font-black text-gray-900">${p.price.toLocaleString()}</span>
                </div>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola RefriMaster, me interesa: ${p.name}`)}`} target="_blank" rel="noreferrer" className="bg-blue-600 text-white p-5 rounded-[22px] shadow-xl shadow-blue-100 hover:rotate-6 transition-all"><ShoppingBag /></a>
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
        <div className="mb-10 flex justify-between items-center">
          <h2 className="text-4xl font-black text-gray-900">Panel Maestro</h2>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all">
            <LogOut size={20}/> Cerrar Sesión
          </button>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl sticky top-28">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-blue-600">
                {editingId ? <Edit3 /> : <Plus />} {editingId ? "Editar Equipo" : "Nuevo Equipo"}
              </h3>
              <form onSubmit={handleSubmitProduct} className="space-y-5">
                <input required className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-medium" placeholder="Nombre" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                <input required type="number" className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-medium" placeholder="Precio ($)" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                <select className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-medium" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                  <option>Lavadora</option><option>Refrigerador</option><option>Aire Acondicionado</option><option>Secadora</option>
                </select>
                <input required className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-medium text-sm" placeholder="Link Directo .jpg" value={newProduct.imageUrl} onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                
                {newProduct.imageUrl && (
                  <div className="mt-4 p-2 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200">
                    <img src={newProduct.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-xl" onError={(e) => e.target.src = "https://placehold.co/600x400?text=Link+Invalido"} />
                  </div>
                )}

                <textarea required className="w-full p-4 rounded-2xl bg-gray-50 outline-none font-medium h-32 resize-none" placeholder="Descripción" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-lg hover:bg-blue-700 transition-all">
                   {editingId ? "Guardar Cambios" : "Publicar Ahora"}
                </button>
                {editingId && (
                  <button type="button" onClick={() => {setEditingId(null); setNewProduct({name:'', price:'', category:'Lavadora', description:'', imageUrl:''})}} className="w-full text-gray-400 font-bold text-sm mt-2">Cancelar Edición</button>
                )}
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-gray-800 ml-2">Inventario</h3>
            {products.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-[30px] flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <img src={p.imageUrl} className="w-20 h-20 rounded-2xl object-cover" />
                  <div>
                    <div className="font-black text-gray-900 text-lg">{p.name}</div>
                    <div className="text-blue-600 font-bold text-sm">${p.price.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(p)} className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Wrench size={20}/></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-600 font-black animate-pulse">CARGANDO...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b h-24 flex items-center justify-between px-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><Refrigerator /></div>
          <span className="text-2xl font-black text-blue-900">REFRI<span className="text-blue-600">MASTER</span></span>
        </div>
        <div className="hidden md:flex gap-10 font-bold text-sm items-center">
          <button onClick={() => setView('home')} className={view === 'home' ? 'text-blue-600' : 'text-gray-400'}>INICIO</button>
          <button onClick={() => setView('catalog')} className={view === 'catalog' ? 'text-blue-600' : 'text-gray-400'}>TIENDA</button>
          <button onClick={() => setView('admin')} className="text-gray-400 flex items-center gap-2 hover:text-blue-600"><Lock size={16}/> ADMIN</button>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-8 py-3 rounded-2xl shadow-xl">WhatsApp</a>
        </div>
        <button className="md:hidden text-blue-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
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