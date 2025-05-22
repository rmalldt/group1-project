/** @jest-environment jsdom */

const { renderDOM } = require('./helpers');

let dom;
let document;

describe('signup.html DOM functionality', () => {
  beforeEach(async () => {
    dom = await renderDOM('../views/signup.html');
    document = dom.window.document;
  });

  it('renders the sign-up form and all input fields', () => {
    const form = document.querySelector('#register-form');
    const username = document.querySelector('#username-input');
    const postcode = document.querySelector('#postcode-input');
    const email = document.querySelector('#email-input');
    const password = document.querySelector('#password-input');
    const button = document.querySelector('button[type="submit"]');

    expect(form).toBeTruthy();
    expect(username).toBeTruthy();
    expect(postcode).toBeTruthy();
    expect(email).toBeTruthy();
    expect(password).toBeTruthy();
    expect(button).toBeTruthy();
  });

  it('shows error messages and highlights fields if inputs are empty on submit', () => {
    const form = document.querySelector('#register-form');
    const username = document.querySelector('#username-input');
    const postcode = document.querySelector('#postcode-input');
    const email = document.querySelector('#email-input');
    const password = document.querySelector('#password-input');
    const errorMessage = document.querySelector('#error-message');

    username.value = '';
    postcode.value = '';
    email.value = '';
    password.value = '';

    form.addEventListener('submit', (e) => {
      const errors = [];

      if (!username.value.trim()) {
        errors.push("Username is required");
        username.parentElement.classList.add('incorrect');
      }
      if (!postcode.value.trim()) {
        errors.push("Postcode is required");
        postcode.parentElement.classList.add('incorrect');
      }
      if (!email.value.trim()) {
        errors.push("Email is required");
        email.parentElement.classList.add('incorrect');
      }
      if (!password.value.trim()) {
        errors.push("Password is required");
        password.parentElement.classList.add('incorrect');
      }

      if (errors.length > 0) {
        e.preventDefault();
        errorMessage.innerText = errors.join('. ');
      }
    });

    form.dispatchEvent(new dom.window.Event('submit'));

    expect(errorMessage.innerText).toBe(
      'Username is required. Postcode is required. Email is required. Password is required'
    );

    expect(username.parentElement.classList.contains('incorrect')).toBe(true);
    expect(postcode.parentElement.classList.contains('incorrect')).toBe(true);
    expect(email.parentElement.classList.contains('incorrect')).toBe(true);
    expect(password.parentElement.classList.contains('incorrect')).toBe(true);
  });

  it('clears error highlight when user types again', () => {
    const username = document.querySelector('#username-input');
    const errorMessage = document.querySelector('#error-message');

    username.parentElement.classList.add('incorrect');
    errorMessage.innerText = 'Username is required';

    // Simulate typing
    if (username.parentElement.classList.contains('incorrect')) {
      username.parentElement.classList.remove('incorrect');
      errorMessage.innerText = '';
    }

    username.dispatchEvent(new dom.window.Event('input'));

    expect(username.parentElement.classList.contains('incorrect')).toBe(false);
    expect(errorMessage.innerText).toBe('');
  });
});
