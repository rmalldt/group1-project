const axios = require('axios');
const Ev = require('../../../models/evModel');
const mapController = require('../../../controllers/mapController');

const mockSend = jest.fn();
const mockJson = jest.fn();
const mockEnd = jest.fn();

const mockStatus = jest.fn(() => ({
  send: mockSend,
  json: mockJson,
  end: mockEnd,
}));

const mockRes = { status: mockStatus };

describe('Map Controller', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());

  describe('getIsochrone', () => {
    let testMap, testEv, mockReq;

    beforeEach(() => {
      testMap = {
        formatVersion: '0.0.1',
        reachableRange: {
          center: { latitude: 51.46421, longitude: -0.41494 },
          boundary: [
            [1, 2],
            [2, 3],
          ],
        },
      };

      testEv = {
        ev_id: 1,
        brand: 'Audi',
        model: 'Q4 e-tron',
        top_speed_kmh: 240,
        combined_wltp_range_km: 488,
        battery_capacity_kwh: 93.4,
        efficiency_kmkwh: 5.22,
        fast_charge_kmh: 850,
        rapid_charge: 'Yes',
        powertrain: 'AWD',
        plug_type: 'Type 2 CCS',
        ev_car_image: 'n/a',
      };

      mockReq = {
        query: {
          model: 'Q4 e-tron',
          lat: '51.46452',
          lon: '-0.41526',
          batteryCharge: '1',
          weatherConditionDifferential: '1',
          passengerDifferential: '1',
        },
      };
    });

    it('should return Isochrone with the status code 200 on success', async () => {
      // Arrange
      jest
        .spyOn(Ev, 'getEvByModel')
        .mockResolvedValue({ data: new Ev(testEv), message: null });

      jest.spyOn(axios, 'get').mockResolvedValue(testMap);

      // Act
      const result = await mapController.getIsochrone(mockReq, mockRes);

      // Assert
      expect(Ev.getEvByModel).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should return an error if the Ev is not found', async () => {
      jest
        .spyOn(Ev, 'getEvByModel')
        .mockRejectedValue(new Error('Unable to fetch isochrone data'));

      await mapController.getIsochrone(mockReq, mockRes);

      expect(Ev.getEvByModel).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Unable to fetch isochrone data',
      });
    });
  });
});
