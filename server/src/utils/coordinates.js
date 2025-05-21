function toRad(value) {
  return (value * Math.PI) / 180;
}

function calculateDistance(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // radius of earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(toRad(lat1)) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // distance in km
  return d;
}

function prepareCoordinates(boundary) {
  const resultCoords = [];
  boundary.forEach(coord => {
    resultCoords.push([coord.longitude, coord.latitude]);
  });
  return resultCoords;
}

function findMinMaxCoordinates(centerCoord, coords) {
  let maxDistance = 0;
  let farthestCoord = null;
  let minDistance = Number.MAX_SAFE_INTEGER;
  let nearestCoord = null;

  coords.forEach(coord => {
    const distance = calculateDistance(centerCoord, coord);
    if (distance > maxDistance) {
      maxDistance = distance;
      farthestCoord = coord;
    }

    if (distance < minDistance) {
      minDistance = distance;
      nearestCoord = coord;
    }
  });

  return {
    maxDistance: maxDistance.toFixed(2),
    minDistance: minDistance.toFixed(2),
    farthestCoord,
    nearestCoord,
  };
}

module.exports = { prepareCoordinates, findMinMaxCoordinates };
