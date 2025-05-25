import { API_BASE_URL } from './config.js';

document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username-input');
    const startLocationInput = document.getElementById('postcode-input');
    const emailInput = document.getElementById('email-input')
    const passwordInput = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');

    const username = usernameInput.value.trim()
    const start_location = startLocationInput.value.trim()
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Check if there any errors
        const errors = [];
        if (username === '') {
            errors.push("Username is required");
            usernameInput.parentElement.classList.add('incorrect');
        }
        if (start_location === '') {
            errors.push("Postcode is required");
            startLocationInput.parentElement.classList.add('incorrect');
        }
        if (email === '') {
            errors.push("Email is required");
            emailInput.parentElement.classList.add('incorrect');
        }
        if (password === '') {
            errors.push("Password is required");
            passwordInput.parentElement.classList.add('incorrect');
        }

        if (errors.length > 0) {
            errorMessage.innerText = errors.join(". ");
            return; // dont sent if errors
        }

    // Send to the server
        const response = await fetch(`${API_BASE_URL}/users/signup`, {
            method: "POST",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, start_location, email, password })
        });


    const data = await response.json();

    if (response.status === 201) {
        alert("Registration successful! You can now log in.");
        window.location.assign("./signin.html");
    } else {
        errorMessage.innerText = data.error || "Registration failed.";
    };

})