import React, { useState, useEffect } from 'react';
import { TeachingRecord, ViewMode } from './types';
import { loadRecords, saveRecords } from './services/storage';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';

const App: React.FC = () => {
  // Fix: Use lazy initialization to load records immediately. 
  // This prevents the app from starting with an empty array and overwriting your saved data.
  const [records, setRecords] = useState<TeachingRecord[]>(() => loadRecords());
  const [view, setView] = useState<ViewMode>('dashboard');
  const [editingRecord, setEditingRecord] = useState<TeachingRecord | null>(null);

  // Save data whenever it changes
  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const handleAddRecord = (data: Omit<TeachingRecord, 'id' | 'timestamp'>) => {
    const newRecord: TeachingRecord = {
      ...data,
      // Use a robust ID generator compatible with all environments
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      timestamp: Date.now(),
    };
    setRecords((prev) => [newRecord, ...prev]);
    setView('dashboard');
  };

  const handleUpdateRecord = (data: Omit<TeachingRecord, 'id' | 'timestamp'> & { id?: string }) => {
    if (!data.id) return;
    
    setRecords((prev) => 
      prev.map((rec) => 
        rec.id === data.id 
          ? { ...rec, ...data, timestamp: Date.now() } // update data and touch timestamp
          : rec
      )
    );
    setView('dashboard');
    setEditingRecord(null);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setView('dashboard');
    setEditingRecord(null);
  };

  const navigateToAdd = () => {
    setEditingRecord(null);
    setView('add');
  };

  const navigateToEdit = (record: TeachingRecord) => {
    setEditingRecord(record);
    setView('edit');
  };

  const navigateHome = () => {
    setView('dashboard');
    setEditingRecord(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto relative shadow-2xl shadow-slate-200">
      {/* Header */}
      <header className="bg-white pt-10 pb-4 px-6 border-b border-slate-100">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-600">
          刘芷溪舞蹈教学打卡
        </h1>
        <p className="text-xs text-slate-400 mt-1">记录每一份耕耘与收获</p>
      </header>

      <main>
        {view === 'dashboard' && (
          <Dashboard 
            records={records} 
            onAdd={navigateToAdd}
            onEdit={navigateToEdit}
          />
        )}

        {(view === 'add' || view === 'edit') && (
          <div className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <EntryForm
              initialData={editingRecord}
              onSave={view === 'add' ? handleAddRecord : handleUpdateRecord}
              onCancel={navigateHome}
              onDelete={view === 'edit' ? handleDeleteRecord : undefined}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;