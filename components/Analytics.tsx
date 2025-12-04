import React, { useState, useMemo } from 'react';
import { AppData, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { analyzeBusinessData } from '../services/gemini';

interface AnalyticsProps {
  data: AppData;
}

export const Analytics: React.FC<AnalyticsProps> = ({ data }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate top selling products
  const chartData = useMemo(() => {
    const productSales: Record<string, number> = {};

    data.transactions
      .filter(t => t.type === TransactionType.OUTWARD)
      .forEach(t => {
        t.items.forEach(item => {
          productSales[item.productName] = (productSales[item.productName] || 0) + item.quantity;
        });
      });

    return Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5); // Top 5
  }, [data.transactions]);

  const handleRunAnalysis = async () => {
    setLoading(true);
    const result = await analyzeBusinessData(data);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            </span>
            Top Selling Products
          </h3>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="quantity" fill="#6366f1" radius={[4, 4, 0, 0]} name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No sales data available yet
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
              <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
              AI Business Insights
            </h3>
            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>{analysis ? 'Refresh' : 'Analyze'}</span>
            </button>
          </div>
          
          <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-100 overflow-y-auto max-h-[256px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                <p className="text-sm">Gemini is analyzing your stock flow...</p>
              </div>
            ) : analysis ? (
              <div className="prose prose-sm prose-purple max-w-none text-slate-700">
                {/* Simple markdown rendering by replacing newlines and bullets manually since we can't use a library like react-markdown */}
                {analysis.split('\n').map((line, i) => {
                  if (line.startsWith('**')) return <h4 key={i} className="font-bold mt-2 mb-1 text-slate-900">{line.replace(/\*\*/g, '')}</h4>;
                  if (line.startsWith('* ') || line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.replace(/^[\*-] /, '')}</li>;
                  if (line.trim() === '') return <br key={i}/>;
                  return <p key={i}>{line}</p>;
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <p className="text-sm text-center">Click Analyze to generate insights powered by Gemini 2.5 Flash.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};