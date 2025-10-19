
import React, { useState, useMemo } from 'react';
import type { AnalysisResult, Classification } from '../types';
import { Icons } from './Icons';

interface ResultsDisplayProps {
  result: AnalysisResult;
}

const ResultCard: React.FC<{ title: string; value: number; color: string; icon: React.ReactNode }> = ({ title, value, color, icon }) => (
  <div className="bg-gray-800 p-6 rounded-xl flex items-center justify-between shadow-lg">
    <div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
    <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('400', '500/20')}`}>
      {icon}
    </div>
  </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const [filter, setFilter] = useState<Classification | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResults = useMemo(() => {
    return result.results
      .filter(item => filter === 'all' || item.classification === filter)
      .filter(item => 
        item.log.body.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.log.path.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [result.results, filter, searchTerm]);

  const { total, malicious, benign } = result.summary;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Analysis Complete</h2>
        <p className="text-gray-400 mt-2">
          Analyzed <span className="font-semibold text-cyan-400">{result.fileName}</span> on {new Date(result.timestamp).toLocaleString()}
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <ResultCard title="Total Logs" value={total} color="text-cyan-400" icon={<Icons.shieldCheck className="h-6 w-6 text-cyan-400" />} />
        <ResultCard title="Malicious" value={malicious} color="text-red-400" icon={<Icons.alertTriangle className="h-6 w-6 text-red-400" />} />
        <ResultCard title="Benign" value={benign} color="text-green-400" icon={<Icons.checkCircle className="h-6 w-6 text-green-400" />} />
      </div>

      <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-700 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search in logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 bg-gray-700/50 text-white rounded-md border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <div className="flex items-center space-x-2">
            <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md text-sm ${filter === 'all' ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>All</button>
            <button onClick={() => setFilter('malicious')} className={`px-3 py-1 rounded-md text-sm ${filter === 'malicious' ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Malicious</button>
            <button onClick={() => setFilter('benign')} className={`px-3 py-1 rounded-md text-sm ${filter === 'benign' ? 'bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Benign</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">Classification</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">Path</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-2/6">Body</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-2/6">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredResults.length > 0 ? filteredResults.map((item, index) => (
                <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.classification === 'malicious' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                    }`}>
                      {item.classification}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-300 font-mono break-all">{item.log.path}</td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-400 font-mono break-all">{item.log.body}</td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-300 break-words">{item.reason}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    No logs match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
