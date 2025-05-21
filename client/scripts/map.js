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
let dataSource;
let polygonLayer;

document.addEventListener('DOMContentLoaded', async function () {
  const drawer = document.getElementById('drawer');
  const toggleBtn = document.getElementById('toggleDrawer');

  toggleBtn.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });

  document
    .getElementById('settingsForm')
    .addEventListener('submit', async e => {
      e.preventDefault();

      let postcode = document.getElementById('postcode-input').value.trim();
      let batteryCharge = parseFloat(document.getElementById('battery').value);
      let passengerDifferential = parseFloat(
        document.getElementById('passengers').value
      );
      let weatherConditionDifferential =
        document.getElementById('weather').value;

      console.log('Form Submitted:');
      console.log('Postcode:', postcode);
      console.log('Battery:', batteryCharge);
      console.log('Passengers:', passengerDifferential);
      console.log('Weather:', weatherConditionDifferential);

      let newCoords = await postCodeToLatLng(postcode);
      console.log('NEW COORDS: ', newCoords);
      originLat = newCoords.latitude;
      originLon = newCoords.longitude;

      await fetchIsochrone(
        userSelectedModel,
        originLat,
        originLon,
        batteryCharge,
        weatherConditionDifferential,
        passengerDifferential
      );
      drawer.classList.remove("open")
    });


  let postcode = localStorage.getItem('postcode') || 'S1 1AA'; // Fallback to S1 1AA if no postcode in localStorage
  document.getElementById('postcode-input').value = postcode; // Prepopulate the postcode input box

  const coords = await postCodeToLatLng(postcode);
  let originLat = coords.latitude;
  let originLon = coords.longitude;
  console.log('Starting coordinates:', originLat, originLon);

  let userSelectedModel = localStorage.getItem('carModel');
  console.log('User selected model:', userSelectedModel);

  // ------------------------

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
    console.log('READY:');
    dataSource = new atlas.source.DataSource();
    map.sources.add(dataSource);

    polygonLayer = new atlas.layer.PolygonLayer(dataSource, null, {
      fillColor: 'rgb(0, 136, 255)',
      strokeColor: 'blue',
      strokeWidth: 2,
    });

    console.log('Map is ready');
    console.log('User selected model:', userSelectedModel);

    if (!userSelectedModel) {
      console.error('No car model selected. Please select a car model.');
      window.location.replace('/client/views/select-vehicle.html');
    }

    let batteryCharge = 1;
    let weatherConditionDifferential = 1;
    let passengerDifferential = 1; // initial map renders with these variable values

    fetchIsochrone(
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
    dataSource.add(isochronePolygon);

    // Add a PolygonLayer to style the fill and outline
    map.layers.add(polygonLayer);

    // Zoom the map to the polygon bounds
    map.setCamera({ bounds: dataSource.getBounds(), padding: 20 });
  } catch (err) {
    console.error('Error: ', err);
  }
}
