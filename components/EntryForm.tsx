import React, { useState, useEffect } from 'react';
import { InstitutionType, TeachingRecord } from '../types';
import { Save, X, Trash2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface EntryFormProps {
  initialData?: TeachingRecord | null;
  onSave: (record: Omit<TeachingRecord, 'id' | 'timestamp'> & { id?: string }) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ initialData, onSave, onCancel, onDelete }) => {
  const isEdit = !!initialData;
  const [step, setStep] = useState<number>(1);
  
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [institution, setInstitution] = useState<InstitutionType>(InstitutionType.DI_LE_BEI_BEI);
  const [customInstitution, setCustomInstitution] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setInstitution(initialData.institution);
      setCustomInstitution(initialData.customInstitution || '');
      setAmount(initialData.amount.toString());
    }
  }, [initialData]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!amount || isNaN(Number(amount))) {
      alert('请输入有效的金额');
      return;
    }

    if (institution === InstitutionType.OTHER && !customInstitution.trim()) {
      alert('请输入机构名称');
      return;
    }

    onSave({
      id: initialData?.id,
      date,
      institution,
      customInstitution: institution === InstitutionType.OTHER ? customInstitution : undefined,
      amount: Number(amount),
    });
  };

  // Wizard Navigation
  const nextStep = () => {
    if (step === 2 && institution === InstitutionType.OTHER && !customInstitution.trim()) {
       return; // Validate custom institution
    }
    setStep(s => s + 1);
  };
  
  const prevStep = () => setStep(s => s - 1);

  // Render Edit Mode (Single Page)
  if (isEdit) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto mt-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">修改打卡记录</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">日期</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">机构</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(InstitutionType).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setInstitution(type)}
                  className={`px-2 py-2 text-sm rounded-lg border transition-all truncate ${
                    institution === type
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {institution === InstitutionType.OTHER && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">机构名称</label>
              <input
                type="text"
                value={customInstitution}
                onChange={(e) => setCustomInstitution(e.target.value)}
                placeholder="例如: 私教课"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">金额 (元)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">¥</span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              保存修改
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if(window.confirm('确定要删除这条记录吗？')) onDelete(initialData.id);
                }}
                className="w-full bg-white border border-red-200 text-red-500 hover:bg-red-50 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Trash2 size={20} />
                删除记录
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // Render Wizard Mode (Add)
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto mt-4 min-h-[400px] flex flex-col relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
            <div 
                className="h-full bg-rose-500 transition-all duration-300 ease-out" 
                style={{ width: `${(step / 3) * 100}%` }}
            />
        </div>

        {/* Close Button */}
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
            <X size={24} />
        </button>

        <div className="flex-1 flex flex-col justify-center">
            {/* Step 1: Date */}
            {step === 1 && (
                <div className="animate-in slide-in-from-right-8 duration-300 fade-in">
                    <h2 className="text-2xl font-black text-slate-800 mb-2">选择日期</h2>
                    <p className="text-slate-400 mb-8">今天上课了吗？</p>
                    
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full text-center text-xl font-bold p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-rose-500 focus:bg-white outline-none transition-all text-slate-700"
                    />
                </div>
            )}

            {/* Step 2: Institution */}
            {step === 2 && (
                <div className="animate-in slide-in-from-right-8 duration-300 fade-in">
                    <h2 className="text-2xl font-black text-slate-800 mb-2">选择机构</h2>
                    <p className="text-slate-400 mb-8">在哪里上课？</p>
                    
                    <div className="flex flex-col gap-3">
                        {Object.values(InstitutionType).map((type) => (
                            <button
                                key={type}
                                onClick={() => setInstitution(type)}
                                className={`p-4 rounded-xl border-2 text-left font-bold text-lg transition-all flex justify-between items-center ${
                                    institution === type
                                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-md'
                                    : 'border-slate-100 bg-white text-slate-600 hover:border-rose-200 hover:bg-slate-50'
                                }`}
                            >
                                {type}
                                {institution === type && <CheckCircle2 size={20} className="text-rose-500" />}
                            </button>
                        ))}
                    </div>
                    
                    {institution === InstitutionType.OTHER && (
                        <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
                            <input
                                type="text"
                                autoFocus
                                value={customInstitution}
                                onChange={(e) => setCustomInstitution(e.target.value)}
                                placeholder="请输入机构名称"
                                className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-rose-500 outline-none transition-all"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Amount */}
            {step === 3 && (
                <div className="animate-in slide-in-from-right-8 duration-300 fade-in">
                    <h2 className="text-2xl font-black text-slate-800 mb-2">输入金额</h2>
                    <p className="text-slate-400 mb-8">本次课程收入多少？</p>
                    
                    <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl text-slate-300 font-light">¥</span>
                        <input
                            type="number"
                            autoFocus
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full pl-16 pr-6 py-6 text-4xl font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-rose-500 focus:bg-white outline-none transition-all text-slate-800 placeholder-slate-200"
                        />
                    </div>
                </div>
            )}
        </div>

        {/* Navigation Actions */}
        <div className="mt-8 flex gap-3">
            {step > 1 && (
                <button
                    onClick={prevStep}
                    className="flex-none w-14 h-14 rounded-xl border-2 border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 flex items-center justify-center transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
            )}
            
            {step < 3 ? (
                <button
                    onClick={nextStep}
                    disabled={step === 2 && institution === InstitutionType.OTHER && !customInstitution.trim()}
                    className="flex-1 bg-slate-900 text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-slate-200 flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    下一步 <ArrowRight size={20} />
                </button>
            ) : (
                <button
                    onClick={() => handleSubmit()}
                    disabled={!amount}
                    className="flex-1 bg-rose-600 text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-rose-200 flex items-center justify-center gap-2 hover:bg-rose-700 disabled:opacity-50 transition-all active:scale-95"
                >
                    确认打卡 <CheckCircle2 size={20} />
                </button>
            )}
        </div>
    </div>
  );
};

export default EntryForm;