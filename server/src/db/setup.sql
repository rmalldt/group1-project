DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS ev;
DROP TABLE IF EXISTS map_request;
DROP TABLE IF EXISTS isochrone;

-- USERS
CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT UNIQUE NOT NULL,
    start_location TEXT NOT NULL,
    isAdmin BOOLEAN DEFAULT FALSE,
    journeys INT[] DEFAULT '{}'
);

-- EV DATA
CREATE TABLE ev (
    ev_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
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

INSERT INTO ev (brand, model, top_speed_kmh, combined_wltp_range_km, battery_capacity_kwh, efficiency_kmkwh, fast_charge_kmh, rapid_charge, powertrain, plug_type, ev_car_image)
VALUES
('Audi', 'Q4 e-tron', 180, 520, 77, 6.75, 540, 'Yes', 'AWD', 'Type 2 CCS', 'https://rangeiq-bucket.s3.eu-west-2.amazonaws.com/evs/Audi_Q4_Sportback_e-tron.jpg'),
('Audi', 'e-tron GT', 240, 488, 93.4, 5.22, 850, 'Yes', 'AWD', 'Type 2 CCS', 'https://rangeiq-bucket.s3.eu-west-2.amazonaws.com/evs/Audi_e-tron_GT.jpg'),
('BMW', 'iX3', 180, 505, 80, 6.31, 560, 'Yes', 'RWD', 'Type 2 CCS', 'https://rangeiq-bucket.s3.eu-west-2.amazonaws.com/evs/BMW_iX3.jpg'),
('Kia', 'e-Niro 64 kWh', 167, 455, 64, 7.11, 350, 'Yes', 'FWD', 'Type 2 CCS', 'https://rangeiq-bucket.s3.eu-west-2.amazonaws.com/evs/Kia_e-Niro_64_kWh.jpg'),
('Tesla', 'Model 3 Standard Range Plus', 225, 448, 53.1, 8.44, 650, 'Yes', 'RWD', 'Type 2', 'https://rangeiq-bucket.s3.eu-west-2.amazonaws.com/evs/Tesla_Model_3_Long_Range_Dual_Motor.jpg'),
('Tesla', 'Model S Performance', 261, 730, 103, 7.09, 550, 'Yes', 'AWD', 'Type 2 CCS', 'https://rangeiq-bucket.s3.eu-west-2.amazonaws.com/evs/Tesla_Model_S_Performance.jpg');

-- MAP REQUEST
CREATE TABLE map_request (
    request_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ISOCHRONE
CREATE TABLE isochrone (
    isochrone_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id INT NOT NULL REFERENCES map_request(request_id) ON DELETE CASCADE,
    ev_id INT NOT NULL REFERENCES ev(ev_id),
    range_meters INT NOT NULL,
    geojson_data TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);