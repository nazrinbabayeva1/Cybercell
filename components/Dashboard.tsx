
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from './FileUpload';
import { ResultsDisplay } from './ResultsDisplay';
import { Spinner } from './Spinner';
import { analyzeLogs } from '../services/geminiService';
import type { LogEntry, AnalysisResult } from '../types';

interface DashboardProps {
  addAnalysisToHistory: (result: AnalysisResult) => void;
  historicalResult: AnalysisResult | null;
  onStartNewAnalysis: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  addAnalysisToHistory,
  historicalResult,
  onStartNewAnalysis,
}) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  
  useEffect(() => {
    if (historicalResult) {
      setAnalysisResult(historicalResult);
      setIsLoading(false);
      setFileName(historicalResult.fileName);
    } else {
      setAnalysisResult(null);
      setFileName(null);
    }
  }, [historicalResult]);

  const handleProcessFile = async (logs: LogEntry[], name: string) => {
    setIsLoading(true);
    setFileName(name);
    setProgress(0);
    setAnalysisResult(null);

    try {
      const results = await analyzeLogs(logs, setProgress);
      const summary = results.reduce(
        (acc, item) => {
          acc.total++;
          if (item.classification === 'malicious') acc.malicious++;
          else acc.benign++;
          return acc;
        },
        { total: 0, malicious: 0, benign: 0 }
      );

      const newResult: AnalysisResult = {
        id: uuidv4(),
        fileName: name,
        timestamp: Date.now(),
        results,
        summary,
      };

      setAnalysisResult(newResult);
      addAnalysisToHistory(newResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      // TODO: show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const showFileUpload = !isLoading && !analysisResult;

  return (
    <div className="max-w-7xl mx-auto">
      {showFileUpload && (
        <FileUpload onProcessFile={handleProcessFile} />
      )}
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 rounded-xl shadow-lg">
          <Spinner />
          <h2 className="text-2xl font-bold text-white mt-6">Analyzing Logs...</h2>
          <p className="text-gray-400 mt-2">Analyzing file: {fileName}</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4 max-w-md">
            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-cyan-400 mt-2 font-semibold">{Math.round(progress)}%</p>
        </div>
      )}

      {analysisResult && !isLoading && (
        <div>
           <div className="mb-6 text-right">
              <button
                onClick={onStartNewAnalysis}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Start New Analysis
              </button>
            </div>
          <ResultsDisplay result={analysisResult} />
        </div>
      )}
    </div>
  );
};
