export interface MarketData {
  dsoName: string;
  clinicCount: number;
  dentistCount: number;
  surgeonCount: number;
  priceDenture: number | 'TBD';
  priceTier1Low: number | 'TBD';
  priceTier1High: number | 'TBD';
}

export interface CompetitorDetail {
  dsoName: string;
  dentistNames: string[];
  surgeonNames: string[];
  evidenceSource: string;
}

export enum AppPage {
  MARKET_MATRIX = 'MARKET_MATRIX',
  COMPETITOR_DEEP_DIVE = 'COMPETITOR_DEEP_DIVE',
  FIELD_RESEARCH_LAB = 'FIELD_RESEARCH_LAB',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
