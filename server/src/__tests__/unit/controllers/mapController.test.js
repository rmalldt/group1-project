jest.mock('axios');
jest.mock('../../../models/evModel');

const axios = require('axios');
const NodeCache = require('node-cache');
const Ev = require('../../../models/evModel');
const mapController = require('../../../controllers/mapController');

const tokenCache = new NodeCache({ stdTTL: 3600 });

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
      Ev.getEvByModel.mockResolvedValue({
        data: new Ev(testEv),
        message: null,
      });
      axios.get.mockResolvedValue({ data: testMap });

      // Act
      await mapController.getIsochrone(mockReq, mockRes);

      // Assert
      expect(Ev.getEvByModel).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: testMap,
      });
    });

    it('should return an error with status code 404 if the Ev is not found', async () => {
      Ev.getEvByModel.mockRejectedValue(
        new Error('Unable to fetch isochrone data')
      );

      await mapController.getIsochrone(mockReq, mockRes);

      expect(Ev.getEvByModel).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Unable to fetch isochrone data',
      });
    });
  });

  describe('getAzureToken', () => {
    const originalEnv = process.env;
    let mockReq;

    beforeEach(() => {
      testToken = 'my-token-123';
    });

    it('should fetch a new token when the tokenCache is empty and return the token with status code 200', async () => {
      // Arrange
      const testToken = 'my-token-123';

      jest.spyOn(tokenCache, 'get').mockReturnValue(null);

      axios.post.mockResolvedValueOnce({
        data: { access_token: testToken },
      });

      // Act
      await mapController.getAzureToken(null, mockRes);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        `https://login.microsoftonline.com/test-tenant-id/oauth2/v2.0/token`,
        expect.any(URLSearchParams),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      axios.post.mockResolvedValue({ data: { access_token: testToken } });

      const urlParamsArg = axios.post.mock.calls[0][1];
      expect(urlParamsArg.get('client_id')).toBe('test-client-id');
      expect(urlParamsArg.get('client_secret')).toBe('test-client-secret');
      expect(urlParamsArg.get('scope')).toBe('https://test-api.com/.default');

      expect(urlParamsArg.get('grant_type')).toBe('client_credentials');

      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        token: testToken,
      });
    });

    it('should use cached token if available', async () => {
      const testToken = 'my-token-123';
      jest.spyOn(tokenCache, 'get').mockReturnValue(testToken);

      await mapController.getAzureToken(null, mockRes);

      expect(axios.post).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ token: testToken });
    });
    
    it('should return 404 if Ev.getEvByModel returns object without data', async () => {
      Ev.getEvByModel.mockResolvedValue({ data: null, message: 'not found' });

      await mapController.getIsochrone(mockReq, mockRes);

      expect(Ev.getEvByModel).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
      error: 'Unable to fetch isochrone data',
      });
    });

  });
});
