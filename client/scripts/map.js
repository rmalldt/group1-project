async function postCodeToLatLng(postcode) {
  let latlng;
  try {
    let response = await fetch(
      `https://api.postcodes.io/postcodes/${postcode}`
    );
    let resData = await response.json();
    latlng = {
      latitude: resData.result.latitude,
      longitude: resData.result.longitude,
    };
    return latlng;
  } catch (error) {
    console.log('Invalid postcode');
  }
}

// Global map objects
let map;
let userPinSource;
let dataSource;
let polygonLayer;
let chargingStationSource;
let chargingStationLayer;
let originLat;
let originLon;
let darkModeActive = false; // Raf added: Track what the current mode is
let userPinLayer;
let userPinLayerAdded = false;
let chargingStationLayerAdded = false;

const drawer = document.getElementById('drawer');
const toggleBtn = document.getElementById('toggleDrawer');

toggleBtn.addEventListener('click', () => {
  drawer.classList.toggle('open');
});

document.getElementById('settingsForm').addEventListener('submit', async e => {
  e.preventDefault();

  let userSelectedModel = localStorage.getItem('carModel');
  console.log('User selected model:', userSelectedModel);

  let postcode = document.getElementById('postcode-input').value.trim();
  let batteryCharge = parseFloat(document.getElementById('battery').value);
  let passengerDifferential = parseFloat(
    document.getElementById('passengers').value
  );
  let weatherConditionDifferential = document.getElementById('weather').value;

  console.log('Form Submitted:');
  console.log('Postcode:', postcode);
  console.log('Battery:', batteryCharge);
  console.log('Passengers:', passengerDifferential);
  console.log('Weather:', weatherConditionDifferential);

  let newCoords = await postCodeToLatLng(postcode);
  console.log('NEW COORDS: ', newCoords);
  originLat = newCoords.latitude;
  originLon = newCoords.longitude;

  // Add stable user pin
  userPinSource.clear();
  userPinSource.add(
    new atlas.data.Feature(new atlas.data.Point([originLon, originLat]))
  );

  if (userPinLayer) {
    map.layers.remove(userPinLayer);
  }

  userPinLayer = new atlas.layer.SymbolLayer(userPinSource, null, {
    iconOptions: {
      image: 'pin-red',
      anchor: 'bottom',
    },
  });
  map.layers.add(userPinLayer);

  await fetchIsochrone(
    userSelectedModel,
    originLat,
    originLon,
    batteryCharge,
    weatherConditionDifferential,
    passengerDifferential
  );

  chargingStationSource.clear();
  if (batteryCharge === 0.25) {
    await getChargingStations(originLat, originLon);
  }

  drawer.classList.remove("open");
});

document.addEventListener('DOMContentLoaded', async function () {
  let postcode = localStorage.getItem('postcode') || 'S1 1AA';
  document.getElementById('postcode-input').value = postcode;

  const coords = await postCodeToLatLng(postcode);
  originLat = coords.latitude;
  originLon = coords.longitude;
  console.log('Starting coordinates:', originLat, originLon);

  // Initialise the map
  map = new atlas.Map('myMap', {
    center: [originLon, originLat],
    zoom: 5,
    style: 'road', // raf added this to initialise the map in road mode

    authOptions: {
      authType: 'anonymous',
      clientId: 'e9a2d010-67fb-4471-831f-a7adcc434fb8',
      getToken: function (resolve, reject, map) {
        fetch('http://localhost:3000/maps/azure-token')
          .then(res => res.json())
          .then(data => resolve(data.token))
          .catch(err => reject(err));
      },
    },
  });

  map.events.add('ready', async () => {
    console.log('READY');
    userPinSource = new atlas.source.DataSource();
    dataSource = new atlas.source.DataSource();
    chargingStationSource = new atlas.source.DataSource();
    map.sources.add(userPinSource);
    map.sources.add(dataSource);
    map.sources.add(chargingStationSource);

    // Add stable user pin
    userPinSource.add(
      new atlas.data.Feature(new atlas.data.Point([originLon, originLat]))
    );

    userPinLayer = new atlas.layer.SymbolLayer(userPinSource, null, {
      iconOptions: {
        image: 'pin-red',
        anchor: 'bottom',
      },
    });
    map.layers.add(userPinLayer);

    polygonLayer = new atlas.layer.PolygonLayer(dataSource, null, {
      fillColor: 'rgba(0,136,255,0.4)',
      strokeColor: '#0088ff',
      strokeWidth: 2,
    });

    map.layers.add(polygonLayer);

    chargingStationLayer = new atlas.layer.SymbolLayer(
      chargingStationSource,
      null,
      {
        iconOptions: {
          image: 'pin-darkblue',
          anchor: 'bottom',
        },
      }
    );
    map.layers.add(chargingStationLayer);

    const userSelectedModel = localStorage.getItem('carModel');
    const batteryCharge = 1;
    const weatherConditionDifferential = 1;
    const passengerDifferential = 1;

    await fetchIsochrone(
      userSelectedModel,
      originLat,
      originLon,
      batteryCharge,
      weatherConditionDifferential,
      passengerDifferential
    );
  });

  // Raf added: Dark mode toggle button manually
  const darkToggleBtn = document.getElementById('darkModeToggle');
  darkToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    darkModeActive = !darkModeActive;

    if (darkModeActive) {
      map.setStyle({ style: 'grayscale_dark' });
    } else {
      map.setStyle({ style: 'road' });
    }
  });

  // Raf added: Observer for plugin-based dark mode toggling
  const bodyObserver = new MutationObserver(mutations => {
    for (let mutation of mutations) {
      if (mutation.attributeName === 'class') {
        const bodyHasDarkMode = document.body.classList.contains('darkmode--activated');

        if (bodyHasDarkMode && !darkModeActive) {
          map.setStyle({ style: 'grayscale_dark' });
          darkModeActive = true;
        } else if (!bodyHasDarkMode && darkModeActive) {
          map.setStyle({ style: 'road' });
          darkModeActive = false;
        }
      }
    }
  });

  // Start observing the body class for dark mode plugin changes
  bodyObserver.observe(document.body, { attributes: true });
});

// ------------------

async function fetchIsochrone(
  userSelectedModel,
  originLat,
  originLon,
  batteryCharge,
  weatherConditionDifferential,
  passengerDifferential
) {
  const isoUrl = `http://localhost:3000/maps/isochrone?model=${userSelectedModel}&lat=${originLat}&lon=${originLon}&batteryCharge=${batteryCharge}&weatherConditionDifferential=${weatherConditionDifferential}&passengerDifferential=${passengerDifferential}`;

  console.log('Isochrone URL to pass to Azure API:', isoUrl);

  try {
    const response = await fetch(isoUrl);
    const resData = await response.json();
    if (!resData.success) {
      throw new Error('Unable to fetch isochrone');
    }

    const boundaryCoords = resData.data.reachableRange.boundary.map(pt => [
      pt.longitude,
      pt.latitude,
    ]);
    console.log('Boundary coordinates:', boundaryCoords);

    const isochronePolygon = new atlas.data.Polygon([boundaryCoords]);
    dataSource.clear();
    dataSource.add(new atlas.data.Feature(isochronePolygon));

    map.setCamera({
      bounds: atlas.data.BoundingBox.fromData([isochronePolygon]),
      padding: 20,
    });
  } catch (err) {
    console.error('Error: ', err);
  }
}

async function getChargingStations(lat, lon) {
  try {
    const response = await fetch(
      `http://localhost:3000/maps/charging-stations?lat=${lat}&lon=${lon}`
    );
    const resData = await response.json();
    const stations = resData.data.results;

    chargingStationSource.clear();

    stations.forEach(station => {
      const feature = new atlas.data.Feature(
        new atlas.data.Point([station.position.lon, station.position.lat])
      );
      chargingStationSource.add(feature);
    });
  } catch (err) {
    console.log('Could not fetch ev charging stations: ', err);
  }
}
