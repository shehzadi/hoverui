# Hover UI
![alt tag](https://cloud.githubusercontent.com/assets/1617259/14193702/ecfeb024-f75b-11e5-9064-08c1fb8b4190.gif)
[Click here for sandbox](https://boiling-torch-3324.firebaseapp.com)
## Deploying using Docker
  1. Clone hoverui git repository
  2. Install Docker
  3. Build Docker image
    * `docker build -t hoverui .`
  4. Run Docker image
    * `docker run hoverui`
  5. Open Hover UI in browser
    * Use `docker ps` and `docker network inspect bridge` to see what IP address the server is listening on
  
