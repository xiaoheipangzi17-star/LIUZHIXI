import React, { useMemo, useState } from 'react';
import { TeachingRecord, InstitutionType } from '../types';
import { PlusCircle, Edit2, Wallet, Calendar, PieChart, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  records: TeachingRecord[];
  onAdd: () => void;
  onEdit: (record: TeachingRecord) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ records, onAdd, onEdit }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [showOverview, setShowOverview] = useState(false);

  // Filter records by selected month
  const monthlyRecords = useMemo(() => {
    return records
      .filter((r) => r.date.startsWith(selectedMonth))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, selectedMonth]);

  // Calculate stats
  const totalIncome = useMemo(() => {
    return monthlyRecords.reduce((sum, record) => sum + record.amount, 0);
  }, [monthlyRecords]);

  // Data for Chart and Overview (Group by Institution/Custom Name)
  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    monthlyRecords.forEach(r => {
      // Use custom name for 'Other' type to distinguish different sources
      const name = r.institution === InstitutionType.OTHER 
        ? (r.customInstitution || '其他') 
        : r.institution;
      data[name] = (data[name] || 0) + r.amount;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyRecords]);

  const COLORS = ['#f43f5e', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="pb-10 relative">
      {/* Date Picker Filter & Overview Button */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-700">
            <Calendar size={20} className="text-rose-500" />
            <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="font-semibold bg-transparent outline-none text-slate-800 w-32"
            />
        </div>
        <button
          onClick={() => setShowOverview(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 active:scale-95 transition-all"
        >
          <PieChart size={16} />
          总览
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Main Check-in Button */}
        <button
            onClick={onAdd}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-slate-800"
        >
            <PlusCircle size={28} className="text-rose-400" />
            <span className="text-xl font-bold tracking-wide">教学打卡</span>
        </button>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-rose-200">
          <div className="flex items-center gap-2 opacity-90 mb-2">
            <Wallet size={20} />
            <span className="font-medium text-sm">本月总收入</span>
          </div>
          <div className="text-4xl font-bold tracking-tight">
            ¥ {totalIncome.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Chart */}
        {monthlyRecords.length > 0 && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">收入构成</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Records List */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3 px-1 flex justify-between items-center">
            <span>打卡记录</span>
            <span className="text-xs text-slate-400 font-normal">{monthlyRecords.length} 条</span>
          </h3>
          <div className="space-y-3">
            {monthlyRecords.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                本月暂无打卡记录
              </div>
            ) : (
              monthlyRecords.map((record) => (
                <div 
                  key={record.id} 
                  onClick={() => onEdit(record)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center active:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-slate-800 text-lg mb-1 group-hover:text-rose-600 transition-colors">
                      {record.institution === InstitutionType.OTHER 
                        ? record.customInstitution 
                        : record.institution}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{record.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-rose-600 text-lg">
                      +{record.amount.toLocaleString()}
                    </span>
                    <Edit2 size={16} className="text-slate-300 group-hover:text-rose-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Overview Modal */}
      {showOverview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowOverview(false)}
          />
          
          {/* Modal Content */}
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 relative z-10 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 mb-4 sm:mb-0">
            <button 
              onClick={() => setShowOverview(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PieChart className="text-rose-500" />
              本月收入总览
            </h3>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {chartData.length === 0 ? (
                 <p className="text-slate-400 text-center py-4">暂无数据</p>
              ) : (
                chartData.map((item, index) => (
                  <div key={item.name} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 text-lg">¥ {item.value.toLocaleString()}</span>
                  </div>
                ))
              )}
              
              <div className="flex justify-between items-center p-4 mt-4 border-t-2 border-dashed border-slate-100">
                  <span className="font-bold text-slate-500">总计</span>
                  <span className="font-black text-2xl text-rose-600">¥ {totalIncome.toLocaleString()}</span>
              </div>
            </div>
            
            <button 
                onClick={() => setShowOverview(false)}
                className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-bold active:scale-95 transition-all"
            >
                关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;