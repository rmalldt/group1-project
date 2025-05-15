const drawer = document.getElementById("drawer");
const toggleBtn = document.getElementById("toggleDrawer");

toggleBtn.addEventListener("click", () => {
  drawer.classList.toggle("open");
});

document.getElementById("settingsForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const passengers = document.getElementById("passengers").value;
  const battery = document.getElementById("battery").value;
  const weather = document.getElementById("weather").value;
  const startLocation = document.getElementById("startLocation").value.replace(/\s+/g, '').trim();

  console.log({ startLocation, passengers, battery, weather });

  drawer.classList.remove("open");
});

document.addEventListener('DOMContentLoaded', function () {
  // Azure Maps subscription key
  const subscriptionKey = 'FCwsnU80SGrtrUAFyWQ9HaqMRW7oE2nUrD2c7UWOtsz6L0YnVUcsJQQJ99BEAC5RqLJFfRFaAAAgAZMPGcrp';

  // 1. Initialize the map
  const map = new atlas.Map('myMap', {
    center: [-0.478, 51.586],
    zoom: 11,
    authOptions: {
      authType: 'subscriptionKey',
      subscriptionKey: subscriptionKey
    }
  });

});

