import React, { useState } from 'react';
import {
  BarChart2, Bot, CalendarDays, Trophy,
  Mail, Lock, CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotification } from '../hooks/useNotification';

const FEATURES = [
  { icon: BarChart2, label: 'Аналитика оценок',    desc: 'Динамика и прогнозы успеваемости' },
  { icon: Bot,       label: 'AI-тьютор',           desc: 'Персональные рекомендации' },
  { icon: CalendarDays, label: 'Умное расписание', desc: 'Без конфликтов и накладок' },
  { icon: Trophy,    label: 'Достижения',          desc: 'Геймификация и лидерборды' },
];

const ACCOUNTS = [
  { email: 'ayman@school.kz',             name: 'Айман Смагулов',  role: 'Ученик · 10A',          seed: 'ayman',  accent: '#3b82f6' },
  { email: 'daria@school.kz',             name: 'Дарья Иванова',   role: 'Учитель · Математика',  seed: 'daria',  accent: '#8b5cf6' },
  { email: 'zhanna.smagulova@example.kz', name: 'Жанна Смагулова', role: 'Родитель',               seed: 'zhanna', accent: '#10b981' },
  { email: 'admin@school.kz',             name: 'Администратор',   role: 'Администрация',          seed: 'admin',  accent: '#f59e0b' },
];

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState(null);
  const { login }          = useAuthStore();
  const { success, error } = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    try {
      await login(identifier.trim(), password || 'password');
      success('Добро пожаловать!');
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const pick = (acc) => {
    setIdentifier(acc.email);
    setPassword('password');
    setSelected(acc.email);
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a]">

      {/* ── LEFT PANEL ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative overflow-hidden">

        {/* subtle grid bg */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* glow blobs */}
        <div className="absolute top-[-120px] left-[-80px] w-[480px] h-[480px] rounded-full blur-[120px] opacity-30"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] right-[-60px] w-[360px] h-[360px] rounded-full blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            A
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Aqbobek Lyceum</p>
            <p className="text-white/40 text-xs">Школьный портал</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10">

          <h1 className="text-5xl font-black text-white leading-[1.15] mb-5">
            Единый<br />
            <span style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }}>
              школьный
            </span><br />
            портал
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-xs mb-10">
            Управляйте успеваемостью, расписанием и достижениями в одном месте.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label}
                className="group p-4 rounded-2xl border border-white/[0.07] bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-200">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                  <Icon size={16} className="text-blue-300" />
                </div>
                <p className="text-white text-sm font-semibold leading-tight">{label}</p>
                <p className="text-white/40 text-xs mt-1 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-xs">© 2026 Aqbobek Lyceum, ITshechka team</p>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>A</div>
            <p className="font-bold text-gray-900">Aqbobek Lyceum</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Войти в аккаунт</h2>
          <p className="text-sm text-gray-400 mb-7">Выберите тестовый профиль или введите данные</p>

          {/* Account picker */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {ACCOUNTS.map(acc => {
              const active = selected === acc.email;
              return (
                <button
                  key={acc.email}
                  onClick={() => pick(acc)}
                  className="relative flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all duration-150 border"
                  style={{
                    borderColor: active ? acc.accent : '#f1f5f9',
                    background:  active ? `${acc.accent}10` : '#f8fafc',
                    boxShadow:   active ? `0 0 0 1px ${acc.accent}40` : 'none',
                  }}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${acc.seed}`}
                    alt=""
                    className="w-9 h-9 rounded-xl flex-shrink-0 bg-white"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 truncate">{acc.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{acc.role}</p>
                  </div>
                  {active && (
                    <CheckCircle2 size={14} className="absolute top-2 right-2 flex-shrink-0" style={{ color: acc.accent }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300">или войдите вручную</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="text"
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setSelected(null); }}
                  placeholder="example@school.kz"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Пароль</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
              <p className="text-[11px] text-gray-300 mt-1.5">Тестовый пароль: <span className="font-mono text-gray-400">password</span></p>
            </div>

            <button
              type="submit"
              disabled={loading || !identifier.trim()}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-40 mt-1"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Вход...
                </span>
              ) : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
