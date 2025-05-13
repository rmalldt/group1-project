-- USER
CREATE TABLE app_user (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL
);

-- EV DATA
CREATE TABLE ev (
    ev_id SERIAL PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    top_speed_kmh INT NOT NULL,
    combined_wltp_range_km NUMERIC NOT NULL,
    battery_capacity_kwh NUMERIC NOT NULL,
    efficiency_kmkwh NUMERIC NOT NULL,
    fast_charge_kmh NUMERIC NOT NULL,
    rapid_charge TEXT NOT NULL,
    powertrain TEXT NOT NULL,
    plug_type TEXT NOT NULL,
    ev_car_image TEXT NOT NULL
);

-- MAP REQUEST
CREATE TABLE map_request (
    request_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ISOCHRONE
CREATE TABLE isochrone (
    isochrone_id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES map_request(request_id) ON DELETE CASCADE,
    ev_id INT NOT NULL REFERENCES ev(ev_id),
    range_meters INT NOT NULL,
    geojson_data TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);