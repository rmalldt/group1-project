require('dotenv').config();
const axios = require('axios');

const Ev = require('../models/evModel');

const subscriptionKey = process.env.AZURE_SUBKEY;

async function getAzureToken(req, res) {
  const {
    AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET,
    AZURE_TENANT_ID,
    AZURE_BASE_URL,
  } = process.env;

  try {
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: AZURE_CLIENT_ID,
        scope: `${AZURE_BASE_URL}/.default`,
        client_secret: AZURE_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    console.log('TOKEN: ', tokenResponse.data.access_token);
    res.status(200).json({ token: tokenResponse.data.access_token });
  } catch (err) {
    console.log('ERROR: ', err);
    res.status(500).json({ error: 'Failed to get token ' });
  }
}

async function getIsochrone(req, res) {
  const {
    model,
    lat,
    lon,
    batteryCharge,
    weatherConditionDifferential,
    passengerDifferential,
  } = req.query;

  const battery = Number(batteryCharge);
  const weatherCondition = Number(weatherConditionDifferential);
  const passengers = Number(passengerDifferential);

  try {
    const car = await Ev.getEvByModel(model);
    if (!car.data) {
      throw new Error('Ev model not found');
    }

    const { top_speed_kmh, combined_wltp_range_km } = car.data;

    const distanceBudgetInMeters =
      combined_wltp_range_km * 1000 * battery * weatherCondition * passengers;

    const params = {
      'api-version': '1.0',
      query: `${lat},${lon}`,
      distanceBudgetInMeters,
      'subscription-key': subscriptionKey,
      vehicleMaxSpeed: top_speed_kmh,
      traffic: true,
    };

    const response = await axios.get(
      `${process.env.AZURE_BASE_URL}/route/range/json`,
      {
        params,
      }
    );
    res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    res.status(404).json({ error: 'Unable to fetch isochrone data' });
  }
}

module.exports = { getAzureToken, getIsochrone };
