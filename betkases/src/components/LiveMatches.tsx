import React, { useState, useEffect } from 'react';

interface Match {
    id: string;
    sport: string;
    liga: string;
    hora: string;
    local: { name: string, logo: string, score: string };
    away: { name: string, logo: string, score: string };
    enVivo: boolean;
    tiempo: string;
}

export default function LiveMatches({ sport }: { sport: string }) {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const leagueMapping: Record<string, string[]> = {
                futbol: ['eng.1', 'esp.1', 'ita.1', 'ger.1', 'fra.1'],
                nba: ['basketball/nba'],
                tenis: ['tennis/atp', 'tennis/wta']
            };

            const selectedLeagues = leagueMapping[sport] || leagueMapping.futbol;
            const allFetched: Match[] = [];

            for (const league of selectedLeagues) {
                const url = sport === 'futbol' 
                    ? `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`
                    : `https://site.api.espn.com/apis/site/v2/sports/${league}/scoreboard`;
                
                const res = await fetch(url);
                const data = await res.json();
                
                if (data.events) {
                    data.events.forEach((ev: any) => {
                        const state = ev.status?.type?.state;
                        if (state !== 'in' && state !== 'pre') return;
                        
                        const comps = ev.competitions[0].competitors;
                        const date = new Date(ev.date);
                        
                        allFetched.push({
                            id: ev.id,
                            sport,
                            liga: data.leagues?.[0]?.name || sport,
                            hora: date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
                            local: { 
                                name: comps[0].team.displayName, 
                                logo: comps[0].team.logo, 
                                score: comps[0].score || '-' 
                            },
                            away: { 
                                name: comps[1].team.displayName, 
                                logo: comps[1].team.logo, 
                                score: comps[1].score || '-' 
                            },
                            enVivo: state === 'in',
                            tiempo: ev.status.displayClock || ev.status.type.description
                        });
                    });
                }
            }
            setMatches(allFetched);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
        const interval = setInterval(fetchMatches, 60000);
        return () => clearInterval(interval);
    }, [sport]);

    if (loading && matches.length === 0) return <div className="text-center py-10">Buscando partidos en vivo...</div>;

    return (
        <div className="mb-10">
            <h3 className="text-[#00ff88] text-xl mb-4 flex items-center gap-3">
                📡 PARTIDOS EN VIVO
                {matches.filter(m => m.enVivo).length > 0 && <span className="bg-red-600 px-3 py-1 rounded-full text-xs text-white animate-pulse">LIVE</span>}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map(m => (
                    <div key={m.id} className={`live-match-card ${m.enVivo ? 'border-red-600' : 'border-[#1a3a5c]'}`}>
                        <div className="live-match-header">
                            {m.enVivo ? <span className="live-badge">🔴 EN VIVO</span> : <span className="text-[#4db8ff] text-xs font-bold font-mono">🕐 PRÓXIMO</span>}
                            <span className="live-period">{m.tiempo}</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-4">{m.liga} · {m.hora}</div>
                        
                        <div className="live-match-teams">
                            <div className="live-team">
                                <img src={m.local.logo} className="live-team-logo mx-auto" alt="" />
                                <div className="live-team-name">{m.local.name}</div>
                                <div className="live-team-score" style={{ color: m.enVivo ? '#00ff88' : '#444' }}>{m.local.score}</div>
                            </div>
                            <div className="text-[#888] font-bold">VS</div>
                            <div className="live-team">
                                <img src={m.away.logo} className="live-team-logo mx-auto" alt="" />
                                <div className="live-team-name">{m.away.name}</div>
                                <div className="live-team-score" style={{ color: m.enVivo ? '#00ff88' : '#444' }}>{m.away.score}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {matches.length === 0 && <p className="text-gray-500 text-center">No hay partidos próximos o en vivo en este momento.</p>}
        </div>
    );
}
