/** @jest-environment jsdom */

// Mock the fetch API
global.fetch = jest.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
});

// Mock the atlas library
global.atlas = {
  Map: jest.fn(() => ({
    events: {
      add: jest.fn((event, callback) => {
        if (event === 'ready') {
          global.mapReadyCallback = callback;
        }
      })
    },
    sources: {
      add: jest.fn()
    },
    layers: {
      add: jest.fn()
    },
    setCamera: jest.fn()
  })),
  source: {
    DataSource: jest.fn(() => ({
      add: jest.fn(),
      clear: jest.fn(),
      getBounds: jest.fn(() => ({ min: { x: 0, y: 0 }, max: { x: 1, y: 1 } }))
    }))
  },
  layer: {
    PolygonLayer: jest.fn()
  },
  data: {
    Polygon: jest.fn()
  }
};

// Mock DOM elements
document.body.innerHTML = `
  <div id="myMap"></div>
  <button id="postcode"></button>
  <input id="postcode-input" />
`;

describe('Isochrone Map Functionality', () => {
  let originalDocument;

  beforeAll(() => {
    originalDocument = document.addEventListener;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset input value for each test
    document.getElementById('postcode-input').value = '';
  });

  afterAll(() => {
    document.addEventListener = originalDocument;
  });

  test('should initialize map with correct parameters', () => {
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        callback();
      }
    });

    window.localStorage.getItem.mockReturnValue('Model S');

    require('../scripts/iso2.js');

    expect(atlas.Map).toHaveBeenCalledWith('myMap', expect.objectContaining({
      center: expect.any(Array),
      zoom: 5,
      authOptions: expect.objectContaining({
        authType: 'subscriptionKey',
        subscriptionKey: expect.any(String)
      })
    }));
  });

  test('should fetch car model from localStorage', () => {
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        callback();
      }
    });

    window.localStorage.getItem.mockReturnValue('Model X');

    require('../scripts/iso2.js');

    expect(window.localStorage.getItem).toHaveBeenCalledWith('carModel');
  });

  test('should call getVehicleStats with correct model', async () => {
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        callback();
      }
    });

    const mockModel = 'Tesla Model 3';
    window.localStorage.getItem.mockReturnValue(mockModel);

    // Mock vehicle stats fetch
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        battery_capacity_kwh: 75,
        brand: 'Tesla',
        combined_wltp_range_km: 400,
        efficiency_kmkwh: 0.18,
        ev_car_image: '',
        ev_id: 1,
        fast_charge_kmh: 500,
        model: mockModel,
        plug_type: 'Type2',
        powertrain: 'EV',
        rapid_charge: true,
        top_speed_kmh: 210
      })
    });

    // Mock isochrone fetch
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        reachableRange: {
          boundary: [
            { latitude: 51.6, longitude: -0.5 },
            { latitude: 51.7, longitude: -0.4 }
          ]
        }
      })
    });

    require('../scripts/iso2.js');
    await global.mapReadyCallback();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/evs/model/' + encodeURIComponent(mockModel))
    );
  });

  test('should handle errors in getVehicleStats', async () => {
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        callback();
      }
    });

    const mockError = new Error('API error');
    global.fetch.mockRejectedValueOnce(mockError);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    window.localStorage.getItem.mockReturnValue('Model Y');

    require('../scripts/iso2.js');
    await global.mapReadyCallback();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching vehicle stats:', mockError);

    consoleErrorSpy.mockRestore();
  });

  test('should fetch and render isochrone polygon', async () => {
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        callback();
      }
    });

    window.localStorage.getItem.mockReturnValue('Nissan Leaf');

    // Mock vehicle stats fetch
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        battery_capacity_kwh: 40,
        brand: 'Nissan',
        combined_wltp_range_km: 270,
        efficiency_kmkwh: 0.15,
        ev_car_image: '',
        ev_id: 2,
        fast_charge_kmh: 300,
        model: 'Leaf',
        plug_type: 'Type2',
        powertrain: 'EV',
        rapid_charge: true,
        top_speed_kmh: 144
      })
    });

    // Mock isochrone fetch
    const mockIsochroneResponse = {
      reachableRange: {
        boundary: [
          { latitude: 51.6, longitude: -0.5 },
          { latitude: 51.7, longitude: -0.4 },
          { latitude: 51.6, longitude: -0.3 },
          { latitude: 51.5, longitude: -0.4 },
          { latitude: 51.6, longitude: -0.5 }
        ]
      }
    };

    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockIsochroneResponse)
    });

    require('../scripts/iso2.js');
    await global.mapReadyCallback();

    // Check if the isochrone API was called
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://atlas.microsoft.com/route/range/json'));

    // Check if polygon was created with correct coordinates
    const expectedCoords = mockIsochroneResponse.reachableRange.boundary.map(pt => [pt.longitude, pt.latitude]);
    expect(atlas.data.Polygon).toHaveBeenCalledWith([expectedCoords]);

    // Check if polygon was added to datasource
    expect(atlas.source.DataSource().add).toHaveBeenCalled();

    // Check if polygon layer was added to map
    expect(atlas.layer.PolygonLayer).toHaveBeenCalledWith(
      expect.anything(),
      null,
      expect.objectContaining({
        fillColor: 'rgb(0, 136, 255)',
        strokeColor: 'blue',
        strokeWidth: 2
      })
    );

    // Check if map camera was set to polygon bounds
    expect(atlas.Map().setCamera).toHaveBeenCalledWith({
      bounds: expect.anything(),
      padding: 20
    });
  });

  test('should handle isochrone API errors', async () => {
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        callback();
      }
    });

    window.localStorage.getItem.mockReturnValue('Test Model');

    // Mock vehicle stats fetch
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        battery_capacity_kwh: 60,
        brand: 'Test',
        combined_wltp_range_km: 350,
        efficiency_kmkwh: 0.17,
        ev_car_image: '',
        ev_id: 3,
        fast_charge_kmh: 400,
        model: 'Test Model',
        plug_type: 'Type2',
        powertrain: 'EV',
        rapid_charge: true,
        top_speed_kmh: 180
      })
    });

    // Mock failed isochrone fetch
    const mockError = new Error('Isochrone API error');
    global.fetch.mockRejectedValueOnce(mockError);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    require('../scripts/iso2.js');
    await global.mapReadyCallback();

    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);

    consoleErrorSpy.mockRestore();
  });

  test('should construct isochrone URL with correct parameters', async () => {
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        callback();
      }
    });

    const mockModel = 'BMW i3';
    window.localStorage.getItem.mockReturnValue(mockModel);

    // Mock vehicle stats fetch
    const mockStats = {
      battery_capacity_kwh: 42,
      brand: 'BMW',
      combined_wltp_range_km: 300,
      efficiency_kmkwh: 0.16,
      ev_car_image: '',
      ev_id: 4,
      fast_charge_kmh: 350,
      model: mockModel,
      plug_type: 'Type2',
      powertrain: 'EV',
      rapid_charge: true,
      top_speed_kmh: 150
    };

    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockStats)
    });

    // Mock isochrone fetch
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        reachableRange: {
          boundary: [
            { latitude: 51.6, longitude: -0.5 },
            { latitude: 51.7, longitude: -0.4 }
          ]
        }
      })
    });

    require('../scripts/iso2.js');
    await global.mapReadyCallback();

    // Check if fetch was called with URL containing correct parameters
    const fetchCall = global.fetch.mock.calls[1][0];
    expect(fetchCall).toContain('https://atlas.microsoft.com/route/range/json');
    expect(fetchCall).toContain('api-version=1.0');
    expect(fetchCall).toContain('query=');
    expect(fetchCall).toContain(`distanceBudgetInMeters=${mockStats.combined_wltp_range_km * 1000 * 0.5}`);
    expect(fetchCall).toContain(`vehicleMaxSpeed=${mockStats.top_speed_kmh}`);
  });
});