# RangeIQ Database

## Overview

The RangeIQ database powers a platform for electric vehicle (EV) enthusiasts and trip planners. It stores user profiles, a comprehensive catalog of EV models, geospatial map requests, and calculated isochrone coverage areas. Whether you’re exploring EV options, planning journeys, or visualizing reachable areas, this database provides the data backbone.

## Features

* **User Management**: Secure storage of user credentials, start locations, admin flags, and journey histories.
* **EV Catalog**: Detailed EV model specifications, including range, battery capacity, efficiency, charging capabilities, and images.
* **Map Requests**: Tracks geolocation-based map queries per user with timestamps.
* **Isochrone Generation**: Stores calculated drive-time polygons (geoJSON) for EVs based on requested locations.

## Getting Started

Use these instructions to set up the RangeIQ database locally for development and testing.

### Prerequisites

* **PostgreSQL** version 12 or higher
* **psql** command-line tool
* **Node.js** (for API server)
* **Docker** (optional, for containerized setups)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/rangeiq-db.git
   cd rangeiq-db
   ```
2. **Configure environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env to set DATABASE_URL or individual DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
   ```
3. **Initialize the database schema and seed data**:

   ```bash
   # Using psql
   psql $DATABASE_URL -f setup.sql
   psql $DATABASE_URL -f seed_ev_data.sql
   ```

   Or, with Docker Compose:

   ```bash
   docker-compose up -d
   ```

## Database Schema

Below is an overview of the main tables and their key columns:

| Table            | Description                                       | Key Columns                                                                                                                                    |
| ---------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **users**        | Stores user accounts, credentials, start location | id (PK), username, email, password, isAdmin, start\_location, journeys                                                                         |
| **ev**           | Catalog of electric vehicles                      | ev\_id (PK), brand, model, combined\_wltp\_range\_km, battery\_capacity\_kwh, efficiency\_kmkwh, fast\_charge\_kmh, plug\_type, ev\_car\_image |
| **map\_request** | User-submitted map queries (latitude/longitude)   | request\_id (PK), user\_id (FK), latitude, longitude, requested\_at                                                                            |
| **isochrone**    | Calculated drive-time polygons for EVs            | isochrone\_id (PK), request\_id (FK), ev\_id (FK), range\_meters, geojson\_data, generated\_at                                                 |

*Consider adding an ER diagram here for visual reference.*

## API Endpoints

The RangeIQ API provides endpoints to interact with EV data and user management. All routes are prefixed with `/api`.

### EV Routes

| Method | Endpoint               | Description                             |
| ------ | ---------------------- | --------------------------------------- |
| GET    | `/api/ev`              | Retrieve all EV models.                 |
| GET    | `/api/ev/brand/:brand` | Retrieve EV models by brand name.       |
| GET    | `/api/ev/model/:model` | Retrieve details for a single EV model. |

### User Routes

| Method | Endpoint            | Description                            |
| ------ | ------------------- | -------------------------------------- |
| GET    | `/api/users`        | List all users.                        |
| GET    | `/api/users/:id`    | Get a user by their ID.                |
| PATCH  | `/api/users/:id`    | Update a user's profile.               |
| DELETE | `/api/users/:id`    | Delete a user account.                 |
| POST   | `/api/users/signup` | Create a new user account (signup).    |
| POST   | `/api/users/login`  | Authenticate and obtain a JWT (login). |

### Example Requests

#### Signup

```bash
curl -X POST https://your-domain.com/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jdoe",
    "email": "jdoe@example.com",
    "password": "StrongPass123",
    "start_location": "London, UK"
}'
```

*Response:*

```json
{
  "id": 7,
  "username": "jdoe",
  "email": "jdoe@example.com",
  "start_location": "London, UK",
  "isAdmin": false,
  "journeys": []
}
```

#### Login

```bash
curl -X POST https://your-domain.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jdoe",
    "password": "StrongPass123"
}'
```

*Response:*

```json
{
  "success": true,
  "token": "<JWT_TOKEN>",
  "userId": 7,
  "start_location": "London, UK"
}
```

## Usage Examples

### Query all EV models with WLTP range over 500 km:

```sql
SELECT brand, model, combined_wltp_range_km
FROM ev
WHERE combined_wltp_range_km > 500
ORDER BY combined_wltp_range_km DESC;
```

### Fetch latest isochrone polygon for a specific user request:

```sql
SELECT i.geojson_data, i.generated_at
FROM isochrone i
JOIN map_request m ON i.request_id = m.request_id
WHERE m.user_id = 42
ORDER BY i.generated_at DESC
LIMIT 1;
```

### Backup the database:

```bash
pg_dump --format=c --file=rangeiq_backup.dump $DATABASE_URL
```

## Configuration

List of environment variables and defaults:

| Variable      | Description         | Default       |
| ------------- | ------------------- | ------------- |
| DATABASE\_URL | Full connection URI |               |
| DB\_HOST      | Database host       | localhost     |
| DB\_PORT      | Database port       | 5432          |
| DB\_NAME      | Database name       | rangeiq       |
| DB\_USER      | Database username   | rangeiq\_user |
| DB\_PASSWORD  | Database password   | changeme      |

