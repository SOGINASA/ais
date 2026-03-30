/**
 * Вспомогательная функция для расчета стандартного отклонения
 * Используется для определения аномалий в оценках студента
 */
export const calculateStandardDeviation = (values) => {
  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;

  return Math.sqrt(avgSquareDiff);
};

/**
 * Определить есть ли аномалия в последних оценках студента
 * Используется для Early Warning System
 */
export const detectAnomalies = (grades, threshold = 1.5) => {
  if (grades.length < 3) return { isAnomaly: false, severity: 'none' };

  const numericGrades = grades.map((g) => g.grade);
  const recentGrades = numericGrades.slice(-5);
  const previousGrades = numericGrades.slice(-10, -5);

  if (previousGrades.length === 0) {
    return { isAnomaly: false, severity: 'none' };
  }

  const previousAvg =
    previousGrades.reduce((a, b) => a + b, 0) / previousGrades.length;
  const recentAvg = recentGrades.reduce((a, b) => a + b, 0) / recentGrades.length;
  const diff = previousAvg - recentAvg;
  const stdDev = calculateStandardDeviation(previousGrades);

  if (diff > threshold * stdDev) {
    return {
      isAnomaly: true,
      severity: diff > 2 * threshold * stdDev ? 'critical' : 'warning',
      percentageDrop: ((diff / previousAvg) * 100).toFixed(1),
    };
  }

  return { isAnomaly: false, severity: 'none' };
};

/**
 * Предсказать вероятность неудачи на следующем контрольном срезе
 */
export const predictFailureRisk = (grades, threshold = 3) => {
  if (grades.length === 0) return 0;

  const numericGrades = grades.map((g) => g.grade);
  const average = numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length;
  const recentGrades = numericGrades.slice(-5);
  const recentAvg = recentGrades.reduce((a, b) => a + b, 0) / recentGrades.length;

  const trendFactor = recentAvg < average ? 0.3 : -0.1;
  let riskProbability = 0;

  if (average < threshold) {
    riskProbability = 0.8;
  } else if (average < threshold + 0.5) {
    riskProbability = 0.5;
  } else if (recentAvg < average) {
    riskProbability = 0.3 + trendFactor;
  }

  return Math.min(Math.max(riskProbability, 0), 1);
};

/**
 * Получить recommendations на основе оценок
 */
export const getRecommendations = (grades, subject) => {
  if (grades.length === 0) return [];

  const numericGrades = grades.map((g) => g.grade);
  const average = numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length;

  const recommendations = [];

  if (average < 3) {
    recommendations.push({
      priority: 'critical',
      text: `Срочно требуется помощь по ${subject}. Рекомендуется интенсивное обучение.`,
    });
  } else if (average < 3.5) {
    recommendations.push({
      priority: 'high',
      text: `Требуется дополнительная работа по ${subject}. Пройдите консультацию.`,
    });
  }

  const lastFiveGrades = numericGrades.slice(-5);
  const hasDecline = lastFiveGrades[0] > lastFiveGrades[lastFiveGrades.length - 1];

  if (hasDecline && average > 3) {
    recommendations.push({
      priority: 'medium',
      text: `Обнаружена тенденция к снижению оценок по ${subject}. Пересмотрите методы обучения.`,
    });
  }

  if (average >= 4.5) {
    recommendations.push({
      priority: 'low',
      text: `Отличная работа по ${subject}! Рассмотрите углубленное изучение темы.`,
    });
  }

  return recommendations;
};

export default {
  calculateStandardDeviation,
  detectAnomalies,
  predictFailureRisk,
  getRecommendations,
};
