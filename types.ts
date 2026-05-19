export interface Team {
    name: string;
    logo: string;
    sport?: string;
    id?: string;
}

export interface SportData {
    name: string;
    teams: Team[];
}

export interface Bet {
    id: string;
    match: string;
    prediction: string;
    odds: string;
    image: string;
    awayImage?: string;
    type: 'gratis' | 'premium';
    sport: string;
    status: 'active' | 'completed';
    result: 'win' | 'loss' | 'void' | null;
    createdAt: number;
    userId: string;
    userEmail: string;
    liveMatchId?: string;
    ligaSlug?: string;
    matchStats?: any;
}

export interface Plan {
    id: string;
    name: string;
    price: number;
    period: string;
    features: string[];
    recommended: boolean;
}
