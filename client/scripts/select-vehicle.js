document.getElementById("vehicle-dropdown").addEventListener("change", function() {
    const selectedModel = this.value;
    localStorage.setItem("carModel", selectedModel);
    console.log("Selected car model saved to LS:", localStorage.getItem("carModel"));
});




