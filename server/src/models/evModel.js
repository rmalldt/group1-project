const db = require('../db/connect');

class Ev {
  constructor({
    ev_id,
    brand,
    model,
    top_speed_kmh,
    combined_wltp_range_km,
    battery_capacity_kwh,
    efficiency_kmkwh,
    fast_charge_kmh,
    rapid_charge,
    powertrain,
    plug_type,
    ev_car_image,
  }) {
    this.ev_id = ev_id;
    this.brand = brand;
    this.model = model;
    this.top_speed_kmh = top_speed_kmh;
    this.combined_wltp_range_km = combined_wltp_range_km;
    this.battery_capacity_kwh = battery_capacity_kwh;
    this.efficiency_kmkwh = efficiency_kmkwh;
    this.fast_charge_kmh = fast_charge_kmh;
    this.rapid_charge = rapid_charge;
    this.powertrain = powertrain;
    this.plug_type = plug_type;
    this.ev_car_image = ev_car_image;
  }

  static async getAll() {
    const response = await db.query(`SELECT * FROM ev;`);

    if (response.rows.length == 0) {
      return { data: null, message: 'EV not found' };
    }

    const data = response.rows.map(ev => new Ev(ev));
    return { data, message: null };
  }

  static async getAllByBrand(brand) {
    const response = await db.query(
      `SELECT * FROM ev WHERE LOWER(brand) = LOWER($1);`,
      [brand]
    );

    if (response.rows.length == 0) {
      return { data: null, message: 'EV not found' };
    }

    const data = response.rows.map(ev => new Ev(ev));
    return { data, message: null };
  }

  static async getEvByModel(model) {
    const response = await db.query(
      `SELECT * FROM ev WHERE LOWER(model) = LOWER($1);`,
      [model]
    );

    if (response.rows.length != 1) {
      return { data: null, message: 'EV not found' };
    }

    const ev = new Ev(response.rows[0]);
    return { data: ev, message: null };
  }
}

module.exports = Ev;
