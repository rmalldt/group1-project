document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault(); 

  const form = new FormData(e.target);

    const options = {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: form.get("email"),
      password: form.get("password")
    })
  };

            const response = await fetch("http://localhost:3000/users/login", options);
            const data = await response.json();

            if (response.status === 200 && data.token) {
            // Save JWT in localStorage
            localStorage.setItem("token", data.token);

            alert("Login successful!");
            window.location.assign("./select-vehicle.html"); 
        } else {
            alert(data.error || "Login failed.");
        }
});

    const form = document.getElementById('login-form')
    const emailInput = document.getElementById('email-input')
    const passwordInput = document.getElementById('password-input')
    const errorMessage = document.getElementById('error-message')


    form.addEventListener('submit', (e) => {
        // calling the validation logic
        let errors = getLoginFormErrors(emailInput.value, passwordInput.value)

        if(errors.length > 0){
            e.preventDefault()
            errorMessage.innerText = errors.join(". ")
        }
   });


    function getLoginFormErrors(email, password){
    let errors = []

    if(email === '' || email === null){
        errors.push('Email is required')
        emailInput.parentElement.classList.add('incorrect')
    }

    if(password === '' || password === null){
        errors.push('Password is required')
        passwordInput.parentElement.classList.add('incorrect')
    }

    return errors
    };

    // removes input highlighting when typing
    const allInputs = [emailInput, passwordInput]
    allInputs.forEach(input => {
    input.addEventListener('input', () => {
        if(input.parentElement.classList.contains('incorrect')){
        input.parentElement.classList.remove('incorrect')
        errorMessage.innerText = ''
        }
    })
})