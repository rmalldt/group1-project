/**
 * Unit tests for isochrone map functionality
 * 
 * Uses Jest for testing framework
 */

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
        // Store the callback so we can trigger it in tests
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
`;

describe('Isochrone Map Functionality', () => {
  let originalDocument;
  
  beforeAll(() => {
    // Store original document.addEventListener
    originalDocument = document.addEventListener;
  });
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  afterAll(() => {
    // Restore original document.addEventListener
    document.addEventListener = originalDocument;
  });
  
  test('should initialize map with correct parameters', () => {
    // Spy on document.addEventListener
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        callback();
      }
    });
    
    // Required before importing the script
    window.localStorage.getItem.mockReturnValue('Model S');
    
    // Import the script being tested
    require('./path-to-your-script.js');
    
    // Check if the map was initialized with correct parameters
    expect(atlas.Map).toHaveBeenCalledWith('myMap', {
      center: [-0.478, 51.586],
      zoom: 11,
      authOptions: {
        authType: 'subscriptionKey',
        subscriptionKey: expect.any(String)
      }
    });
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
    
    // Mock successful fetch response
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        carTopSpeed: 210,
        batteryCapacity: 75,
        batteryCharge: 80,
        batteryEfficiency: 0.18,
        vehicleWeight: 1800
      })
    });
    
    require('../scripts/iso2.js');
    
    // Trigger the map ready event
    await global.mapReadyCallback();
    
    // Check if fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith(`/ev/model/${mockModel}`);
  });
  
  test('should handle errors in getVehicleStats', async () => {
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        callback();
      }
    });
    
    // Mock failed fetch
    const mockError = new Error('API error');
    global.fetch.mockRejectedValueOnce(mockError);
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    window.localStorage.getItem.mockReturnValue('Model Y');
    
    require('../scripts/iso2.js');
    
    // Trigger the map ready event
    await global.mapReadyCallback();
    
    // Check if console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching vehicle stats:', mockError);
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
  
  test('should fetch and render isochrone polygon', async () => {
    document.addEventListener = jest.fn((event, callback) => {
      if (event === 'DOMContentLoaded') {
        callback();
      }
    });
    
    window.localStorage.getItem.mockReturnValue('Nissan Leaf');
    
    // Mock successful vehicle stats fetch
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        carTopSpeed: 144,
        batteryCapacity: 40,
        batteryCharge: 90,
        batteryEfficiency: 0.15,
        vehicleWeight: 1580
      })
    });
    
    // Mock successful isochrone fetch
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
    
    // Trigger the map ready event
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
        fillColor: 'rgb(255, 0, 0)',
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
    
    // Mock successful vehicle stats fetch
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        carTopSpeed: 180,
        batteryCapacity: 60,
        batteryCharge: 85,
        batteryEfficiency: 0.17,
        vehicleWeight: 1650
      })
    });
    
    // Mock failed isochrone fetch
    const mockError = new Error('Isochrone API error');
    global.fetch.mockRejectedValueOnce(mockError);
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    require('../scripts/iso2.js');
    
    // Trigger the map ready event
    await global.mapReadyCallback();
    
    // Check if console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
    
    // Restore console.error
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
    
    // Mock successful vehicle stats fetch with specific values
    const mockStats = {
      carTopSpeed: 150,
      batteryCapacity: 42,
      batteryCharge: 75,
      batteryEfficiency: 0.16,
      vehicleWeight: 1345
    };
    
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockStats)
    });
    
    // Mock successful isochrone fetch
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
    
    // Trigger the map ready event
    await global.mapReadyCallback();
    
    // Check if fetch was called with URL containing correct parameters
    const expectedUrlParts = [
      'https://atlas.microsoft.com/route/range/json',
      'api-version=1.0',
      'query=51.586,-0.478',
      'distanceBudgetInMeters=400000',
      `vehicleMaxSpeed=${mockStats.carTopSpeed}`,
      `vehicleWeight=${mockStats.vehicleWeight}`
    ];
    
    const fetchCall = global.fetch.mock.calls[1][0];
    expectedUrlParts.forEach(part => {
      expect(fetchCall).toContain(part);
    });
  });
});