import bilimClassClient from '../bilimclass/client';

export const predictionsApi = {
  // Предсказания успеваемости студента
  getPredictions: (studentId) =>
    bilimClassClient.get(`/ai/predictions/${studentId}`),
};

export default predictionsApi;
