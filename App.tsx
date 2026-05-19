import React, { useState, useEffect } from 'react';
import { auth, db, ADMIN_EMAIL } from './lib/firebase';
import { sportsData, defaultPlans } from './constants';
import { Bet } from './types';
import firebase from './lib/firebase';
import AdminPanel from './components/AdminPanel';
import LiveMatches from './components/LiveMatches';
import ProfilePanel from './components/ProfilePanel';

// Helper for Toast
const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const container = document.getElementById('toastContainer');
    if (!container) {
        const div = document.createElement('div');
        div.id = 'toastContainer';
        document.body.appendChild(div);
    }
    const toastContainer = document.getElementById('toastContainer')!;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} active`;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const titles = { success: 'Listo', error: 'Error', warning: 'Atención', info: 'Aviso' };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-body">
            <div class="toast-title">${titles[type]}</div>
            <div class="toast-msg">${message}</div>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 320);
    }, 4000);
};

export default function App() {
    const [user, setUser] = useState<firebase.User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [bets, setBets] = useState<Bet[]>([]);
    const [currentFilter, setCurrentFilter] = useState('all');
    const [currentDateFilter, setCurrentDateFilter] = useState('today');
    const [currentSportFilter, setCurrentSportFilter] = useState('futbol');
    const [showPlans, setShowPlans] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (u) => {
            setUser(u);
            if (u) {
                try {
                    const adminDoc = await db.collection('admins').doc(u.uid).get();
                    setIsAdmin(u.email === ADMIN_EMAIL || (adminDoc.exists && adminDoc.data()?.isAdmin));
                } catch (e) {
                    setIsAdmin(u.email === ADMIN_EMAIL);
                }
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });
        
        const savedEmail = localStorage.getItem('bk_savedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
        
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = db.collection('bets')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snap => {
                const betsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bet));
                setBets(betsData);
            });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) return showToast('Completa todos los campos', 'warning');
        try {
            if (rememberMe) {
                localStorage.setItem('bk_savedEmail', email);
                localStorage.setItem('bk_rememberMe', '1');
            } else {
                localStorage.removeItem('bk_savedEmail');
                localStorage.removeItem('bk_rememberMe');
            }
            await auth.signInWithEmailAndPassword(email, password);
            showToast('¡Bienvenido!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const handleRegister = async () => {
        if (!email || !password) return showToast('Completa todos los campos', 'warning');
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await db.collection('users').doc(userCredential.user?.uid).set({
                email,
                createdAt: Date.now()
            });
            showToast('Cuenta creada', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const handleLogout = () => auth.signOut();

    const filteredBets = bets.filter(b => {
        const matchesSport = b.sport === currentSportFilter || (!b.sport && currentSportFilter === 'futbol');
        if (!matchesSport) return false;

        const betDate = new Date(b.createdAt);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (currentDateFilter === 'today' && betDate < startOfToday) return false;
        if (currentDateFilter === 'yesterday') {
            const yesterday = new Date(startOfToday.getTime() - 86400000);
            if (betDate < yesterday || betDate >= startOfToday) return false;
        }
        
        if (currentFilter !== 'all') {
            if (currentFilter === 'win' && b.result !== 'win') return false;
            if (currentFilter === 'loss' && b.result !== 'loss') return false;
            if (currentFilter === 'void' && b.result !== 'void') return false;
            if (currentFilter === 'pending' && b.result !== null) return false;
        }

        return true;
    });

    if (loading) return <div className="loading-overlay active"><div className="loading-spinner"></div></div>;

    return (
        <div className="bg-[#050505] min-h-screen text-white">
            <header className="px-10 py-5">
                <div className="logo cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>BETKASE</div>
                <div className="nav-right">
                    {user && (
                        <button className="btn btn-green text-sm" onClick={() => setShowPlans(true)}>👑 Hazte Premium</button>
                    )}
                    {user && (
                        <button className="btn btn-green text-sm" onClick={handleLogout}>Cerrar sesión</button>
                    )}
                </div>
            </header>

            <section className="hero pt-32">
                <div className="hero-container px-6">
                    <div className="hero-left">
                        <h1 className="text-6xl md:text-8xl font-black">Gana tus <span className="text-[#00ff88]">apuestas</span></h1>
                        <p className="text-xl md:text-2xl text-gray-400 mt-6 max-w-2xl">Plataforma premium para tipsters y apostadores con resultados verificados y picks en tiempo real.</p>
                        <div className="stats mt-10 grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="stat"><h2>+12K</h2><p>Usuarios activos</p></div>
                            <div className="stat"><h2>87%</h2><p>ROI promedio</p></div>
                            <div className="stat hidden md:block"><h2>24/7</h2><p>Picks en vivo</p></div>
                        </div>
                        <button className="btn btn-gold btn-premium mt-8" onClick={() => setShowPlans(true)}>🔥 Ver Planes Premium</button>
                    </div>

                    {!user && (
                        <div className="login-box w-full max-w-md mx-auto">
                            <h2 className="login-title text-4xl font-bold mb-2">Acceso Premium</h2>
                            <p className="text-gray-500 mb-8">Ingresa para ver las mejores cuotas del día.</p>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
                            </div>
                            <div className="input-group">
                                <label>Contraseña</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="********" />
                            </div>
                            <div className="flex justify-between items-center mb-6 text-sm text-gray-400">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="accent-[#00ff88]" />
                                    No cerrar sesión
                                </label>
                                <p className="text-[#00ff88] cursor-pointer" onClick={() => showToast('Funcionalidad en desarrollo', 'info')}>¿Olvidaste tu contraseña?</p>
                            </div>
                            <div className="login-buttons flex gap-4">
                                <button className="btn btn-green flex-1" onClick={handleRegister}>Registro</button>
                                <button className="btn btn-green flex-1" onClick={handleLogin}>Entrar</button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {user && <ProfilePanel />}

            <section className="section max-w-7xl mx-auto px-6 mt-20">
                <LiveMatches sport={currentSportFilter} />

                <h2 className="section-title text-4xl mb-10">
                    {currentSportFilter === 'futbol' ? '⚽ Apuestas de Fútbol' : 
                     currentSportFilter === 'tenis' ? '🎾 Apuestas de Tenis' : '🏀 Apuestas de NBA'}
                </h2>

                <div className="sport-selector flex justify-center gap-4 mb-10 overflow-x-auto pb-4">
                    {Object.keys(sportsData).map(sport => (
                        <button 
                            key={sport}
                            className={`sport-btn whitespace-nowrap ${currentSportFilter === sport ? 'active' : ''}`}
                            onClick={() => setCurrentSportFilter(sport)}
                        >
                            {sport === 'futbol' ? '⚽ FÚTBOL' : sport === 'tenis' ? '🎾 TENIS' : '🏀 NBA'}
                        </button>
                    ))}
                </div>

                <div className="date-filters flex justify-center gap-3 mb-10 overflow-x-auto pb-4">
                    {['today', 'yesterday', 'week', 'month', 'all'].map(f => (
                        <button 
                            key={f}
                            className={`date-btn whitespace-nowrap ${currentDateFilter === f ? 'active' : ''}`}
                            onClick={() => setCurrentDateFilter(f)}
                        >
                            {f === 'today' ? '📅 Hoy' : f === 'yesterday' ? '📆 Ayer' : f === 'week' ? '📊 Semana' : f === 'month' ? '📈 Mes' : '🎯 Todas'}
                        </button>
                    ))}
                </div>

                <div className="tabs flex justify-center gap-2 mb-10 overflow-x-auto pb-4">
                    {['all', 'win', 'loss', 'void', 'pending'].map(f => (
                        <button 
                            key={f}
                            className={`tab-btn whitespace-nowrap ${currentFilter === f ? 'active' : ''}`}
                            onClick={() => setCurrentFilter(f)}
                        >
                            {f === 'all' ? '📋 Todas' : f === 'win' ? '🏆 Ganadas' : f === 'loss' ? '❌ Perdidas' : f === 'void' ? '⚠️ Anuladas' : '⏳ Pendientes'}
                        </button>
                    ))}
                </div>

                <div className="bets grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBets.length === 0 ? (
                        <p className="text-center col-span-full text-gray-600 py-20 italic">No se encontraron apuestas con estos filtros.</p>
                    ) : (
                        filteredBets.map(bet => (
                            <div key={bet.id} className="bet-card bg-[#111111] p-8 rounded-[30px] border border-[#222]">
                                {(bet.image || bet.awayImage) && (
                                    <div className="match-logos mb-6 bg-black/40 p-4 rounded-3xl flex justify-center items-center gap-4">
                                        <img className="team-logo w-16 h-16 object-contain" src={bet.image} alt="Local" />
                                        <span className="vs-text text-[#00ff88] font-black text-xl">VS</span>
                                        <img className="team-logo w-16 h-16 object-contain" src={bet.awayImage} alt="Away" />
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2 items-center mb-4">
                                    <div className={`tag ${bet.type === 'premium' ? 'premium' : 'free'}`}>
                                        {bet.type === 'premium' ? '💎 PREMIUM' : '🎁 GRATIS'}
                                    </div>
                                    {bet.result && (
                                        <span className={`result-tag ${bet.result === 'win' ? 'result-win' : bet.result === 'loss' ? 'result-loss' : 'result-void'}`}>
                                            {bet.result === 'win' ? '🏆 GANADA' : bet.result === 'loss' ? '❌ PERDIDA' : '⚠️ ANULADA'}
                                        </span>
                                    )}
                                    {!bet.result && <span className="result-tag result-pending">⏳ PENDIENTE</span>}
                                </div>
                                <h3 className="text-xl font-bold mb-3">🏆 {bet.match}</h3>
                                <div className="relative">
                                    <p className={`text-gray-400 leading-relaxed ${bet.type === 'premium' && !user ? 'blur-sm select-none' : ''}`}>
                                        {bet.type === 'premium' && !user ? 'Este pronóstico está reservado para usuarios premium' : bet.prediction}
                                    </p>
                                    {bet.type === 'premium' && !user && (
                                        <div className="absolute inset-0 flex items-center justify-center font-bold text-white">🔒 Inicia sesión</div>
                                    )}
                                </div>
                                <div className="mt-6 pt-6 border-t border-[#222]">
                                    <div className="text-[#00ff88] text-3xl font-black">💰 {bet.odds}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {isAdmin && <AdminPanel sport={currentSportFilter} />}
            </section>

            {showPlans && (
                <div className="modal fixed inset-0 z-[2000] overflow-y-auto bg-black/98 flex items-center justify-center p-6 backdrop-blur-xl">
                    <div className="modal-content max-w-5xl w-full">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-black text-white">💎 Elige tu Membresía Premium</h2>
                            <button className="text-4xl hover:text-red-500 transition-colors" onClick={() => setShowPlans(false)}>×</button>
                        </div>
                        <div className="plans-container grid grid-cols-1 md:grid-cols-3 gap-8">
                            {defaultPlans.map(plan => (
                                <div key={plan.id} className={`plan-card ${plan.recommended ? 'recommended' : ''}`}>
                                    {plan.recommended && <div className="plan-badge">OFERTA ESTRELLA</div>}
                                    <div className="plan-name">{plan.name}</div>
                                    <div className="plan-price">${plan.price.toLocaleString()}<span className="text-sm font-normal opacity-50 ml-1">COP / {plan.period}</span></div>
                                    <ul className="plan-features text-left">
                                        {plan.features.map((f, i) => <li key={i} className="py-2 border-b border-[#222]">✓ {f}</li>)}
                                    </ul>
                                    <button className="btn btn-green w-full mt-6" onClick={() => showToast('Sistema de pagos en mantenimiento temporal', 'warning')}>Suscribirse</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <footer className="mt-20 py-10 border-t border-[#111] text-center text-gray-600">
                <div className="logo mb-4 opacity-50 grayscale">BETKASE</div>
                <p>&copy; 2026 Plataforma Premium de Apuestas Deportivas. Todos los derechos reservados.</p>
            </footer>
            
            <div id="toastContainer" className="fixed top-24 right-6 z-[3000] flex flex-col gap-3"></div>
        </div>
    );
}
