// Add your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiY25heWxvcjExIiwiYSI6ImNtYW1iZHZ3MTBoN3oyaXM0dXF0ZnI2bHMifQ.0uMv9gokp_a0xF1a2jXW2w';
    const map = new mapboxgl.Map({
        container: 'map', // Specify the container ID
        style:
          'mapbox://styles/mapbox/streets-v12', // Specify which map style to use
        center: [-0.021249, 51.545141], // Specify the starting position | THIS WILL CHANGE DYNAMICALLY DEPENDING ON THE LOCATION ADDED BY THE USER
        zoom: 15 // Specify the starting zoom
    });

    // Create constants to use in getIso()
const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
const lon = -0.021249;
const lat = 51.545141; //these will be replaced with the user's location
const profile = 'driving'; // Set the default routing profile
const minutes = 10; // Set the default duration

// Create a function that sets up the Isochrone API query then makes an fetch call
async function getIso() {
  const query = await fetch(
    `${urlBase}${profile}/${lon},${lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );
  const data = await query.json();
  map.getSource('iso').setData(data);
}

map.on('load', () => {
    // When the map loads, add the source and layer
    map.addSource('iso', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
  
    map.addLayer(
      {
        id: 'isoLayer',
        type: 'fill',
        // Use "iso" as the data source for this layer
        source: 'iso',
        layout: {},
        paint: {
          // The fill color for the layer is set to a light purple
          'fill-color': '#5a3fc0',
          'fill-opacity': 0.3
        }
      },
      'poi-label'
    );
  
    // Make the API call
    getIso();
  });