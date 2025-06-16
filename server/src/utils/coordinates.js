function toRadian(value) {
  return (value * Math.PI) / 180;
}

function calculateDistance(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // radius of earth in km
  const deltaLat = toRadian(lat2 - lat1);
  const deltaLon = toRadian(lon2 - lon1);
  const lat1Radian = toRadian(lat1);
  const lat2Radian = toRadian(lat2);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.sin(deltaLon / 2) ** 2 * Math.cos(lat1Radian) * Math.cos(lat2Radian);

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
    console.log(`Coordinate: ${coord}, Distance: ${distance}`);
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

module.exports = {
  calculateDistance,
  prepareCoordinates,
  findMinMaxCoordinates,
};
