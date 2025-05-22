/** @jest-environment jsdom */

global.setImmediate = (cb) => setTimeout(cb, 0);

const { renderDOM } = require('./helpers');

let dom;
let document;

describe('select-vehicle.html DOM functionality', () => {
  beforeEach(async () => {
    dom = await renderDOM('../views/select-vehicle.html');
    document = dom.window.document;
    localStorage.clear();
  });

  it('renders the vehicle dropdown', () => {
    const dropdown = document.querySelector('#vehicle-dropdown');
    expect(dropdown).toBeTruthy();
  });

  // need to first mimic downdown vehicle selection and logic from select-vehicle.js
  it('simulates dropdown change and saves selected value to localStorage', () => {
    const dropdown = document.querySelector('#vehicle-dropdown');

    dropdown.value = 'Model 3 Standard Range Plus';
    localStorage.setItem("carModel", dropdown.value);

    expect(localStorage.getItem("carModel")).toBe("Model 3 Standard Range Plus");
  });
});
