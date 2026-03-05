/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  LogOut
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

interface Asset {
  id: string;
  name: string;
  owner: string;
  type: string;
  data_classification: string;
  criticality: string;
  created_at: string;
}

interface Risk {
  id: string;
  asset_id: string;
  threat: string;
  vulnerability: string;
  likelihood: number;
  impact: number;
  risk_score: number;
  status: string;
  treatment: string;
}

interface Control {
  control_id: string;
  control_name: string;
  applicable: string;
  implemented: string;
  evidence: string;
  owner: string;
}

interface Policy {
  id: string;
  name: string;
  version: string;
  owner: string;
  status: string;
  approved_date: string;
}

interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  reported_by: string;
  date: string;
}

interface Audit {
  id: string;
  audit_name: string;
  type: string;
  scheduled_date: string;
  status: string;
  auditor: string;
}

interface Training {
  id: number;
  employee: string;
  course: string;
  status: string;
  completion_date: string;
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

const AuthPage = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const validatePassword = (pass: string) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (pass.length < minLength) return "Password must be at least 8 characters long.";
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return "Password must contain uppercase, lowercase, numbers, and special characters.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Login failed");
        
        onLogin(data.user);
      } else {
        // Signup
        const passError = validatePassword(formData.password);
        if (passError) throw new Error(passError);

        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, fullName: formData.fullName, password: formData.password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to send verification code");

        setPreviewUrl(data.previewUrl || null);
        setIsVerifying(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: verificationCode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Verification failed");

      // After verification, log in
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const loginData = await loginResponse.json();
      onLogin(loginData.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100"
        >
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/20 mb-6">
              <Shield className="text-white w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Verify Email</h1>
            <p className="text-slate-500 text-sm font-medium text-center">
              We've sent a 6-digit verification code to <span className="text-blue-600 font-bold">{formData.email}</span>.
            </p>
            {previewUrl && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">Demo: View Sent Email</p>
                <a 
                  href={previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-700 font-bold underline hover:text-blue-800"
                >
                  Click here to view the verification email
                </a>
              </div>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleVerify}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verification Code</label>
              <input 
                type="text" 
                maxLength={6}
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full text-center text-3xl tracking-[0.5em] py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-black text-slate-800"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium text-center mt-2">
                For this demo, please use code: <span className="text-blue-600 font-bold">123456</span>
              </p>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify & Complete'}
              {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="flex flex-col gap-4 items-center">
              <button 
                type="button"
                onClick={() => {
                  setError(null);
                  console.log("Verification code resent to:", formData.email);
                  alert("Verification code resent!");
                }}
                className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline transition-all"
              >
                Resend Code
              </button>

              <button 
                type="button"
                onClick={() => setIsVerifying(false)}
                className="text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors"
              >
                Back to Signup
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/20 mb-6">
            <Shield className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-500 text-sm font-medium text-center">
            {isLogin 
              ? 'Enter your credentials to access the ISMS Sentinel dashboard.' 
              : 'Join ISMS Sentinel to start managing your security compliance.'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-800"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-800"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-[10px] text-slate-400 font-medium px-1 leading-relaxed">
                Passwords must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
              </p>
            )}
            {!isLogin && formData.password && (
              <div className="px-1 pt-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Security Strength</span>
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", validatePassword(formData.password) ? "text-rose-500" : "text-emerald-500")}>
                    {validatePassword(formData.password) ? "Weak" : "Strong"}
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-500", validatePassword(formData.password) ? "w-1/3 bg-rose-500" : "w-full bg-emerald-500")} />
                </div>
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="flex items-start gap-3 px-1">
              <div className="relative flex items-center mt-1">
                <input 
                  type="checkbox" 
                  id="consent"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-200 bg-slate-50 transition-all checked:border-blue-600 checked:bg-blue-600"
                  required
                />
                <CheckSquare className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <label htmlFor="consent" className="text-xs text-slate-500 leading-relaxed cursor-pointer font-medium">
                I agree to the <span className="text-blue-600 font-bold hover:underline">Terms of Service</span> and <span className="text-blue-600 font-bold hover:underline">Privacy Policy</span>, and consent to data processing for ISMS compliance.
              </label>
            </div>
          )}

          <button 
            type="submit"
            disabled={(!isLogin && !agreed) || isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Send Verification Code')}
            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="ml-2 text-blue-600 font-black hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

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

// --- Module Page Components ---

const ModulePage = <T extends Record<string, any>>({ 
  title, 
  description, 
  icon: Icon, 
  endpoint, 
  columns,
  idField = 'id'
}: { 
  title: string, 
  description: string, 
  icon: any, 
  endpoint: string,
  columns: { key: keyof T, label: string }[],
  idField?: keyof T
}) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${endpoint}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const url = editingItem ? `/api/${endpoint}/${editingItem[idField as string]}` : `/api/${endpoint}`;
      const method = editingItem ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      setShowForm(false);
      setEditingItem(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
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
        <button 
          onClick={() => { setEditingItem(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingItem ? 'Edit' : 'Add New'} {title}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {columns.map(col => (
                  <div key={col.key as string} className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{col.label}</label>
                    <input 
                      name={col.key as string}
                      defaultValue={editingItem ? editingItem[col.key as string] : ''}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">Save Record</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                {columns.map(col => (
                  <th key={col.key as string} className="px-6 py-4">{col.label}</th>
                ))}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-400 text-sm italic">Loading records...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-400 text-sm italic">No records found.</td>
                </tr>
              ) : data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  {columns.map(col => (
                    <td key={col.key as string} className="px-6 py-4 text-sm text-slate-600">
                      {String(item[col.key as string])}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingItem(item); setShowForm(true); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item[idField as string])}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string, fullName: string } | null>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [risks, setRisks] = useState<Risk[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [compliance, setCompliance] = useState<ComplianceItem[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    
    setIsDownloading(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200, // Force a consistent width for capture
        onclone: (clonedDoc) => {
          // html2canvas 1.4.1 does not support modern color functions like oklch() or oklab() used in Tailwind 4.
          // It crashes when parsing stylesheets containing these functions.
          // We sanitize all style tags in the cloned document first.
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach(tag => {
            if (tag.textContent && !tag.textContent.includes('isms-report-container')) {
              // Replace oklch/oklab with a safe fallback to prevent parser crash
              tag.textContent = tag.textContent
                .replace(/oklch\([^)]+\)/g, '#3b82f6')
                .replace(/oklab\([^)]+\)/g, '#3b82f6');
            }
          });

          const clonedElement = clonedDoc.querySelector('.isms-report-container') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.width = '1200px';
            clonedElement.style.height = 'auto';
            clonedElement.style.overflow = 'visible';
          }
          
          // We must traverse the cloned document and replace any unsupported colors with safe fallbacks.
          // ALSO: html2canvas has severe bugs with letter-spacing (tracking). We must normalize it.
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            
            // Normalize letter-spacing and word-spacing to prevent text bunching/overlapping in PDF
            el.style.letterSpacing = 'normal';
            el.style.wordSpacing = 'normal';
            
            // html2canvas often miscalculates widths for extremely heavy fonts (900+)
            // We cap it at 700 for the PDF generation to ensure better spacing
            const fontWeight = clonedDoc.defaultView?.getComputedStyle(el).fontWeight;
            if (fontWeight && (parseInt(fontWeight) > 700 || fontWeight === 'black')) {
              el.style.fontWeight = '700';
            }
            
            const style = clonedDoc.defaultView?.getComputedStyle(el);
            if (style) {
              // Check common color properties including box-shadow
              ['color', 'background-color', 'border-color', 'fill', 'stroke', 'box-shadow'].forEach(prop => {
                const val = style.getPropertyValue(prop);
                // Check for unsupported color functions
                if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('lch') || val.includes('lab'))) {
                  // Determine a safe fallback based on the property and element
                  let fallback = '#1e293b'; // Default dark slate
                  
                  if (prop === 'box-shadow') {
                    fallback = 'none'; // Shadows are often the culprit and hard to map, so we remove them for the PDF
                  } else if (prop === 'background-color') {
                    if (el.classList.contains('bg-slate-900')) fallback = '#0f172a';
                    else if (el.classList.contains('bg-blue-600')) fallback = '#2563eb';
                    else if (el.classList.contains('bg-emerald-50')) fallback = '#ecfdf5';
                    else if (el.classList.contains('bg-blue-50')) fallback = '#eff6ff';
                    else if (el.classList.contains('bg-slate-50')) fallback = '#f8fafc';
                    else if (el.classList.contains('bg-white')) fallback = '#ffffff';
                    else fallback = '#ffffff';
                  } else if (prop === 'color') {
                    if (el.classList.contains('text-white')) fallback = '#ffffff';
                    else if (el.classList.contains('text-blue-600')) fallback = '#2563eb';
                    else if (el.classList.contains('text-emerald-600')) fallback = '#059669';
                    else if (el.classList.contains('text-rose-400')) fallback = '#fb7185';
                    else if (el.classList.contains('text-slate-400')) fallback = '#94a3b8';
                    else if (el.classList.contains('text-slate-500')) fallback = '#64748b';
                    else if (el.classList.contains('text-slate-800')) fallback = '#1e293b';
                  }
                  el.style.setProperty(prop, fallback, 'important');
                }
              });
            }
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`ISMS-Sentinel-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

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
  }, [activeTab]); // Refetch when switching back to dashboard

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'asset': return <Database className="w-4 h-4 text-blue-600" />;
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
                <button 
                  onClick={() => setShowReport(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                >
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
                  Compliance Score
                </div>
                <div className="flex-1 flex flex-col items-center justify-center pt-2">
                  <div className="relative w-32 h-20 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 50">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="transparent" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="transparent" stroke="url(#riskGradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={125.6 * (1 - (stats?.riskScore || 0) / 100)} />
                      <defs>
                        <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                      <span className="text-2xl font-bold text-slate-800">{stats?.riskScore}%</span>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">Healthy</span>
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
                        <th className="px-6 py-4">Threat</th>
                        <th className="px-6 py-4">Score</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {risks.slice(0, 5).map((risk) => (
                        <tr key={risk.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                          <td className="px-6 py-4 text-sm font-bold text-slate-800">{risk.id}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{risk.threat}</td>
                          <td className="px-6 py-4 text-sm font-bold text-rose-500">{risk.risk_score}</td>
                          <td className="px-6 py-4">
                            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold", 
                              risk.status === 'High' ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'
                            )}>
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
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform bg-blue-500")}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{audit.audit_name}</span>
                          <span className="text-xs text-slate-400 font-medium">{audit.scheduled_date}</span>
                        </div>
                      </div>
                      <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500")}>
                        {audit.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
      case 'Assets': 
        return <ModulePage<Asset> 
          title="Asset Register" 
          description="Manage and track your organization's hardware, software, and information assets." 
          icon={Database} 
          endpoint="assets"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'owner', label: 'Owner' },
            { key: 'type', label: 'Type' },
            { key: 'data_classification', label: 'Classification' },
            { key: 'criticality', label: 'Criticality' }
          ]}
        />;
      case 'Risk Management': 
        return <ModulePage<Risk> 
          title="Risk Assessment" 
          description="Identify, evaluate, and mitigate potential security risks to your organization." 
          icon={AlertTriangle} 
          endpoint="risks"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'asset_id', label: 'Asset ID' },
            { key: 'threat', label: 'Threat' },
            { key: 'likelihood', label: 'Likelihood' },
            { key: 'impact', label: 'Impact' },
            { key: 'risk_score', label: 'Score' },
            { key: 'status', label: 'Status' }
          ]}
        />;
      case 'Controls & SoA': 
        return <ModulePage<Control> 
          title="Controls & SoA" 
          description="Define and monitor your Statement of Applicability and security controls." 
          icon={CheckSquare} 
          endpoint="controls"
          idField="control_id"
          columns={[
            { key: 'control_id', label: 'Control ID' },
            { key: 'control_name', label: 'Name' },
            { key: 'applicable', label: 'Applicable' },
            { key: 'implemented', label: 'Implemented' },
            { key: 'owner', label: 'Owner' }
          ]}
        />;
      case 'Policies': 
        return <ModulePage<Policy> 
          title="Policy Management" 
          description="Create, review, and manage your organization's security policies." 
          icon={FileText} 
          endpoint="policies"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'version', label: 'Version' },
            { key: 'owner', label: 'Owner' },
            { key: 'status', label: 'Status' },
            { key: 'approved_date', label: 'Approved Date' }
          ]}
        />;
      case 'Incidents': 
        return <ModulePage<Incident> 
          title="Incident Management" 
          description="Track and respond to security incidents and potential breaches." 
          icon={Activity} 
          endpoint="incidents"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'title', label: 'Title' },
            { key: 'severity', label: 'Severity' },
            { key: 'status', label: 'Status' },
            { key: 'reported_by', label: 'Reported By' },
            { key: 'date', label: 'Date' }
          ]}
        />;
      case 'Audits': 
        return <ModulePage<Audit> 
          title="Audit Management" 
          description="Schedule and manage internal and external security audits." 
          icon={Calendar} 
          endpoint="audits"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'audit_name', label: 'Audit Name' },
            { key: 'type', label: 'Type' },
            { key: 'scheduled_date', label: 'Scheduled Date' },
            { key: 'status', label: 'Status' },
            { key: 'auditor', label: 'Auditor' }
          ]}
        />;
      case 'Training': 
        return <ModulePage<Training> 
          title="Training Module" 
          description="Monitor employee security awareness training and compliance." 
          icon={GraduationCap} 
          endpoint="training"
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'course', label: 'Course' },
            { key: 'status', label: 'Status' },
            { key: 'completion_date', label: 'Completion Date' }
          ]}
        />;
      case 'ISMS Setup': return <SamplePage title="ISMS Setup" description="Configure your Information Security Management System framework and scope." icon={ShieldCheck} />;
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
    <>
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AuthPage onLogin={(userData) => {
              setUser(userData);
              setIsAuthenticated(true);
            }} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="flex h-screen overflow-hidden bg-[#F8FAFC]"
          >
            {/* Report Modal */}
            <AnimatePresence>
              {showReport && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 md:p-8">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                  >
                    {/* Report Header */}
                    <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                          <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-slate-800 tracking-tight">ISMS SENTINEL</h2>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Security Compliance Report</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-800">Generated on {new Date().toLocaleDateString()}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ref: ISMS-SR-2024-001</div>
                        <button 
                          onClick={() => setShowReport(false)}
                          className="mt-4 p-2 hover:bg-slate-200 rounded-full transition-colors"
                        >
                          <Plus className="w-5 h-5 rotate-45 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* Report Body */}
                    <div ref={reportRef} className="flex-1 overflow-y-auto p-8 md:p-16 space-y-16 bg-white isms-report-container">
                      {/* Fallback styles for html2canvas (it doesn't support oklch) */}
                      <style dangerouslySetInnerHTML={{ __html: `
                        .isms-report-container,
                        .isms-report-container * {
                          --tw-bg-opacity: 1 !important;
                          --tw-text-opacity: 1 !important;
                          --tw-border-opacity: 1 !important;
                        }
                        /* Override common oklch variables with hex for the PDF generator */
                        .isms-report-container {
                          --color-blue-600: #2563eb !important;
                          --color-blue-50: #eff6ff !important;
                          --color-slate-900: #0f172a !important;
                          --color-slate-800: #1e293b !important;
                          --color-slate-500: #64748b !important;
                          --color-slate-400: #94a3b8 !important;
                          --color-slate-300: #cbd5e1 !important;
                          --color-slate-200: #e2e8f0 !important;
                          --color-slate-100: #f1f5f9 !important;
                          --color-slate-50: #f8fafc !important;
                          --color-emerald-600: #059669 !important;
                          --color-emerald-50: #ecfdf5 !important;
                          --color-rose-500: #f43f5e !important;
                          --color-rose-400: #fb7185 !important;
                        }
                      `}} />

                      {/* Report Header */}
                      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <Shield className="text-white w-7 h-7" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">ISMS SENTINEL</h2>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Security Compliance Report</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Generated On</div>
                          <div className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Confidential • Internal Use</div>
                        </div>
                      </div>

                      {/* Executive Summary */}
                      <section>
                        <div className="flex items-center gap-4 mb-8">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] whitespace-nowrap">01. Executive Summary</h3>
                          <div className="h-px flex-1 bg-slate-100" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                            <h4 className="text-3xl font-black text-slate-900 leading-tight">Current Security Posture</h4>
                            <p className="text-slate-500 text-base leading-relaxed">
                              The organization's current ISMS implementation shows a robust compliance score of <span className="text-blue-600 font-black">{stats?.riskScore}%</span>. 
                              Critical assets are identified and monitored, with active risk treatment plans in place for all high-priority threats.
                            </p>
                            <div className="flex gap-4">
                              <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">ISO 27001 Ready</div>
                              <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">Audited</div>
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-[32px] p-8 flex flex-col justify-center border border-slate-100">
                            <div className="flex justify-between items-end mb-6">
                              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Overall Compliance</span>
                              <span className="text-5xl font-black text-blue-600">{stats?.riskScore}%</span>
                            </div>
                            <div className="w-full bg-white rounded-full h-4 overflow-hidden border border-slate-200 p-1">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stats?.riskScore}%` }}
                                className="h-full bg-blue-600 rounded-full shadow-sm"
                              />
                            </div>
                            <p className="mt-4 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">Target: 100% Compliance</p>
                          </div>
                        </div>
                      </section>

                      {/* Compliance Breakdown */}
                      <section>
                        <div className="flex items-center gap-4 mb-10">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] whitespace-nowrap">02. Compliance Breakdown</h3>
                          <div className="h-px flex-1 bg-slate-100" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {compliance.map((item) => (
                            <div key={item.label} className="bg-white border-2 border-slate-50 rounded-3xl p-6 text-center shadow-sm">
                              <div className="text-3xl font-black text-slate-900 mb-2">{item.value}%</div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">{item.label}</div>
                              <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                                <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Risk Landscape */}
                      <section>
                        <div className="flex items-center gap-4 mb-10">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] whitespace-nowrap">03. Risk Landscape</h3>
                          <div className="h-px flex-1 bg-slate-100" />
                        </div>
                        <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl shadow-slate-900/20">
                          <div className="flex justify-between items-center mb-10">
                            <div>
                              <h4 className="text-2xl font-black mb-1">Top Priority Risks</h4>
                              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Requires Immediate Attention</p>
                            </div>
                            <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center">
                              <AlertTriangle className="w-6 h-6 text-rose-500" />
                            </div>
                          </div>
                          <div className="space-y-6">
                            {risks.slice(0, 3).map((risk) => (
                              <div key={risk.id} className="group flex items-center justify-between py-5 border-b border-white/5 last:border-0">
                                <div>
                                  <div className="text-lg font-bold mb-1 group-hover:text-blue-400 transition-colors">{risk.threat}</div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{risk.id}</span>
                                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                                    <span className="text-[10px] text-rose-400 uppercase font-black tracking-widest">{risk.status}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <div className="text-3xl font-black text-rose-400">{risk.risk_score}</div>
                                  <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Risk Score</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>

                      {/* Footer Note */}
                      <div className="pt-12 border-t border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-300" />
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ISMS Sentinel v1.0</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                          Confidential • Internal Use Only
                        </p>
                      </div>
                    </div>

                    {/* Report Actions */}
                    <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
                      <button 
                        onClick={() => setShowReport(false)}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
                      >
                        Close
                      </button>
                      <button 
                        onClick={handleDownloadReport}
                        disabled={isDownloading}
                        className={cn(
                          "px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2",
                          isDownloading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isDownloading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FileDown className="w-4 h-4" />
                        )}
                        {isDownloading ? 'Generating...' : 'Download PDF'}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

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
                
                <div className="mt-6 pt-4 border-t border-slate-800/50 text-center">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">Developed By</p>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 text-blue-400 font-black text-xs">
                    NK
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Header */}
              <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-4 w-1/3">
                  <div className="relative w-full max-md">
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

                  <div className="flex items-center gap-3 cursor-pointer group relative">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm border-2 border-transparent group-hover:border-blue-400 transition-all shadow-lg shadow-blue-900/20">
                      {user?.fullName ? getInitials(user.fullName) : 'NA'}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-slate-800">Hi, {user?.fullName || 'Admin'}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user?.email === 'admin@sentinel.com' ? 'CISO' : 'Security Officer'}</span>
                    </div>

                    {/* Simple Dropdown for Logout */}
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 overflow-hidden">
                      <button 
                        onClick={() => setIsAuthenticated(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
