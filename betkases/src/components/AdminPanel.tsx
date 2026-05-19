import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { sportsData } from '../constants';
import { Bet, Team } from '../types';

const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    // Re-use current toast logic or better, use a library, but following user's "dont change much"
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<div class="toast-body"><div class="toast-msg">${message}</div></div>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
};

export default function AdminPanel({ sport }: { sport: string }) {
    const [localTeam, setLocalTeam] = useState<Team | null>(null);
    const [awayTeam, setAwayTeam] = useState<Team | null>(null);
    const [prediction, setPrediction] = useState('');
    const [odds, setOdds] = useState('');
    const [type, setType] = useState<'gratis' | 'premium'>('gratis');
    const [customTeams, setCustomTeams] = useState<Team[]>([]);

    useEffect(() => {
        const unsubscribe = db.collection('teams').onSnapshot(snap => {
            const teams = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
            setCustomTeams(teams);
        });
        return () => unsubscribe();
    }, []);

    const teams = [...(sportsData[sport]?.teams || []), ...customTeams.filter(t => t.sport === sport)];

    const handlePublish = async () => {
        if (!localTeam || !awayTeam || !prediction || !odds) {
            return alert('Completa todos los campos');
        }
        
        try {
            await db.collection('bets').add({
                match: `${localTeam.name} vs ${awayTeam.name}`,
                prediction,
                odds,
                image: localTeam.logo,
                awayImage: awayTeam.logo,
                type,
                sport,
                status: 'active',
                result: null,
                createdAt: Date.now(),
                userId: auth.currentUser?.uid,
                userEmail: auth.currentUser?.email
            });
            setPrediction('');
            setOdds('');
            showToast('Apuesta publicada', 'success');
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="admin-panel mt-10">
            <h2 className="text-2xl font-bold mb-6">🎮 Panel Administrador</h2>
            
            <div className="team-selectors grid grid-cols-2 gap-4">
                <div className="team-selector">
                    <label className="block mb-2 text-[#00ff88]">🏠 LOCAL</label>
                    <select 
                        className="w-full bg-[#0c0c0c] border border-[#222] rounded-xl p-3 text-white"
                        onChange={(e) => setLocalTeam(JSON.parse(e.target.value))}
                    >
                        <option value="">Seleccionar</option>
                        {teams.map((t, i) => <option key={i} value={JSON.stringify(t)}>{t.name}</option>)}
                    </select>
                </div>
                <div className="team-selector">
                    <label className="block mb-2 text-[#00ff88]">✈️ VISITANTE</label>
                    <select 
                        className="w-full bg-[#0c0c0c] border border-[#222] rounded-xl p-3 text-white"
                        onChange={(e) => setAwayTeam(JSON.parse(e.target.value))}
                    >
                        <option value="">Seleccionar</option>
                        {teams.map((t, i) => <option key={i} value={JSON.stringify(t)}>{t.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                <input 
                    type="text" 
                    placeholder="🔮 Pronóstico" 
                    className="w-full p-4 bg-[#0c0c0c] border border-[#222] rounded-xl text-white outline-none focus:border-[#00ff88]"
                    value={prediction}
                    onChange={e => setPrediction(e.target.value)}
                />
                <input 
                    type="text" 
                    placeholder="💰 Cuota" 
                    className="w-full p-4 bg-[#0c0c0c] border border-[#222] rounded-xl text-white outline-none focus:border-[#00ff88]"
                    value={odds}
                    onChange={e => setOdds(e.target.value)}
                />
                <select 
                    className="w-full p-4 bg-[#0c0c0c] border border-[#222] rounded-xl text-white outline-none"
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                >
                    <option value="gratis">Gratis</option>
                    <option value="premium">Premium</option>
                </select>
                <button className="btn btn-green w-full" onClick={handlePublish}>Publicar Apuesta</button>
            </div>
        </div>
    );
}
