document.addEventListener('DOMContentLoaded', function () {
  // Azure Maps subscription key
  const subscriptionKey = 'FCwsnU80SGrtrUAFyWQ9HaqMRW7oE2nUrD2c7UWOtsz6L0YnVUcsJQQJ99BEAC5RqLJFfRFaAAAgAZMPGcrp';

  // 1. Initialize the map
  const map = new atlas.Map('myMap', {
    center: [-0.478, 51.586],
    zoom: 11,
    authOptions: {
      authType: 'subscriptionKey',
      subscriptionKey: subscriptionKey
    }
  });

  map.events.add('ready', () => {
    // 2. Create a DataSource and add it to the map
    const dataSource = new atlas.source.DataSource();
    map.sources.add(dataSource);

    // 3. Define isochrone parameters
    const originLat = 51.586;
    const originLon = -0.478;
    const distanceBudgetM = 400000; // 400km range 

    // 4. Build the Isochrone API URL using the subscription key
    const isoUrl =
      `https://atlas.microsoft.com/route/range/json` +
      `?api-version=1.0` +
      `&query=${originLat},${originLon}` +
      `&distanceBudgetInMeters=${distanceBudgetM}` +
      `&subscription-key=${subscriptionKey}`;

    // 5. Fetch the isochrone and render it
    fetch(isoUrl)
      .then(response => response.json())
      .then(result => {
        // Convert boundary points to [lon, lat] pairs
        const boundaryCoords = result.reachableRange.boundary.map(pt => [pt.longitude, pt.latitude]);

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
 