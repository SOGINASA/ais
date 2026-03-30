import bilimClassClient from './client';

export const scheduleApi = {
  /**
   * GET /api/schedule?class=10A
   * @param {string} className
   * @returns {Promise<Object>} { data: ScheduleItem[] }
   */
  getSchedule: (className) => {
    return bilimClassClient.get('/schedule', {
      params: { class: className },
    });
  },
};

export default scheduleApi;
