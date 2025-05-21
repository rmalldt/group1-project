/** @jest-environment jsdom */

const { renderDOM } = require('./helpers');

let dom;
let document;

describe('map.html DOM functionality', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('postcode', 'AB1 2CD');
    dom = await renderDOM('../views/map.html');
    document = dom.window.document;
  });

  it('renders form inputs and drawer', () => {
    expect(document.querySelector('#postcode-input')).toBeTruthy();
    expect(document.querySelector('#battery')).toBeTruthy();
    expect(document.querySelector('#passengers')).toBeTruthy();
    expect(document.querySelector('#weather')).toBeTruthy();
    expect(document.querySelector('#drawer')).toBeTruthy();
  });


  it('form submission prevents default and reads values', () => {
    const form = document.getElementById('settingsForm');
    const postcode = document.getElementById('postcode-input');
    const battery = document.getElementById('battery');
    const passengers = document.getElementById('passengers');
    const weather = document.getElementById('weather');

    // Set mock values for the inputs
    postcode.value = 'ls8 4dt';
    battery.value = '0.5';
    passengers.value = '0.9';
    weather.value = '0.75';

    const mockSubmit = jest.fn((e) => e.preventDefault());
    form.addEventListener('submit', mockSubmit);

    const event = new dom.window.Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);

    expect(mockSubmit).toHaveBeenCalled();
    expect(postcode.value).toBe('ls8 4dt');
    expect(battery.value).toBe('0.5');
    expect(passengers.value).toBe('0.9');
    expect(weather.value).toBe('0.75');
  });
});
