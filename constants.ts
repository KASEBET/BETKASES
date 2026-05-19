import { SportData, Plan } from './types';

export const sportsData: Record<string, SportData> = {
    futbol: {
        name: "Fútbol",
        teams: [
            { name: "Manchester City", logo: "https://i.postimg.cc/j5w9hyxR/2026-05-13-73f43f96-4ece-4239-aa63-b065cf33697e.png" },
            { name: "Manchester United", logo: "https://i.postimg.cc/yYx0KgrL/manutd.png" },
            { name: "Real Madrid", logo: "https://i.postimg.cc/T19s9DNn/real-madrid.jpg" },
            { name: "Barcelona", logo: "https://i.postimg.cc/d3YMnvsv/barcelona.png" },
            { name: "Liverpool", logo: "https://i.postimg.cc/nhLy33JX/liverpool.png" },
            { name: "Chelsea", logo: "https://i.postimg.cc/7hJkmXwQ/chelsea.png" },
            { name: "Arsenal", logo: "https://i.postimg.cc/FzMqSPkY/arsenal.png" },
            { name: "Bayern Munich", logo: "https://i.postimg.cc/7YgJw0Mf/bayern.png" },
            { name: "PSG", logo: "https://i.postimg.cc/B6DzMqX4/psg.png" },
            { name: "Juventus", logo: "https://i.postimg.cc/L5JSzLBj/juventus.png" },
            { name: "AC Milan", logo: "https://i.postimg.cc/NFHW6N1c/acmilan.png" },
            { name: "Inter Milan", logo: "https://i.postimg.cc/GtPyhNJ1/inter.png" },
            { name: "Atletico Madrid", logo: "https://i.postimg.cc/d1HdRbPv/atletico.png" },
            { name: "Tottenham", logo: "https://i.postimg.cc/5N7z1nRN/tottenham.png" },
            { name: "Newcastle", logo: "https://i.postimg.cc/8cCRnTGJ/newcastle.png" }
        ]
    },
    tenis: {
        name: "Tenis",
        teams: [
            { name: "Carlos Alcaraz", logo: "https://i.postimg.cc/j5w9hyxR/2026-05-13-73f43f96-4ece-4239-aa63-b065cf33697e.png" },
            { name: "Novak Djokovic", logo: "https://i.postimg.cc/j5w9hyxR/2026-05-13-73f43f96-4ece-4239-aa63-b065cf33697e.png" },
            { name: "Jannik Sinner", logo: "https://i.postimg.cc/j5w9hyxR/2026-05-13-73f43f96-4ece-4239-aa63-b065cf33697e.png" },
            { name: "Daniil Medvedev", logo: "https://i.postimg.cc/j5w9hyxR/2026-05-13-73f43f96-4ece-4239-aa63-b065cf33697e.png" },
            { name: "Rafael Nadal", logo: "https://i.postimg.cc/j5w9hyxR/2026-05-13-73f43f96-4ece-4239-aa63-b065cf33697e.png" }
        ]
    },
    nba: {
        name: "NBA",
        teams: [
            { name: "Los Angeles Lakers", logo: "https://i.postimg.cc/j5w9hyxR/2026-05-13-73f43f96-4ece-4239-aa63-b065cf33697e.png" },
            { name: "Golden State Warriors", logo: "https://i.postimg.cc/j5w9hyxR/2026-05-13-73f43f96-4ece-4239-aa63-b065cf33697e.png" }
        ]
    }
};

export const defaultPlans: Plan[] = [
    { id: "quincenal", name: "Plan Quincenal", price: 30000, period: "15 días", features: ["Acceso a picks premium", "Soporte 24/7"], recommended: false },
    { id: "mensual", name: "Plan Mensual", price: 50000, period: "mes", features: ["Todo del Quincenal", "Picks VIP", "Grupo privado"], recommended: true },
    { id: "anual", name: "Plan Anual", price: 500000, period: "año", features: ["Todo del Mensual", "2 meses gratis", "Soporte VIP"], recommended: false }
];

export const planDurations = { "quincenal": 15, "mensual": 30, "anual": 365 };
