const Ev = require('../../../models/evModel');
const evController = require('../../../controllers/evController');

const mockSend = jest.fn();
const mockJson = jest.fn();
const mockEnd = jest.fn();

const mockStatus = jest.fn(() => ({
  send: mockSend,
  json: mockJson,
  end: mockEnd,
}));

const mockRes = { status: mockStatus };

describe('Ev Controller', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());

  describe('getAll', () => {
    it('should return all EVs with a status code 200', async () => {
      // Arrange
      const evs = [
        { brand: 'EV1-brand', model: 'EV1-model' },
        { brand: 'EV2-brand', model: 'EV2-model' },
      ];

      jest.spyOn(Ev, 'getAll').mockResolvedValue({ data: evs, message: null });

      // Act
      await evController.getAll(null, mockRes);

      // Assert
      expect(Ev.getAll).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: evs });
    });

    it('should return an error upon failure', async () => {
      jest.spyOn(Ev, 'getAll').mockRejectedValue(new Error('Db Error'));

      await evController.getAll(null, mockRes);

      expect(Ev.getAll).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Db Error',
      });
    });
  });

  describe('getAllByBrand', () => {
    let testEvs, mockReq;
    beforeEach(() => {
      testEvs = [
        { brand: 'brand1', model: 'model1' },
        { brand: 'brand1', model: 'model2' },
      ];

      mockReq = { params: { brand: 'brand1' } };
    });

    it('should return all EVs with a status code 200', async () => {
      jest
        .spyOn(Ev, 'getAllByBrand')
        .mockResolvedValue({ data: testEvs, message: null });

      await evController.getAllByBrand(mockReq, mockRes);

      expect(Ev.getAllByBrand).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: testEvs });
    });

    it('should return an error upon failure', async () => {
      jest.spyOn(Ev, 'getAllByBrand').mockRejectedValue(new Error('Db Error'));

      await evController.getAllByBrand(mockReq, mockRes);

      expect(Ev.getAllByBrand).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Db Error',
      });
    });
  });

  describe('getEvByModel', () => {
    let testEv, mockReq;

    beforeEach(() => {
      testEv = {
        ev_id: 1,
        brand: 'Audi',
        model: 'e-tron GT',
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

      mockReq = { params: { model: 'e-tron GT' } };
    });

    it('should return an EV with a 200 status code', async () => {
      jest
        .spyOn(Ev, 'getEvByModel')
        .mockResolvedValue({ data: new Ev(testEv), message: null });

      const test = await evController.getEvByModel(mockReq, mockRes);

      console.log('TEST: ', test);

      expect(Ev.getEvByModel).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: new Ev(testEv),
      });
    });

    it('should return an error if the EV is not found', async () => {
      jest.spyOn(Ev, 'getEvByModel').mockRejectedValue(new Error('Db Error'));

      await evController.getEvByModel(mockReq, mockRes);

      expect(Ev.getEvByModel).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Db Error' });
    });

    describe('getAllByBrand', () => {
      let testEvs, mockReq;

      beforeEach(() => {
        testEvs = [
          { brand: 'brand1', model: 'model1' },
          { brand: 'brand1', model: 'model2' },
        ];

        mockReq = { params: { brand: 'brand1' } };
      });

      it('should return all EVs of a specific brand with a status code 200', async () => {
        jest
          .spyOn(Ev, 'getAllByBrand')
          .mockResolvedValue({ data: testEvs, message: null });

        await evController.getAllByBrand(mockReq, mockRes);

        expect(Ev.getAllByBrand).toHaveBeenCalledWith('brand1');
        expect(Ev.getAllByBrand).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({ success: true, data: testEvs });
      });

      it('should return a 404 error if no data is found', async () => {
        jest
          .spyOn(Ev, 'getAllByBrand')
          .mockResolvedValue({ data: null, message: 'No data found' });

        await evController.getAllByBrand(mockReq, mockRes);

        expect(Ev.getAllByBrand).toHaveBeenCalledWith('brand1');
        expect(Ev.getAllByBrand).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({ error: 'No data found' });
      });

      it('should return a 404 error upon failure', async () => {
        jest.spyOn(Ev, 'getAllByBrand').mockRejectedValue(new Error('Db Error'));

        await evController.getAllByBrand(mockReq, mockRes);

        expect(Ev.getAllByBrand).toHaveBeenCalledWith('brand1');
        expect(Ev.getAllByBrand).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Db Error' });
      });
    });
  });
});
