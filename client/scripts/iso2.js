
async function getVehicleStats(carmodel) {
  try {
    const response = await fetch(`http://localhost:3000/evs/model/${carmodel}`);
    const data = await response.json();
    console.log('Vehicle stats from database:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    return {};
  }
}

async function getUserPostcode(userId) {
  try {
    const response = await fetch(`http://localhost:3000/users/${userId}`);
      const resData = await response.json();
      const postcode = resData.data.start_location;
      console.log('User postcode:', postcode);
      return postcode;
  } catch (error) {
    console.log('Invalid postcode');
  }
}


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
    console.log(latlng);
    return latlng;
  } catch (error) {
    console.log('Invalid postcode');
  }
}


// Global map object
let map;
let dataSource;
let polygonLayer;

document.addEventListener('DOMContentLoaded', async function () {
  const subscriptionKey =
    'FCwsnU80SGrtrUAFyWQ9HaqMRW7oE2nUrD2c7UWOtsz6L0YnVUcsJQQJ99BEAC5RqLJFfRFaAAAgAZMPGcrp';

  let postcode = 'S1 1AA'; // This should be replaced with the user's postcode from the database

  // localStorage.setItem('userId', '1'); // This should be replaced with the user's ID from the database
  //const userId = localStorage.getItem('userId');
  // const coords = await postCodeToLatLng(getUserPostcode(userId).then(data => {
  //   console.log('User postcode:', data);
  //   return data;
  // }));

  const coords = await postCodeToLatLng(postcode);
  let originLat = coords.latitude;
  let originLon = coords.longitude;
  console.log('Starting coordinates:', originLat, originLon);

  let userSelectedModel = localStorage.getItem('carModel');
  console.log('User selected model:', userSelectedModel);

// The below event listener needs to be changed, to listen for changes to the settingsForm form. Instead of 
// just listening for a click on the 'new postcode' input button, it will need to record and send all information
// from all of the inputs (battery, weather, passengers, and the new postcode) to this JS file, so that 
// a) the isochrone API can be called with the new postcode, and b) the range can be recalculated based on the
// weather/battery/passenger inputs.


  let button = document.getElementById('postcode');

  button.addEventListener('click', async event => {
    let postcode = document.getElementById('postcode-input').value;
    console.log('NEW POSTCODE: ', postcode);
    let newCoords = await postCodeToLatLng(postcode);
    console.log('NEW COORDS: ', newCoords);
    originLat = newCoords.latitude;
    originLon = newCoords.longitude;

    await fetchIsochrone(
      userSelectedModel,
      originLat,
      originLon,
      subscriptionKey
    );
  });


// ------------------------

  // Initialise the map
  map = new atlas.Map('myMap', {
    center: [originLon, originLat],
    zoom: 5,
    authOptions: {
      authType: 'subscriptionKey',
      subscriptionKey: subscriptionKey,
    },
  });

  map.events.add('ready', async () => {
    dataSource = new atlas.source.DataSource();
    map.sources.add(dataSource);

    polygonLayer = new atlas.layer.PolygonLayer(dataSource, null, {
      fillColor: 'rgb(0, 136, 255)',
      strokeColor: 'blue',
      strokeWidth: 2,
    });

    fetchIsochrone(userSelectedModel, originLat, originLon, subscriptionKey);
  });
});

// ------------------

async function fetchIsochrone(userSelectedModel, originLat, originLon, subscriptionKey) {
  const {
    battery_capacity_kwh,
    brand,
    combined_wltp_range_km,
    efficiency_kmkwh,
    ev_car_image,
    ev_id,
    fast_charge_kmh,
    model,
    plug_type,
    powertrain,
    rapid_charge,
    top_speed_kmh
  } = await getVehicleStats(userSelectedModel)

  // We will need an event listener here to recieve environmental variables (weather conditions,
  // passenger number, etc.) from the user on the map, and use that information to mutate the range, or
  // possibly even the vehicle weight.

  let batteryCharge = 0.5; // 50% charge
  let weatherConditionDifferential = 0.75; // 25% reduction in range due to weather
  let passengerDifferential = 0.9; // 10% reduction in range due to passengers

  const isoUrl =
    `https://atlas.microsoft.com/route/range/json` +
    `?api-version=1.0` +
    `&query=${originLat},${originLon}` +
    `&distanceBudgetInMeters=${combined_wltp_range_km * 1000 * batteryCharge * weatherConditionDifferential * passengerDifferential}` + // under WLTP ideal conditions
    `&subscription-key=${subscriptionKey}` +
    `&vehicleMaxSpeed=${top_speed_kmh}` +
    `&traffic=true`;

  console.log('Isochrone URL to pass to Azure API:', isoUrl);

  fetch(isoUrl)
    .then(response => response.json())
    .then(result => {
      // Convert boundary points to [lon, lat] pairs
      const boundaryCoords = result.reachableRange.boundary.map(pt => [
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
    })
    .catch(console.error);
  }
