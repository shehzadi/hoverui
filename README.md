# Hover UI

## Deploying using Docker
  1. Clone hoverui git repository
  2. Install Docker
  3. Build Docker image
    * `docker build -t hoverui .`
  4. Run Docker image
    * `docker run hoverui`
  5. Open Hover UI in browser
    * Use `docker ps` and `docker network inspect bridge` to see what IP address the server is listening on
  
