// Add your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiY25heWxvcjExIiwiYSI6ImNtYW1iZHZ3MTBoN3oyaXM0dXF0ZnI2bHMifQ.0uMv9gokp_a0xF1a2jXW2w ';
    const map = new mapboxgl.Map({
        container: 'map', // Specify the container ID
        style:
          'mapbox://styles/mapbox/streets-v12', // Specify which map style to use
        center: [-0.021249, 51.545141], // Specify the starting position
        zoom: 15 // Specify the starting zoom
    });