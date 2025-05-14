const Ev = require('../../../models/evModel');
const db = require('../../../db/connect');

describe('Ev Model', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());

  const mockEv1 = {
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

  const mockEv2 = {
    ev_id: 2,
    brand: 'Tesla',
    model: 'Model S Performance',
    top_speed_kmh: 261,
    combined_wltp_range_km: 730,
    battery_capacity_kwh: 103,
    efficiency_kmkwh: 7.09,
    fast_charge_kmh: 550,
    rapid_charge: 'Yes',
    powertrain: 'AWD',
    plug_type: 'Type 2 CCS',
    ev_car_image: 'n/a',
  };

  describe('getAll', () => {
    it('should return all Evs on successful db query', async () => {
      // Arrange
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockEv1, mockEv2] });

      // Act
      const result = await Ev.getAll();

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Ev);
      expect(result.data[0].brand).toBe('Audi');
      expect(result.data[0].model).toBe('e-tron GT');
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM ev;');
    });

    it('should resolve with NULL data when no EV is found', async () => {
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] });

      const result = await Ev.getAll();

      expect(result.data).toBe(null);
      expect(result.message).toBe('EV not found');
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM ev;');
    });
  });

  describe('getAllByBrand', () => {
    it('should return all Evs on successful db query', async () => {
      // Arrange
      jest
        .spyOn(db, 'query')
        .mockResolvedValueOnce({ rows: [mockEv1, mockEv2] });

      // Act
      const result = await Ev.getAllByBrand(mockEv1.brand);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Ev);
      expect(result.data[0].brand).toBe('Audi');
      expect(result.data[0].model).toBe('e-tron GT');
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM ev WHERE LOWER(brand) = LOWER($1);',
        [mockEv1.brand]
      );
    });

    it('should resolve with NULL data when no EV is found', async () => {
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] });

      const result = await Ev.getAllByBrand(mockEv1.brand);

      expect(result.data).toBe(null);
      expect(result.message).toBe('EV not found');
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM ev WHERE LOWER(brand) = LOWER($1);',
        [mockEv1.brand]
      );
    });
  });

  describe('getEvByModel', () => {
    it('should return Ev on successful db query', async () => {
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [mockEv1] });

      const result = await Ev.getEvByModel('e-tron GT');

      expect(result.data).toBeInstanceOf(Ev);
      expect(result.data.brand).toBe('Audi');
      expect(result.data.model).toBe('e-tron GT');
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM ev WHERE LOWER(model) = LOWER($1);',
        [mockEv1.model]
      );
    });

    it('should resolve with NULL data when Ev is not found', async () => {
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] });

      const result = await Ev.getEvByModel('NO MODEL');

      expect(result.data).toBe(null);
      expect(result.message).toBe('EV not found');
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM ev WHERE LOWER(model) = LOWER($1);',
        ['NO MODEL']
      );
    });
  });
});
