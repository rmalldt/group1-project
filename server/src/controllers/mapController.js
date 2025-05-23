require('dotenv').config();
const axios = require('axios');
const NodeCache = require('node-cache');
const Ev = require('../models/evModel');

const tokenCache = new NodeCache({ stdTTL: 3600 }); // cache valid for 1hr

async function getAzureToken(req, res) {
  const {
    AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET,
    AZURE_TENANT_ID,
    AZURE_BASE_URL,
  } = process.env;

  let token = tokenCache.get('azure_token');
  if (token) {
    return res.status(200).json({ token: token });
  }

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

    token = tokenResponse.data.access_token;
    tokenCache.set('azure_token', token, tokenResponse.data.expires_in - 120); // expire 2 min before the original token expires
    res.status(200).json({ token: token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get token' });
  }
}

async function getIsochrone(req, res) {
  const { AZURE_SUBKEY, AZURE_BASE_URL } = process.env;

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
      'subscription-key': AZURE_SUBKEY,
      vehicleMaxSpeed: top_speed_kmh,
      traffic: true,
    };

    const response = await axios.get(`${AZURE_BASE_URL}/route/range/json`, {
      params,
    });
    res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    res.status(404).json({ error: 'Unable to fetch isochrone data' });
  }
}

async function getChargingStations(req, res) {
  const { AZURE_SUBKEY, AZURE_BASE_URL } = process.env;

  const { lat, lon } = req.query;

  const params = {
    'api-version': '1.0',
    query: 'charging station',
    lat: lat,
    lon: lon,
    radius: '100000',
    limit: '100',
    'subscription-key': AZURE_SUBKEY,
  };

  try {
    const response = await axios.get(
      `${AZURE_BASE_URL}/search/poi/category/json`,
      {
        params,
      }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    res.status(404).json({ error: 'Unable to fetch charging stations data' });
  }
}

module.exports = { getAzureToken, getIsochrone, getChargingStations };
