import React, { useState, useEffect } from 'react';
import { MarketData, CompetitorDetail } from '../types';
import { geminiService } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CompetitorDetailsProps {
  marketData: MarketData[];
  dma: string;
}

const CompetitorDetails: React.FC<CompetitorDetailsProps> = ({ marketData, dma }) => {
  const [selectedDso, setSelectedDso] = useState<string>(marketData[0]?.dsoName || '');
  const [details, setDetails] = useState<CompetitorDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDso) {
      fetchDetails(selectedDso);
    }
  }, [selectedDso]);

  const fetchDetails = async (name: string) => {
    setLoading(true);
    const result = await geminiService.generateCompetitorDetails(dma, name);
    setDetails(result);
    setLoading(false);
  };

  const selectedMarketData = marketData.find(m => m.dsoName === selectedDso);

  const priceData = selectedMarketData ? [
    { name: 'Basic Denture', price: selectedMarketData.priceDenture === 'TBD' ? 0 : selectedMarketData.priceDenture },
    { name: 'Tier 1 Low', price: selectedMarketData.priceTier1Low === 'TBD' ? 0 : selectedMarketData.priceTier1Low },
    { name: 'Tier 1 High', price: selectedMarketData.priceTier1High === 'TBD' ? 0 : selectedMarketData.priceTier1High },
  ] : [];

  return (
    <div className="flex flex-col md:flex-row h-full gap-6 p-6">
      {/* Sidebar List */}
      <div className="w-full md:w-1/4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-700">Competitors</h3>
        </div>
        <div className="overflow-y-auto flex-1">
          {marketData.map((dso, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDso(dso.dsoName)}
              className={`w-full text-left px-4 py-3 text-sm font-medium border-b border-gray-50 transition-colors ${
                selectedDso === dso.dsoName 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {dso.dsoName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Detail Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-y-auto">
        {loading ? (
           <div className="flex items-center justify-center h-full">
               <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="mt-2 text-gray-500">Retrieving intelligence...</span>
               </div>
           </div>
        ) : details ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-1">{details.dsoName}</h2>
              <p className="text-sm text-gray-500 uppercase tracking-wide">DMA: {dma}</p>
            </div>

            {/* Price Visuals */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Reference Visuals</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={priceData} layout="vertical" margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" unit="$" hide />
                            <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="price" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={30} label={{ position: 'right', fill: '#4b5563' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Personnel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Identified Dentists
                    </h4>
                    {details.dentistNames.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {details.dentistNames.map((name, i) => <li key={i}>{name}</li>)}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No specific names identified in public records.</p>
                    )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        Surgeons (Implant/Oral)
                    </h4>
                     {details.surgeonNames.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {details.surgeonNames.map((name, i) => <li key={i}>{name}</li>)}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No specialist surgeons explicitly listed.</p>
                    )}
                </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <p className="text-xs font-bold text-yellow-800 uppercase mb-1">Source of Evidence</p>
                <p className="text-sm text-yellow-900">{details.evidenceSource}</p>
            </div>
          </div>
        ) : (
            <div className="text-center text-gray-400 mt-20">Select a competitor to view details.</div>
        )}
      </div>
    </div>
  );
};

export default CompetitorDetails;
