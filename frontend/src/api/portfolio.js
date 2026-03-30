import bilimClassClient from './bilimclass/client';

export const portfolioApi = {
  getPortfolio: () =>
    bilimClassClient.get('/student/portfolio'),

  getLeaderboard: () =>
    bilimClassClient.get('/student/leaderboard'),
};

export default portfolioApi;
