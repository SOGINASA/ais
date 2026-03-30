import bilimClassClient from './client';

export const achievementsApi = {
  // Портфолио/достижения текущего студента (JWT)
  getPortfolio: () =>
    bilimClassClient.get('/student/portfolio'),

  // Рейтинг класса
  getLeaderboard: () =>
    bilimClassClient.get('/student/leaderboard'),
};

export default achievementsApi;
