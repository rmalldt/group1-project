const {
  calculateDistance,
  findMinMaxCoordinates,
} = require('../../utils/coordinates');

describe('coordinates', () => {
  describe('calculate distance', () => {
    const harrow = [-0.3373046, 51.5968271];
    const oxford = [-1.2578499, 51.7520131];

    it('should return approximate distance in km between two known coordinates', () => {
      actualDistance = 65.8;
      const distance = calculateDistance(harrow, oxford);
      expect(distance).toBeCloseTo(actualDistance, 1);
    });
  });

  describe('findMinMaxCoordinates', () => {
    const harrow = [-0.3373046, 51.5968271];

    const oxford = [-1.2578499, 51.7520131];
    const brighton = [-0.1400561, 50.8214626];
    const cardiff = [-3.1791934, 51.4816546];
    const leeds = [-1.5437941, 53.7974185];

    const coordinates = [oxford, brighton, cardiff, leeds];

    it('should return the correct farthest and nearest coordinates with distances', () => {
      const result = findMinMaxCoordinates(harrow, coordinates);

      expect(parseFloat(result.minDistance)).toBeLessThan(200);
      expect(parseFloat(result.maxDistance)).toBeGreaterThan(200);

      expect(result.nearestCoord).toEqual(oxford);
      expect(result.farthestCoord).toEqual(leeds);
    });
  });
});
