export async function getVehicleStats(carmodel) {
    try {
      const response = await fetch(`http://localhost:3000/evs/model/${carmodel}`);
      const data = await response.json();
      console.log('Vehicle stats from database:', data.data);
      return data.data;
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      return {};
    }
  }