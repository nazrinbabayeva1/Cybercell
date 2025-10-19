
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { LogHistory } from './components/LogHistory';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { AnalysisResult } from './types';
import { View } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [history, setHistory] = useLocalStorage<AnalysisResult[]>('log-analysis-history', []);
  const [selectedHistoryResult, setSelectedHistoryResult] = useState<AnalysisResult | null>(null);

  const addAnalysisToHistory = (result: AnalysisResult) => {
    setHistory(prevHistory => [result, ...prevHistory]);
  };

  const handleViewHistoryItem = (resultId: string) => {
    const result = history.find(item => item.id === resultId);
    if (result) {
      setSelectedHistoryResult(result);
      setView(View.DASHBOARD);
    }
  };
  
  const handleStartNewAnalysis = () => {
      setSelectedHistoryResult(null);
      setView(View.DASHBOARD);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header currentView={view} setView={setView} onNewAnalysis={handleStartNewAnalysis} />
      <main className="p-4 sm:p-6 lg:p-8">
        {view === View.DASHBOARD && (
          <Dashboard
            addAnalysisToHistory={addAnalysisToHistory}
            historicalResult={selectedHistoryResult}
            onStartNewAnalysis={handleStartNewAnalysis}
          />
        )}
        {view === View.HISTORY && (
          <LogHistory history={history} onViewResult={handleViewHistoryItem} />
        )}
      </main>
    </div>
  );
};

export default App;
