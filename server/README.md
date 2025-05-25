# README - Server

This README relates to the server-side (API) microservice of the overall RangeIQ application. The server handles HTTP requests and responses from the client, allowing for CRUD functionality on the user database, and three different read functions for the EV database. The server directory also contains middleware to log the ReqRes cycle, and provide JWT-powered authentication for the user login process.

---

## Installation

Once you've cloned the repository into your local environment, you must first create a `.env` file (add it to your `.gitignore`) and populate it with the following environment variables:

### **Required Environment Variables**

- **NODE_ENV**  
  Can be either `test`, `development`, or `production`.
- **PORT**  
  The port the API will run on (e.g., `3000`).
- **DB_USER**  
  Database username (e.g., `postgres`).
- **DB_HOST**  
  Database host (e.g., `rangeiq-db` or your DB host URL).
- **DB_NAME**  
  Database name (e.g., `rangeiq`).
- **DB_PASSWORD**  
  Database password (e.g., `docker`).
- **DB_PORT**  
  Database port (e.g., `5432`).
- **SUPABASE_URL**  
  Connection URL for an external database (used in development/testing).
- **POSTGRES_DB**  
  Name of the Postgres database (e.g., `rangeiq`).
- **POSTGRES_PASSWORD**  
  Password for the Postgres database (e.g., `docker`).
- **BCRYPT_SALT_ROUNDS**  
  Complexity of password encryption (e.g., `10` or `12`).
- **SECRET_TOKEN**  
  Secret key for JWT authentication (see [here](https://dev.to/tkirwa/generate-a-random-jwt-secret-key-39j4) for details on how to generate your secret token).
- **AZURE_CLIENT_ID**  
  Azure Maps client ID.
- **AZURE_CLIENT_SECRET**  
  Azure Maps client secret.
- **AZURE_TENANT_ID**  
  Azure tenant ID.
- **AZURE_SUBKEY**  
  Azure Maps subscription key.
- **AZURE_BASE_URL**  
  Azure Maps base URL (e.g., `https://atlas.microsoft.com`).

> **Tip:** Only include the Azure variables if you are using Azure Maps features.

---

## Setup & Usage

Once you've set these environment variables, run the following commands:

```sh
npm install
npm run setup-db
npm run test
npm run start
```

These scripts will:
- Install the necessary dependencies
- Set up the database connection using the environment variables
- Run the unit test suite
- Start the server

Each of these steps needs to be executed without error before the next can function properly.

If everything is successful, the server should now be live and ready to receive HTTP requests. You can test this in Postman or another API testing tool, against `http://localhost:3000/`.

---

## API Endpoints

Below is a summary of the main API endpoints. All endpoints return JSON.

### **Root**
- `GET /`  
  Returns API information.

### **User Endpoints**
- `POST /users/register`  
  Register a new user.  
  **Body:** `{ username, password, ... }`
- `POST /users/login`  
  Authenticate a user and receive a JWT token.  
  **Body:** `{ username, password }`
- `GET /users/:id`  
  Get user details by ID.  
  **Headers:** `Authorization: <token>`

### **EV Endpoints**
- `GET /evs`  
  Get all EVs.
- `GET /evs/model/:model`  
  Get EV details by model.
- `GET /evs/brand/:brand`  
  Get EVs by brand.

### **Map Endpoints**
- `GET /maps/isochrone`  
  Get isochrone data from Azure Maps API (requires query parameters).

> **Note:** Some endpoints require JWT authentication. Pass the token in the `Authorization` header.

---

## Test coverage

To run the test suite and see the coverage:

```sh
npm run coverage
```

- Tests are located in the `/__tests__` subdirectory.

---

## Troubleshooting

- **Server won't start / crashes immediately:**  
  - Check that all required environment variables are set in your `.env` file.
  - Ensure your database is set up  and accessible with the credentials provided.

- **Database connection errors:**  
  - Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`, and `DB_NAME` are correct.
  - For Supabase, ensure `SUPABASE_URL` is valid.

- **JWT or authentication errors:**  
  - Make sure `SECRET_TOKEN` is set and matches between server and client.
  - Ensure you are sending the JWT in the `Authorization` header for protected routes.

- **Port conflicts:**  
  - Make sure nothing else is running on the port specified in `PORT`.

- **Azure Maps errors:**  
  - Ensure all Azure-related environment variables are set if using mapping features.

---

## Containerisation

To containerise the API microservice and push the image to the Registry, navigate to the root directory containing the Dockerfile and run:

```sh
docker build -t [your-docker-username]/[your-image-tag] .
docker push [your-docker-username]/[your-image-tag]
```

<i>If you receive an error stating that 'requested access to the resource is denied', make sure you are both logged in and that your Docker username is correct in the image tag.</i>

You'll then be able to run the server microservice as a container with:

```sh
docker run -d [your-docker-username]/[your-image-tag]
```
<i>The -d flag runs the container in detached mode.</i>

---

<b>License: MIT</b>