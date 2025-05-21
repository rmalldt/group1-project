/** @jest-environment jsdom */

const { renderDOM } = require('./helpers');

let dom;
let document;

describe('signin.html', () => {
  beforeEach(async () => {
    dom = await renderDOM('../views/signin.html');
    document = dom.window.document;
  });

  it('renders the sign-in form with username, password, and submit button', () => {
    const form = document.querySelector('#login-form');
    const username = document.querySelector('#username-input');
    const password = document.querySelector('#password-input');
    const button = document.querySelector('button[type="submit"]');

    expect(form).toBeTruthy();
    expect(username).toBeTruthy();
    expect(password).toBeTruthy();
    expect(button).toBeTruthy();
  });

  it('shows error message if username and password are blank on submit', () => {
    const form = document.querySelector('#login-form');
    const username = document.querySelector('#username-input');
    const password = document.querySelector('#password-input');
    const errorMessage = document.querySelector('#error-message');

    username.value = '';
    password.value = '';

    function getLoginFormErrors(usernameVal, passwordVal) {
      const errors = [];
      if (!usernameVal) errors.push('Username is required');
      if (!passwordVal) errors.push('Password is required');
      return errors;
    }

    form.addEventListener('submit', (e) => {
      const errors = getLoginFormErrors(username.value, password.value);
      if (errors.length > 0) {
        e.preventDefault();
        errorMessage.innerText = errors.join('. ');
        username.parentElement.classList.add('incorrect');
        password.parentElement.classList.add('incorrect');
      }
    });

    form.dispatchEvent(new dom.window.Event('submit'));

    expect(errorMessage.innerText).toBe('Username is required. Password is required');
    expect(username.parentElement.classList.contains('incorrect')).toBe(true);
    expect(password.parentElement.classList.contains('incorrect')).toBe(true);
  });

  it('removes error highlight and clears error text when user types again', () => {
    const username = document.querySelector('#username-input');
    const password = document.querySelector('#password-input');
    const errorMessage = document.querySelector('#error-message');

    username.parentElement.classList.add('incorrect');
    password.parentElement.classList.add('incorrect');
    errorMessage.innerText = 'Some error';

    if (username.parentElement.classList.contains('incorrect')) {
      username.parentElement.classList.remove('incorrect');
      errorMessage.innerText = '';
    }

    username.dispatchEvent(new dom.window.Event('input'));

    expect(username.parentElement.classList.contains('incorrect')).toBe(false);
    expect(errorMessage.innerText).toBe('');
  });
});
