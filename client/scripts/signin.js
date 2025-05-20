// document.getElementById("login-form").addEventListener("submit", async (e) => {
//   e.preventDefault(); 

//   const form = new FormData(e.target);


//     const options = {
//     method: "POST",
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       username: form.get("username"),
//       password: form.get("password"),
//     })
//   };

//   const response = await fetch("http://localhost:3000/users/login", options);
//   const data = await response.json();

//   if (response.status === 200 && data.token) {
//     // Save JWT in localStorage
//     localStorage.setItem("token", data.token);
//     localStorage.setItem("userId", data.userId);
//     localStorage.setItem("postcode", data.start_location);

//     alert("Login successful!");
//     window.location.assign("./select-vehicle.html"); 
//   } else {
//     alert(data.error || "Login failed.");
//   }
// });

//   const form = document.getElementById('login-form')
//   const usernameInput = document.getElementById('username-input')
//   const passwordInput = document.getElementById('password-input')
//   const errorMessage = document.getElementById('error-message')


//   form.addEventListener('submit', (e) => {
//     // calling the validation logic
//     let errors = getLoginFormErrors(usernameInput.value, passwordInput.value)

//     if(errors.length > 0){
//       e.preventDefault()
//       errorMessage.innerText = errors.join(". ")
//       }
//    });


//   function getLoginFormErrors(username, password){
//     let errors = []

//     if(username === '' || username === null){
//         errors.push('Username is required')
//         usernameInput.parentElement.classList.add('incorrect')
//     }

//     if(password === '' || password === null){
//         errors.push('Password is required')
//         passwordInput.parentElement.classList.add('incorrect')
//     }

//     return errors
//     };

//     // removes input highlighting when typing
//     const allInputs = [usernameInput, passwordInput]
//     allInputs.forEach(input => {
//     input.addEventListener('input', () => {
//         if(input.parentElement.classList.contains('incorrect')){
//         input.parentElement.classList.remove('incorrect')
//         errorMessage.innerText = ''
//         }
//     })
// })

const form = document.getElementById('login-form')
const usernameInput = document.getElementById('username-input')
const passwordInput = document.getElementById('password-input')
const errorMessage = document.getElementById('error-message')

form.addEventListener("submit", async (e) => {
  e.preventDefault(); 

  // 🧠 Валідація
  let errors = getLoginFormErrors(usernameInput.value, passwordInput.value)
  if (errors.length > 0) {
    errorMessage.innerText = errors.join(". ");
    return; // 🛑 Не йти далі, якщо є помилки!
  }

  // 📨 Якщо все ок — відправляємо fetch-запит
  const options = {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: usernameInput.value,
      password: passwordInput.value,
    })
  };

  try {
    const response = await fetch("http://localhost:3000/users/login", options);
    const data = await response.json();

    if (response.status === 200 && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("postcode", data.start_location);

      alert("Login successful!");
      window.location.assign("./select-vehicle.html"); 
    } else {
      errorMessage.innerText = data.error || "Login failed.";
    }
  } catch (err) {
    errorMessage.innerText = "Something went wrong. Try again later.";
  }
});

// Функція валідації
function getLoginFormErrors(username, password){
  let errors = [];

  if (!username) {
    errors.push('Username is required');
    usernameInput.parentElement.classList.add('incorrect');
  }

  if (!password) {
    errors.push('Password is required');
    passwordInput.parentElement.classList.add('incorrect');
  }

  return errors;
}

// Зняття підсвітки
const allInputs = [usernameInput, passwordInput];
allInputs.forEach(input => {
  input.addEventListener('input', () => {
    if (input.parentElement.classList.contains('incorrect')) {
      input.parentElement.classList.remove('incorrect');
      errorMessage.innerText = '';
    }
  });
});
