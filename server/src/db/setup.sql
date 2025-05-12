DROP TABLE IF EXISTS app_user;

CREATE TABLE app_user (
  user_id INT GENERATED ALWAYS AS IDENTITY,
  username  TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
);

INSERT INTO app_user (username, email, password) 
VALUES ('alice', 'alice@example.com', 'Password123-');