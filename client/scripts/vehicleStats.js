import { API_BASE_URL } from './config.js';

export async function getVehicleStats(carmodel) {
    try {
      const response = await fetch(`${API_BASE_URL}/evs/model/${carmodel}`);
      const data = await response.json();
      console.log('Vehicle stats from database:', data.data);
      return data.data;
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      return {};
    }
  }