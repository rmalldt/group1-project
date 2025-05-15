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

document.addEventListener('DOMContentLoaded', function () {
  // Azure Maps subscription key
  const subscriptionKey = 'FCwsnU80SGrtrUAFyWQ9HaqMRW7oE2nUrD2c7UWOtsz6L0YnVUcsJQQJ99BEAC5RqLJFfRFaAAAgAZMPGcrp';

  // 1. Initialize the map
  const map = new atlas.Map('myMap', {
    center: [-0.478, 51.586],
    zoom: 5,
    authOptions: {
      authType: 'subscriptionKey',
      subscriptionKey: subscriptionKey
    }
  });

  const originLat = 51.586;
  const originLon = -0.478;

  let userSelectedModel = localStorage.getItem('carModel');
  console.log('User selected model:', userSelectedModel);

  map.events.add('ready', async () => {
    const dataSource = new atlas.source.DataSource();
    map.sources.add(dataSource);
  
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
      top_speed_kmh,
      } = await getVehicleStats(userSelectedModel);

      // We will need an event listener here to recieve environmental variables (weather conditions,
      // passenger number, etc.) from the user on the map, and use that information to mutate the range, or 
      // possibly even the vehicle weight.
    
    const isoUrl =
      `https://atlas.microsoft.com/route/range/json` +
      `?api-version=1.0` +
      `&query=${originLat},${originLon}` +
      `&distanceBudgetInMeters=${combined_wltp_range_km * 1000}` + // under WLTP ideal conditions
      `&subscription-key=${subscriptionKey}` +
      `&vehicleMaxSpeed=${top_speed_kmh}` +
      `&traffic=true`

    console.log('Isochrone URL to pass to Azure API:', isoUrl);

    fetch(isoUrl)
      .then(response => response.json())
      .then(result => {
        // Convert boundary points to [lon, lat] pairs
        const boundaryCoords = result.reachableRange.boundary.map(pt => [pt.longitude, pt.latitude]);
        console.log('Boundary coordinates:', boundaryCoords);

        // Ideally we would find a way to double the number of points in the boundary to make the polygon
        // smoother, which we would need to do after the fetch(isoUrl) call. Can we write a function that
        // takes the mean between each set of two points and add them as elements to the boundaryCoords array?


        // Create a GeoJSON Polygon from the boundary
        const isochronePolygon = new atlas.data.Polygon([boundaryCoords]);

        // Add it to the DataSource
        dataSource.add(isochronePolygon);

        // Add a PolygonLayer to style the fill and outline
        map.layers.add(new atlas.layer.PolygonLayer(dataSource, null, {
          fillColor: 'rgb(255, 0, 0)',
          strokeColor: 'blue',
          strokeWidth: 2
        }));

        // Zoom the map to the polygon bounds
        map.setCamera({ bounds: dataSource.getBounds(), padding: 20 });
      })
      .catch(console.error);
    });
  });