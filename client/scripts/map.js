
async function getVehicleStats(carmodel) {
  try {
    const response = await fetch(`http://ec2-18-133-117-194.eu-west-2.compute.amazonaws.com:3000/evs/model/${carmodel}`);
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
    const response = await fetch(`http://ec2-18-133-117-194.eu-west-2.compute.amazonaws.com:3000/users/${userId}`);
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

const subscriptionKey = 'FCwsnU80SGrtrUAFyWQ9HaqMRW7oE2nUrD2c7UWOtsz6L0YnVUcsJQQJ99BEAC5RqLJFfRFaAAAgAZMPGcrp';

  const drawer = document.getElementById("drawer");
const toggleBtn = document.getElementById("toggleDrawer");

  toggleBtn.addEventListener("click", () => {
  drawer.classList.toggle("open");
});

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
 
  let postcode = document.getElementById('postcode-input').value.trim();
  let batteryCharge = parseFloat(document.getElementById('battery').value);
  let passengerDifferential = parseFloat(document.getElementById('passengers').value);
  let weatherConditionDifferential = document.getElementById('weather').value;

  console.log("Form Submitted:");
  console.log("Postcode:", postcode);
  console.log("Battery:", batteryCharge);
  console.log("Passengers:", passengerDifferential);
  console.log("Weather:", weatherConditionDifferential);

  let newCoords = await postCodeToLatLng(postcode);
    console.log('NEW COORDS: ', newCoords);
    originLat = newCoords.latitude;
    originLon = newCoords.longitude;
 
  await fetchIsochrone(
      userSelectedModel,
      originLat,
      originLon,
      subscriptionKey,
      batteryCharge,
      weatherConditionDifferential,
      passengerDifferential
    );
});



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
  console.log('User selected model:', userSelectedModel)


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

    console.log('Map is ready');
    console.log('User selected model:', userSelectedModel);

    fetchIsochrone(userSelectedModel, originLat, originLon, subscriptionKey, batteryCharge=1, weatherConditionDifferential=1, passengerDifferential=1);
  });
});

// ------------------

async function fetchIsochrone(userSelectedModel, originLat, originLon, subscriptionKey, batteryCharge, weatherConditionDifferential, passengerDifferential) {
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

  // let weatherConditionDifferential = 1;
  // let passengerDifferential = 1;
  // let batteryCharge = 1;

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

//   const drawer = document.getElementById("drawer");
// const toggleBtn = document.getElementById("toggleDrawer");

// toggleBtn.addEventListener("click", () => {
//   drawer.classList.toggle("open");
// });