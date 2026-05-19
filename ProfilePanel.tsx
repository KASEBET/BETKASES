import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';

export default function ProfilePanel() {
    const [view, setView] = useState<'none' | 'cards' | 'bank'>('none');
    const [cards, setCards] = useState<any[]>([]);
    
    // Card states
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardBank, setCardBank] = useState('');

    useEffect(() => {
        if (auth.currentUser) {
            const unsubscribe = db.collection('users').doc(auth.currentUser.uid).onSnapshot(doc => {
                if (doc.exists) {
                    setCards(doc.data()?.savedCards || []);
                }
            });
            return () => unsubscribe();
        }
    }, []);

    const saveCard = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const cleanNumber = cardNumber.replace(/\s/g, '');
        const newCard = {
            id: Date.now().toString(),
            cardNumber: cleanNumber,
            cardHolder,
            expiry: cardExpiry,
            cvv: cardCvv,
            bank: cardBank,
            last4: cleanNumber.slice(-4),
            brand: cleanNumber[0] === '4' ? 'Visa' : 'Mastercard',
            createdAt: Date.now()
        };
        const updatedCards = [...cards, newCard];
        await db.collection('users').doc(user.uid).set({ savedCards: updatedCards }, { merge: true });
        // Clear fields
        setCardNumber('');
        setCardHolder('');
        setCardExpiry('');
        setCardCvv('');
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="panel-buttons flex justify-center gap-4 mb-10">
                <button className="btn btn-green" onClick={() => setView(view === 'cards' ? 'none' : 'cards')}>💳 Mis Tarjetas</button>
                <button className="btn btn-green" onClick={() => setView(view === 'bank' ? 'none' : 'bank')}>🏦 Datos Bancarios</button>
            </div>

            {view === 'cards' && (
                <div className="user-panel bg-[#111] p-8 rounded-[30px] border border-[#00ff88]">
                    <h2 className="text-2xl font-bold mb-6">💳 Mis Métodos de Pago</h2>
                    <div className="grid gap-4 mb-8">
                        {cards.map(c => (
                            <div key={c.id} className="bg-[#1a1a2e] p-4 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{c.brand} •••• {c.last4}</p>
                                    <p className="text-sm text-gray-400">{c.cardHolder}</p>
                                </div>
                                <button className="text-red-500 font-bold">Eliminar</button>
                            </div>
                        ))}
                    </div>
                    <hr className="border-[#222] my-6" />
                    <h3 className="text-xl font-bold mb-4">Añadir Tarjeta</h3>
                    <div className="space-y-4">
                        <input className="w-full bg-[#0c0c0c] border border-[#222] p-4 rounded-xl" placeholder="Número de tarjeta" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
                        <input className="w-full bg-[#0c0c0c] border border-[#222] p-4 rounded-xl" placeholder="Titular" value={cardHolder} onChange={e => setCardHolder(e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                            <input className="w-full bg-[#0c0c0c] border border-[#222] p-4 rounded-xl" placeholder="MM/AA" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} />
                            <input className="w-full bg-[#0c0c0c] border border-[#222] p-4 rounded-xl" type="password" placeholder="CVV" value={cardCvv} onChange={e => setCardCvv(e.target.value)} />
                        </div>
                        <button className="btn btn-green w-full" onClick={saveCard}>Guardar Tarjeta</button>
                    </div>
                </div>
            )}
        </div>
    );
}
