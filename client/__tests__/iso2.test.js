/** @jest-environment jsdom */

global.fetch = jest.fn();

const {
    getVehicleStats,
    postCodeToLatLng,
    getUserPostcode,
} = require('../scripts/iso2.js'); // Adjust if using ES modules or different export

describe('getVehicleStats', () => {
    afterEach(() => {
        fetch.mockClear();
    });

    it('should fetch vehicle stats and return data', async () => {
        const mockData = { data: { model: 'TestCar', range: 100 } };
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockData),
        });

        const result = await getVehicleStats('TestCar');
        expect(fetch).toHaveBeenCalledWith('http://localhost:3000/evs/model/TestCar');
        expect(result).toEqual(mockData.data);
    });

    it('should return empty object on fetch error', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));
        const result = await getVehicleStats('TestCar');
        expect(result).toEqual({});
    });
});

describe('postCodeToLatLng', () => {
    afterEach(() => {
        fetch.mockClear();
    });

    it('should fetch postcode and return lat/lng', async () => {
        const mockRes = { result: { latitude: 53.3811, longitude: -1.4701 } };
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockRes),
        });

        const result = await postCodeToLatLng('S1 1AA');
        expect(fetch).toHaveBeenCalledWith('https://api.postcodes.io/postcodes/S1 1AA');
        expect(result).toEqual({ latitude: 53.3811, longitude: -1.4701 });
    });

    it('should return undefined on fetch error', async () => {
        fetch.mockRejectedValueOnce(new Error('Invalid postcode'));
        const result = await postCodeToLatLng('BADCODE');
        expect(result).toBeUndefined();
    });
});

describe('getUserPostcode', () => {
    afterEach(() => {
        fetch.mockClear();
    });

    it('should fetch user and return postcode', async () => {
        const mockRes = { data: { start_location: 'S1 1AA' } };
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockRes),
        });

        const result = await getUserPostcode(1);
        expect(fetch).toHaveBeenCalledWith('http://localhost:3000/users/1');
        expect(result).toBe('S1 1AA');
    });

    it('should return undefined on fetch error', async () => {
        fetch.mockRejectedValueOnce(new Error('User not found'));
        const result = await getUserPostcode(999);
        expect(result).toBeUndefined();
    });
});