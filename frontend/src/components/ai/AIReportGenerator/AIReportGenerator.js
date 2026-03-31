import React from 'react';

export default function AIReportGenerator({ report }) {
  if (!report) return null;

  const sections = [];
  if (report.summary) sections.push({ title: 'Резюме', text: report.summary });
  if (report.strengths) sections.push({ title: 'Сильные стороны', text: report.strengths });
  if (report.weaknesses) sections.push({ title: 'Зоны роста', text: report.weaknesses });
  if (report.recommendations) sections.push({ title: 'Рекомендации', text: report.recommendations });

  // If the report is just a string
  if (typeof report === 'string') {
    sections.push({ title: 'AI-анализ', text: report });
  }

  // If the report has analysis field (from ai_service)
  if (report.analysis) {
    sections.push({ title: 'AI-анализ', text: report.analysis });
  }

  if (sections.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🧠 AI-отчёт
      </h3>
      <div className="space-y-4">
        {sections.map((s, i) => (
          <div key={i}>
            <p className="text-sm font-semibold text-gray-700 mb-1">{s.title}</p>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}