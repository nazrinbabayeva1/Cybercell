import React, { useState, useCallback } from 'react';
import type { LogEntry } from '../types';
import { Icons } from './Icons';

interface FileUploadProps {
  onProcessFile: (logs: LogEntry[], fileName: string) => void;
}

const REQUIRED_COLUMNS = ['path', 'body'];

export const FileUpload: React.FC<FileUploadProps> = ({ onProcessFile }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file) return;
    if (file.type !== 'text/csv') {
      setError('Invalid file type. Please upload a CSV file.');
      return;
    }

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
            throw new Error('CSV file must have a header and at least one data row.');
        }

        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        const missingCols = REQUIRED_COLUMNS.filter(col => !header.includes(col));

        if (missingCols.length > 0) {
          throw new Error(`The uploaded CSV is missing required columns: ${missingCols.join(', ')}.`);
        }

        const pathIndex = header.indexOf('path');
        const bodyIndex = header.indexOf('body');
        
        const logs: LogEntry[] = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            path: values[pathIndex] || '',
            body: values[bodyIndex] || '',
          };
        });

        if (logs.length === 0) {
            throw new Error('No valid log entries found in the CSV file.');
        }

        onProcessFile(logs, file.name);

      } catch(e) {
          setError(e instanceof Error ? e.message : 'Failed to parse CSV file.');
          setFileName(null);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFile(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processFile(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }, [onProcessFile]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-8 text-center border-2 border-dashed border-gray-600 hover:border-cyan-500 transition-all duration-300">
       <h2 className="text-2xl font-bold text-white mb-2">Upload Log File</h2>
       <p className="text-gray-400 mb-6">Upload a CSV file with 'path' and 'body' columns to begin analysis.</p>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-500'
        }`}
      >
        <Icons.uploadCloud className="h-16 w-16 text-gray-500 mb-4" />
        <p className="text-gray-400">
          <label htmlFor="file-upload" className="font-semibold text-cyan-400 cursor-pointer hover:underline">
            Click to upload
          </label>
          {' '}or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">CSV files only</p>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv" />
      </div>
      
      {fileName && !error && <p className="mt-4 text-green-400">File uploaded successfully: {fileName}</p>}
      
      {error && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  );
};