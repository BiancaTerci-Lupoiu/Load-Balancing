# Load Balancing a Node.js App

This project demonstrates how to set up load balancing for a simple Node.js app using Docker and Nginx. We'll use Docker Compose to containerize the Node.js app and configure Nginx as a reverse proxy to distribute traffic across multiple app instances.

## Steps to Configure Load Balancing

### Prerequisites

- **Docker**: Ensure Docker is installed on your machine. You can download it from [here](https://www.docker.com/get-started).
- **Docker Compose**: Docker Compose is used to define and run multi-container Docker applications. It usually comes with Docker Desktop, but if you need to install it separately, you can find instructions [here](https://docs.docker.com/compose/install/).
- A simple Node.js app

### Step 1: Create the Dockerfile for the Node.js App

Ensure you have a `Dockerfile` for your Node.js app in the root directory of your project. Here's an example `Dockerfile`:

```dockerfile
# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy application files
COPY / .

# Install dependencies
RUN npm install express

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["node", "app.js"]
```

### Step 2: Create the Docker Compose File

1. **Create a `docker-compose.yml` file** in the root of your project directory with the following content:

   ```yaml
   services:
     app:
       build:
       context: .
       environment:
         - HOSTNAME=app
       expose:
         - '3000'
       deploy:
       replicas: 3
       restart_policy:
         condition: on-failure

     nginx:
       image: nginx:latest
       ports:
         - '8080:80'
       volumes:
         - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
       depends_on:
         - app
   ```

   - **`app` Service**: This defines the Node.js app container. It is scaled to 3 replicas to handle the traffic.
   - **`nginx` Service**: Nginx acts as a reverse proxy and load balancer, distributing traffic across the app instances.

### Step 3: Create the Nginx Configuration for Load Balancing

1. **Create an `nginx` directory** in the root of your project.

2. **Create the `nginx.conf` file** inside the `nginx` directory with the following content to configure Nginx for load balancing:

   ```nginx
   # nginx.conf

    events {}

    http {
        upstream app_cluster {
            server app:3000;
            server app:3000;
            server app:3000;
        }

        server {
            listen 80;

            location / {
                proxy_pass http://app_cluster;
            }
        }
    }

   ```

#### How Load Balancing Works?

- **Nginx** acts as the load balancer, listening on port 80 (mapped to 8080 on your host machine).
- When you send a request to http://localhost:8080, Nginx forwards the request to one of the instances defined in the `app_cluster` block.
- By default, Nginx uses a **round-robin algorithm**, meaning it distributes requests evenly across all instances.

#### Extra configurations

We can adjust how Nginx performs load balancing by modifying the nginx.conf file:

- **Weighted Load Balancing**
  We can assign weights to instances to control the distribution:

  ```nginx
  upstream app_cluster {
  server app:3000 weight=2; # This instance gets twice the traffic
  server app:3000;
  server app:3000;
  }
  ```

- **Least Connections**
  Distribute requests to the server with the fewest active connections:

  ```nginx
  upstream app_cluster {
  least_conn;
  server app:3000;
  server app:3000;
  server app:3000;
  }
  ```

### Step 4: Build and Start the Application

Run Docker Compose to build and start the containers:

```bash

docker-compose up --build
```

This will:

- Build the Docker images for both the Node.js app and Nginx.
- Start 3 replicas of the Node.js app and Nginx as a reverse proxy to distribute incoming traffic.

### Step 5: Verify Load Balancing

Once the containers are running, you can access your app via http://localhost:8080.

To test the load balancing:

- Open your browser and visit http://localhost:8080 multiple times.
- You should see the same response, but Nginx will distribute the traffic across the 3 instances of the Node.js app.
- You can add a unique identifier for each instance and return it in the response of the endpoint to see each instance processed the request.

  ```javascript
  const instanceId = `${os.hostname()}-${Math.random()
    .toString(36)
    .substr(2, 6)}`;

  app.get('/', (req, res) => {
    res.send(`Hello from instance: ${instanceId}`);
  });
  ```

You can also check the logs of the app containers to confirm the traffic distribution:

```bash
docker-compose logs -f app
```

### Step 6 :Stop the Application

To stop the Docker containers, run:

```bash
docker-compose down
```

This will stop and remove all containers defined in the `docker-compose.yml` file.

### Conclusion

In this guide, we demonstrated how to set up load balancing for a Node.js app using Docker and Nginx. By scaling the number of app replicas and using Nginx as a reverse proxy, you can distribute incoming traffic evenly across multiple app instances to improve performance and fault tolerance.
