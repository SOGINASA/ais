import React from 'react';

const riskConfig = {
  critical: { label: 'Высокий риск', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500', icon: '🔴' },
  warning: { label: 'Внимание', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500', icon: '🟡' },
  normal: { label: 'Норма', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500', icon: '🟢' },
};

export default function AIPredictionRisk({ risk }) {
  if (!risk) return null;

  const cfg = riskConfig[risk.risk_level] || riskConfig.normal;
  const probability = risk.ml_probability != null ? Math.round(risk.ml_probability * 100) : null;
  const ruleScore = risk.score || 0;

  return (
    <div className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          🛡️ Оценка рисков
        </h3>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {/* Risk bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{probability != null ? 'ML-вероятность риска' : 'Индекс риска'}</span>
          <span>{probability != null ? `${probability}%` : `${ruleScore}/100`}</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${cfg.bar}`}
            style={{ width: `${probability != null ? probability : ruleScore}%` }}
          />
        </div>
      </div>

      {/* Reasons */}
      {risk.reasons && risk.reasons.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1.5">Факторы:</p>
          <ul className="space-y-1">
            {risk.reasons.map((reason, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400">›</span> {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
      {(!risk.reasons || risk.reasons.length === 0) && (
        <p className="text-sm text-gray-500">Факторов риска не обнаружено</p>
      )}
    </div>
  );
}