/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Database, 
  AlertTriangle, 
  CheckSquare, 
  FileText, 
  Activity, 
  Calendar, 
  GraduationCap, 
  BarChart3, 
  Settings, 
  Search, 
  Bell, 
  MessageSquare, 
  ChevronDown, 
  Plus, 
  FileDown,
  ChevronRight,
  Clock,
  Shield,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell as RechartsCell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface Risk {
  id: string;
  asset: string;
  threat: string;
  score: number;
  status: string;
  color: string;
}

interface ActivityItem {
  id: number;
  type: string;
  title: string;
  time: string;
}

interface ComplianceItem {
  label: string;
  value: number;
  color: string;
}

interface AuditItem {
  id: number;
  title: string;
  date: string;
  daysLeft: string;
  color: string;
}

interface Stats {
  riskScore: number;
  openIncidents: number;
  highIncidents: number;
  auditFindings: number;
  pendingFindings: number;
  soaProgress: number;
  soaControls: string;
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, hasSubmenu = false, onClick }: { icon: any, label: string, active?: boolean, hasSubmenu?: boolean, onClick?: () => void }) => (
  <div 
    className={cn("sidebar-item", active && "active")}
    onClick={onClick}
  >
    <Icon className="w-5 h-5" />
    <span className="flex-1 font-medium">{label}</span>
    {hasSubmenu && <ChevronDown className="w-4 h-4 opacity-50" />}
  </div>
);

const StatCard = ({ title, value, subValue, icon: Icon, colorClass, progress }: { title: string, value: string | number, subValue: string, icon: any, colorClass: string, progress?: number }) => (
  <div className="card flex flex-col gap-2">
    <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", colorClass)} />
        {title}
      </div>
      <Clock className="w-3 h-3 opacity-30" />
    </div>
    <div className="flex items-end gap-2 mt-1">
      <span className="text-2xl font-bold text-slate-800 tracking-tight">{value}</span>
      <span className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">{subValue}</span>
    </div>
    {progress !== undefined && (
      <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClass.replace('text-', 'bg-'))} 
        />
      </div>
    )}
  </div>
);

const RiskHeatmap = () => {
  const data = [
    { name: 'Critical', value: 4, color: '#ef4444' },
    { name: 'High', value: 12, color: '#f97316' },
    { name: 'Medium', value: 25, color: '#f59e0b' },
    { name: 'Low', value: 48, color: '#10b981' },
  ];

  return (
    <div className="card lg:col-span-1 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Risk Distribution</h3>
        <BarChart3 className="w-4 h-4 text-slate-300" />
      </div>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: -20, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <RechartsCell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-auto">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Page Components ---

const SamplePage = ({ title, description, icon: Icon }: { title: string, description: string, icon: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col gap-6"
  >
    <div className="flex justify-between items-end mb-2">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        </div>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20">
        <Plus className="w-4 h-4" />
        Add New
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card flex flex-col gap-4 group cursor-pointer hover:border-blue-200 transition-all">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-1">Sample {title} Item #{i}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">This is a placeholder description for the {title.toLowerCase()} module. You can manage and monitor your compliance requirements here.</p>
          </div>
          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last updated 2h ago</span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
      ))}
    </div>

    <div className="card p-0 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">Recent {title} Records</h3>
      </div>
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-300" />
        </div>
        <h4 className="font-bold text-slate-800 mb-1">No active records found</h4>
        <p className="text-sm text-slate-400 max-w-xs">Start by adding your first {title.toLowerCase()} record to begin tracking your ISMS progress.</p>
      </div>
    </div>
  </motion.div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [risks, setRisks] = useState<Risk[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [compliance, setCompliance] = useState<ComplianceItem[]>([]);
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [risksRes, activitiesRes, complianceRes, auditsRes, statsRes] = await Promise.all([
          fetch('/api/risks'),
          fetch('/api/activities'),
          fetch('/api/compliance'),
          fetch('/api/audits'),
          fetch('/api/stats')
        ]);

        const [risksData, activitiesData, complianceData, auditsData, statsData] = await Promise.all([
          risksRes.json(),
          activitiesRes.json(),
          complianceRes.json(),
          auditsRes.json(),
          statsRes.json()
        ]);

        setRisks(risksData);
        setActivities(activitiesData);
        setCompliance(complianceData);
        setAudits(auditsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'risk': return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case 'policy': return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'incident': return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'audit': return <Plus className="w-4 h-4 text-orange-600" />;
      case 'training': return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      default: return <CheckSquare className="w-4 h-4 text-blue-600" />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">ISMS Dashboard</h2>
                <p className="text-slate-500 text-sm">Realtime Overview of Your ISMS Implementation</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                  <Plus className="w-4 h-4" />
                  Quick Actions
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20">
                  <FileDown className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  Risk Score
                </div>
                <div className="flex-1 flex flex-col items-center justify-center pt-2">
                  <div className="relative w-32 h-20 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 50">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="transparent" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="transparent" stroke="url(#riskGradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={125.6 * (1 - (stats?.riskScore || 0) / 100)} />
                      <defs>
                        <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                      <span className="text-2xl font-bold text-slate-800">{stats?.riskScore}%</span>
                      <span className="text-[10px] font-bold text-amber-500 uppercase">Medium</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <StatCard 
                title="Open Incidents" 
                value={stats?.openIncidents || 0} 
                subValue={`High: ${stats?.highIncidents || 0}`} 
                icon={AlertTriangle} 
                colorClass="text-rose-600" 
              />
              
              <StatCard 
                title="Audit Findings" 
                value={stats?.auditFindings || 0} 
                subValue={`Pending: ${stats?.pendingFindings || 0}`} 
                icon={CheckSquare} 
                colorClass="text-orange-600" 
              />
              
              <StatCard 
                title="SoA Progress" 
                value={`${stats?.soaProgress || 0}%`} 
                subValue={stats?.soaControls || ''} 
                icon={ShieldCheck} 
                colorClass="text-emerald-600" 
                progress={stats?.soaProgress}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <RiskHeatmap />
              
              <div className="card flex flex-col gap-6">
                <h3 className="font-bold text-slate-800">Compliance Status</h3>
                <div className="space-y-6">
                  {compliance.map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", item.color)} />
                          <span className="text-sm font-medium text-slate-600">{item.label}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{item.value}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={cn("h-full rounded-full", item.color)} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Recent Activities</h3>
                  <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>
                </div>
                <div className="flex-1 space-y-4">
                  {activities.map((activity, idx) => (
                    <div key={activity.id} className="flex gap-4 relative">
                      {idx !== activities.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-100" />
                      )}
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 z-10">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{activity.title}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card p-0 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Top Risks</h3>
                  <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Risk ID</th>
                        <th className="px-6 py-4">Asset</th>
                        <th className="px-6 py-4">Threat</th>
                        <th className="px-6 py-4">Score</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {risks.map((risk) => (
                        <tr key={risk.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                          <td className="px-6 py-4 text-sm font-bold text-slate-800">{risk.id}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{risk.asset}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{risk.threat}</td>
                          <td className="px-6 py-4 text-sm font-bold text-rose-50">{risk.score}</td>
                          <td className="px-6 py-4">
                            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold", risk.color)}>
                              {risk.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card flex flex-col gap-6">
                <h3 className="font-bold text-slate-800">Upcoming Audits</h3>
                <div className="space-y-6">
                  {audits.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform", audit.color)}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{audit.title}</span>
                          <span className="text-xs text-slate-400 font-medium">{audit.date}</span>
                        </div>
                      </div>
                      <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold", audit.daysLeft.includes('3') ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500')}>
                        {audit.daysLeft}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
      case 'ISMS Setup': return <SamplePage title="ISMS Setup" description="Configure your Information Security Management System framework and scope." icon={ShieldCheck} />;
      case 'Assets': return <SamplePage title="Assets" description="Manage and track your organization's hardware, software, and information assets." icon={Database} />;
      case 'Risk Management': return <SamplePage title="Risk Management" description="Identify, evaluate, and mitigate potential security risks to your organization." icon={AlertTriangle} />;
      case 'Controls & SoA': return <SamplePage title="Controls & SoA" description="Define and monitor your Statement of Applicability and security controls." icon={CheckSquare} />;
      case 'Policies': return <SamplePage title="Policies" description="Create, review, and manage your organization's security policies and procedures." icon={FileText} />;
      case 'Incidents': return <SamplePage title="Incidents" description="Track and respond to security incidents and potential breaches." icon={Activity} />;
      case 'Audits': return <SamplePage title="Audits" description="Schedule and manage internal and external security audits." icon={Calendar} />;
      case 'Training': return <SamplePage title="Training" description="Monitor employee security awareness training and compliance." icon={GraduationCap} />;
      case 'Reports': return <SamplePage title="Reports" description="Generate comprehensive compliance and security posture reports." icon={BarChart3} />;
      case 'Admin Settings': return <SamplePage title="Admin Settings" description="Configure system-wide settings, user roles, and permissions." icon={Settings} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 font-medium">Loading ISMS Sentinel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-3 px-2 mb-8 cursor-pointer" onClick={() => setActiveTab('Dashboard')}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Shield className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-lg leading-tight">ISMS Sentinel</h1>
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Implementation Tool</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <SidebarItem icon={ShieldCheck} label="ISMS Setup" active={activeTab === 'ISMS Setup'} onClick={() => setActiveTab('ISMS Setup')} hasSubmenu />
          <SidebarItem icon={Database} label="Assets" active={activeTab === 'Assets'} onClick={() => setActiveTab('Assets')} hasSubmenu />
          <SidebarItem icon={AlertTriangle} label="Risk Management" active={activeTab === 'Risk Management'} onClick={() => setActiveTab('Risk Management')} hasSubmenu />
          <SidebarItem icon={CheckSquare} label="Controls & SoA" active={activeTab === 'Controls & SoA'} onClick={() => setActiveTab('Controls & SoA')} hasSubmenu />
          <SidebarItem icon={FileText} label="Policies" active={activeTab === 'Policies'} onClick={() => setActiveTab('Policies')} hasSubmenu />
          <SidebarItem icon={Activity} label="Incidents" active={activeTab === 'Incidents'} onClick={() => setActiveTab('Incidents')} hasSubmenu />
          <SidebarItem icon={Calendar} label="Audits" active={activeTab === 'Audits'} onClick={() => setActiveTab('Audits')} hasSubmenu />
          <SidebarItem icon={GraduationCap} label="Training" active={activeTab === 'Training'} onClick={() => setActiveTab('Training')} hasSubmenu />
          <SidebarItem icon={BarChart3} label="Reports" active={activeTab === 'Reports'} onClick={() => setActiveTab('Reports')} hasSubmenu />
          <SidebarItem icon={Settings} label="Admin Settings" active={activeTab === 'Admin Settings'} onClick={() => setActiveTab('Admin Settings')} hasSubmenu />
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="bg-slate-900/50 rounded-2xl p-4 relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-slate-400 text-xs font-medium mb-1">Compliance Score</div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-300 text-[10px] font-medium">ISO 27001</span>
                <div className="w-2 h-2 rounded-full bg-orange-500 ml-2" />
                <span className="text-slate-300 text-[10px] font-medium">DPDPA</span>
              </div>
              <div className="flex justify-center">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - (stats?.riskScore || 0) / 100)} strokeLinecap="round" transform="rotate(-90 50 50)" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{stats?.riskScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 w-1/3">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">5</span>
              </button>
              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all">
                <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-800">Hi, Admin</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CISO</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
