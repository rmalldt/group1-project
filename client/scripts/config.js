const EC2_API_URL = ""; // API entrypoint URL goes here (eg. http://ec2-12-34-56-78.compute-1.amazonaws.com:3000)

export const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : EC2_API_URL;