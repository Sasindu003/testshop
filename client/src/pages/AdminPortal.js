import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAdminStatsApi } from '../api/adminApi';
import AdminAnalytics from '../epics/E4_AdminAndReports/AdminAnalytics';
import ManageProducts from '../epics/E2_ProductAndInventory/ManageProducts';
import CustomerList from '../epics/E1_CustomerManagement/CustomerList';
import EmployeeManager from '../epics/E4_AdminAndReports/EmployeeManager';
import CouponManager from '../epics/E4_AdminAndReports/CouponManager';
import AIRecommendationWidget from '../epics/E4_AdminAndReports/AIRecommendationWidget';
import { Shield, LayoutDashboard, Package, Users, Tag, Cpu, UserCheck } from 'lucide-react';

export default function AdminPortal() {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStatsApi(token).then(res => {
      if (res.success) setStats(res.stats);
    });
  }, [token]);

  return (
    <div className="space-y-8 animate-fade-in py-4 w-full text-slate-900">
      
      {/* Portal Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> StyleHub Admin & Staff Portal
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">Management Dashboard</h1>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto text-xs font-bold">
          {[
            { id: 'analytics', label: 'Analytics & AI', icon: LayoutDashboard },
            { id: 'products', label: 'Products & Stock', icon: Package },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'employees', label: 'Employees', icon: UserCheck },
            { id: 'coupons', label: 'Coupons Engine', icon: Tag }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendation Stylist Header Widget */}
      <AIRecommendationWidget />

      {/* Tab Contents */}
      {activeTab === 'analytics' && <AdminAnalytics stats={stats} />}
      {activeTab === 'products' && <ManageProducts />}
      {activeTab === 'customers' && <CustomerList />}
      {activeTab === 'employees' && <EmployeeManager />}
      {activeTab === 'coupons' && <CouponManager />}

    </div>
  );
}
