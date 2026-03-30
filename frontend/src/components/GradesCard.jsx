import React from 'react';
import { Card, Badge } from './ui';

export const GradesCard = ({ subject, average, count, recentGrades = [] }) => {
  const getGradeColor = (grade) => {
    if (grade === 5) return 'success';
    if (grade === 4) return 'info';
    if (grade === 3) return 'warning';
    return 'danger';
  };

  const getAverageVariant = (avg) => {
    if (avg >= 4.5) return 'success';
    if (avg >= 3.5) return 'info';
    if (avg >= 2.5) return 'warning';
    return 'danger';
  };

  const getProgressColor = (avg) => {
    if (avg >= 4.5) return 'bg-green-500';
    if (avg >= 3.5) return 'bg-cyan-500';
    if (avg >= 2.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{subject}</h3>
          <p className="text-sm text-gray-500">Оценок: {count}</p>
        </div>
        <Badge variant={getAverageVariant(average)}>
          {average.toFixed(2)}
        </Badge>
      </div>

      {recentGrades.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Последние оценки:</p>
          <div className="flex gap-2 flex-wrap">
            {recentGrades.slice(0, 5).map((grade, idx) => (
              <Badge key={idx} variant={getGradeColor(grade.grade)}>
                {grade.grade}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full ${getProgressColor(average)} transition-all duration-300`}
          style={{ width: `${(average / 5) * 100}%` }}
        ></div>
      </div>
    </Card>
  );
};

export default GradesCard;
