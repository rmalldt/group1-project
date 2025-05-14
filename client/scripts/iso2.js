document.addEventListener('DOMContentLoaded', async () => {
  // 0. Read query params for carId and start coords (or use defaults)
  const params = new URLSearchParams(window.location.search);
  const carId   = parseInt(params.get('carId')) || 1;
  const startLat = parseFloat(params.get('startLat')) || 51.59353458860628;
  const startLon = parseFloat(params.get('startLon')) || -0.3211641927513661;

  // 1. Fetch car specs from Supabase
  const { data: car, error } = await supabase
    .from('ev_cars')
    .select('combined_wltp_range_km, top_speed_kmh, battery_capacity_kwh, efficiency_kmkwh, weight_kg')
    .eq('ev_id', carId)
    .single();

  if (error || !car) {
    console.error('Failed to load car data:', error);
    return;
  }

  // 2. Destructure the car fields
  const {
    combined_wltp_range_km,
    top_speed_kmh,
    // battery_capacity_kwh,       // unused for distance-only
    // efficiency_kmkwh,           // unused for distance-only
    // weight_kg                    // unused for distance-only
  } = car;

  // 3. Convert to isochrone parameters
  const carRange = combined_wltp_range_km * 1000; // km → meters
  const subscriptionKey = AZURE_MAPS_KEY;

  // 4. Initialize Azure Maps
  const map = new atlas.Map('myMap', {
    center: [startLon, startLat],
    zoom: 12,
    authOptions: {
      authType: 'subscriptionKey',
      subscriptionKey
    }
  });

  map.events.add('ready', () => {
    // 5. Create a DataSource
    const dataSource = new atlas.source.DataSource();
    map.sources.add(dataSource);

    // 6. Build the isochrone URL (distance-based)
    const isoUrl = [
      `https://atlas.microsoft.com/route/range/json?api-version=1.0`,
      `&query=${startLat},${startLon}`,
      `&distanceBudgetInMeters=${carRange}`,
      `&travelMode=car`,
      `&subscription-key=${subscriptionKey}`
    ].join('');

    // 7. Fetch and render the isochrone polygon
    fetch(isoUrl)
      .then(async r => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.message || JSON.stringify(body));
        return body;
      })
      .then(result => {
        const boundary = result.reachableRange?.boundary;
        if (!boundary?.length) {
          console.error('No boundary returned:', result);
          return;
        }
        const coords = boundary.map(pt => [pt.longitude, pt.latitude]);
        const polygon = new atlas.data.Polygon([coords]);

        dataSource.add(polygon);
        map.layers.add(new atlas.layer.PolygonLayer(dataSource, null, {
          fillColor: 'rgba(255,0,0,0.4)',
          strokeColor: 'blue',
          strokeWidth: 2
        }));

        map.setCamera({ bounds: dataSource.getBounds(), padding: 20 });
      })
      .catch(err => console.error('Isochrone fetch error:', err));
  });
});
