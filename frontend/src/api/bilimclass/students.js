import bilimClassClient from './client';

export const studentsApi = {
  /**
   * GET /api/students
   * @returns {Promise<Object>} { data: Student[] }
   */
  getStudents: () => {
    return bilimClassClient.get('/students');
  },

  /**
   * GET /api/students/:id
   * @param {number} id
   * @returns {Promise<Object>} { data: Student }
   */
  getStudent: (id) => {
    return bilimClassClient.get(`/students/${id}`);
  },
};

export default studentsApi;
