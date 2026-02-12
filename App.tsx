import React, { useState, useEffect } from 'react';
import { AppPage, MarketData } from './types';
import { geminiService } from './services/geminiService';
import MarketMatrix from './components/MarketMatrix';
import CompetitorDetails from './components/CompetitorDetails';
import FieldResearchLab from './components/FieldResearchLab';

// Interface for AI Studio window object
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>(AppPage.MARKET_MATRIX);
  const [currentDMA, setCurrentDMA] = useState<string>('Dallas-Fort Worth');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  
  // API Key State
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
      if (hasKey && !hasLoadedInitial) {
        loadMarketData();
      }
    } else {
      // Fallback for dev environments without window.aistudio
      setHasApiKey(true);
      if (!hasLoadedInitial) {
         loadMarketData();
      }
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success after dialog interaction per guidelines
      setHasApiKey(true);
      loadMarketData();
    }
  };

  const loadMarketData = async () => {
    setIsLoading(true);
    const data = await geminiService.generateMarketMatrix(currentDMA);
    setMarketData(data);
    setIsLoading(false);
    setHasLoadedInitial(true);
  };

  if (!hasApiKey) {
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6">
              <div className="max-w-md text-center space-y-6">
                  <h1 className="text-3xl font-bold">AD&I Market Intelligence</h1>
                  <p className="text-slate-300">
                      Access to the Market Research Agent requires a valid API key with billing enabled (for Search & Veo capabilities).
                  </p>
                  <button 
                    onClick={handleSelectKey}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Select API Key
                  </button>
                  <p className="text-xs text-slate-500">
                      Learn more about billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">ai.google.dev/gemini-api/docs/billing</a>
                  </p>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-white">AD&I Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">Market Strategist Agent</p>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-3">
          <button
            onClick={() => setCurrentPage(AppPage.MARKET_MATRIX)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === AppPage.MARKET_MATRIX ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Market Matrix
          </button>
          
          <button
            onClick={() => setCurrentPage(AppPage.COMPETITOR_DEEP_DIVE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === AppPage.COMPETITOR_DEEP_DIVE ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Competitor Details
          </button>

          <button
            onClick={() => setCurrentPage(AppPage.FIELD_RESEARCH_LAB)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === AppPage.FIELD_RESEARCH_LAB ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Research Lab (AI)
          </button>
        </nav>

        {/* Global Context Control */}
        <div className="p-4 border-t border-slate-800">
           <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Target DMA</label>
           <select 
             value={currentDMA} 
             onChange={(e) => {
               setCurrentDMA(e.target.value);
               setHasLoadedInitial(false); // Trigger reload next time matrix is viewed or immediate?
             }}
             className="w-full bg-slate-800 text-white text-sm rounded border border-slate-700 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
           >
             <option value="Dallas-Fort Worth">Dallas-Fort Worth</option>
             <option value="Houston">Houston</option>
             <option value="Austin">Austin</option>
             <option value="San Antonio">San Antonio</option>
           </select>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        {currentPage === AppPage.MARKET_MATRIX && (
          <div className="h-full overflow-y-auto">
            <MarketMatrix 
              data={marketData} 
              isLoading={isLoading} 
              onRefresh={loadMarketData} 
            />
          </div>
        )}

        {currentPage === AppPage.COMPETITOR_DEEP_DIVE && (
           <div className="h-full overflow-hidden">
             <CompetitorDetails 
                marketData={marketData}
                dma={currentDMA}
             />
           </div>
        )}

        {currentPage === AppPage.FIELD_RESEARCH_LAB && (
            <div className="h-full pb-2">
                <FieldResearchLab />
            </div>
        )}
      </main>
    </div>
  );
};

export default App;