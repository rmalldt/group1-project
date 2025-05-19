import { getVehicleStats } from "./map.js";

document.getElementById("vehicle-dropdown").addEventListener("change", async function () {
    const selectedModel = this.value;
    localStorage.setItem("carModel", selectedModel);
    console.log("Selected car model saved to LS:", localStorage.getItem("carModel"));
 
    const vehicleStats = await getVehicleStats(selectedModel);
    console.log("Vehicle stats:", vehicleStats);
 
    if (vehicleStats) {
        document.getElementById("car-image").src = vehicleStats.ev_car_image || "../assets/logo/car-placeholder.png";
        document.getElementById("car-range").textContent = vehicleStats.combined_wltp_range_km || "N/A";
        document.getElementById("car-manufacturer").textContent = vehicleStats.brand || "N/A";
    }
});