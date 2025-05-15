let postcode = 'EC1A 1BB';

async function postCodeToLatLng(postcode) {
  let latlng;
  try {
    let response = await fetch(
      `https://api.postcodes.io/postcodes/${postcode}`
    );
    let resData = await response.json();
    latlng = {latitude: resData.result.latitude, longitude: resData.result.longitude}
    console.log(latlng);
    return latlng;
  } catch (error) {
    console.log('Invalid postcode');
  }
}

console.log(postCodeToLatLng(postcode));
