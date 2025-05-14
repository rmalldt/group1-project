require('dotenv').config();
const express = require('express');
const db = require('./connect'); // your connect.js exports a pg Pool

const app = express();
app.use(express.json());


app.get('/api/ev/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT combined_wltp_range_km,
              top_speed_kmh,
              battery_capacity_kwh,
              efficiency_kmkwh,
              weight_kg
       FROM ev
       WHERE ev_id = $1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
