import React from 'react';
import { MarketData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface MarketMatrixProps {
  data: MarketData[];
  isLoading: boolean;
  onRefresh: () => void;
}

const MarketMatrix: React.FC<MarketMatrixProps> = ({ data, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="text-gray-600 text-lg font-medium">Agent 260206 is scanning the market...</p>
        <p className="text-gray-400 text-sm">Accessing Google Search & Maps Grounding</p>
      </div>
    );
  }

  // Prepare data for chart (filtering out TBDs for visualization)
  const chartData = data.map(d => ({
    name: d.dsoName,
    "Denture Price": d.priceDenture === 'TBD' ? 0 : d.priceDenture,
    "Tier 1 Low": d.priceTier1Low === 'TBD' ? 0 : d.priceTier1Low,
    "Tier 1 High": d.priceTier1High === 'TBD' ? 0 : d.priceTier1High,
  }));

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Competitive Matrix (The Market Scan)</h2>
        <button 
          onClick={onRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh Data
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Competitors</p>
            <p className="text-2xl font-bold text-gray-800">{data.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Avg Clinics/DSO</p>
            <p className="text-2xl font-bold text-gray-800">
                {(data.reduce((acc, curr) => acc + curr.clinicCount, 0) / (data.length || 1)).toFixed(1)}
            </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Surgeons</p>
            <p className="text-2xl font-bold text-gray-800">{data.reduce((acc, curr) => acc + curr.surgeonCount, 0)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Avg Denture Price</p>
            <p className="text-2xl font-bold text-green-600">
                ${(data.filter(d => typeof d.priceDenture === 'number').reduce((acc, curr) => acc + (curr.priceDenture as number), 0) / (data.filter(d => typeof d.priceDenture === 'number').length || 1)).toFixed(0)}
            </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DSO Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinics</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dentists</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surgeons</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Denture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier 1 (Low)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier 1 (High)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.dsoName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.clinicCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.dentistCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.surgeonCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {typeof row.priceDenture === 'number' ? `$${row.priceDenture}` : 'TBD'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {typeof row.priceTier1Low === 'number' ? `$${row.priceTier1Low}` : 'TBD'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {typeof row.priceTier1High === 'number' ? `$${row.priceTier1High}` : 'TBD'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing Landscape Analysis</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis unit="$" />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Legend />
              <Bar dataKey="Denture Price" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Tier 1 Low" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Tier 1 High" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MarketMatrix;
