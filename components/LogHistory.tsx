
import React from 'react';
import type { AnalysisResult } from '../types';
import { Icons } from './Icons';

interface LogHistoryProps {
  history: AnalysisResult[];
  onViewResult: (resultId: string) => void;
}

export const LogHistory: React.FC<LogHistoryProps> = ({ history, onViewResult }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Log Analysis History</h1>
      {history.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
          <Icons.history className="mx-auto h-12 w-12 text-gray-500" />
          <h3 className="mt-4 text-xl font-medium text-white">No History Found</h3>
          <p className="mt-2 text-gray-400">Your past log analyses will appear here.</p>
        </div>
      ) : (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">File Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Logs</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider text-red-400">Malicious</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider text-green-400">Benign</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.fileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.summary.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-semibold">{item.summary.malicious}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">{item.summary.benign}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => onViewResult(item.id)} className="text-cyan-400 hover:text-cyan-300 transition-colors">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
