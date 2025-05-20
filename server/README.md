**README - Server**

This README relates to the server-side (API) microservice of the overall RangeIQ application. The server handles HTTP requests and responses from the client, allowing for CRUD functionality on the user database, and three different read functions for the EV database. The server directory also contains middleware to log the ReqRes cycle, and provide JWT-powered authentication for the user login process.

**Installation**

Once you've cloned the repository into your local environment, you must first instantiate a .env file (add it to your .gitignore) and populate it with the following environment variables:

- NODE_ENV
    - This can be either 'test', 'development' or 'production'
    - If 'test' or 'development', you will also need a connection URL for an external database, for which we recommend Supabase. This variable needs to be saved as SUPABASE_URL
    - If 'production', you need to provide the external database name, host, user, password and port (the necessary variables are visible in /db/connect.js)
- API Port (saved to variable PORT; we recommend 3000)
- POSTGRES_DB=rangeiq
- POSTGRES_PASSWORD=docker
- BCRYPT_SALT_ROUNDS, representing the complexity of the password encryption; we recommend setting this to 10
- SECRET_TOKEN, for JWT authentication (see [here](https://dev.to/tkirwa/generate-a-random-jwt-secret-key-39j4) for details on how generate your secret token)

Once you've set these environment variables, run the following commands:

```
npm install
npm run setup-db
npm run test
npm run start
```

These scripts install the necessary dependencies, set up the database connection using the environment variables, runs the unit test suite and then starts the server. Each of these steps needs to be executed withour error before the next can function properly.

Providing that nothing has crashed, the server should now be live and ready to recieve HTTP requests. You can test this in Postman or another API testing tool, against localhost:3000/


**Containerisation**

To containerise the API microservice and push the image to the Registry, navigate to the root directory containing the Dockerfile and run:

```
docker build -t [your-docker-username]/[your-image-tag] .

docker push [your-docker-username]/[your-image-tag]
```

<i>If you receive an error stating that 'requested access to the resource is denied', make sure you are both logged in and that your Docker username is correct in the image tag.</i>

You'll then be able to run the server microservice as a container with:
```
docker run -d [your-docker-username]/[your-image-tag]
```
<i>The -d flag runs the container in detached mode.</i>


<b>License: MIT</b>