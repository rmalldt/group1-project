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

  // map.layers.add(
  //   new atlas.layer.SymbolLayer(userPinSource, null, {
  //     iconOptions: {
  //       image: 'pin-red',
  //       anchor: 'bottom',
  //     },
  //   })
  // );

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

  drawer.classList.remove("open")
});

document.addEventListener('DOMContentLoaded', async function () {
  let postcode = localStorage.getItem('postcode') || 'S1 1AA'; // Fallback to S1 1AA if no postcode in localStorage
  document.getElementById('postcode-input').value = postcode; // Prepopulate the postcode input box

  const coords = await postCodeToLatLng(postcode);
  originLat = coords.latitude;
  originLon = coords.longitude;
  console.log('Starting coordinates:', originLat, originLon);

  // Initialise the map
  map = new atlas.Map('myMap', {
    center: [originLon, originLat],
    zoom: 5,
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

    // map.layers.add(
    //   new atlas.layer.SymbolLayer(userPinSource, null, {
    //     iconOptions: {
    //       image: 'pin-red',
    //       anchor: 'bottom',
    //     },
    //   })
    // );

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

    // Ideally we would find a way to double the number of points in the boundary to make the polygon
    // smoother, which we would need to do after the fetch(isoUrl) call. Can we write a function that
    // takes the mean between each set of two points and add them as elements to the boundaryCoords array?
    // Create a GeoJSON Polygon from the boundary
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
