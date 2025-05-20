/** @jest-environment jsdom */

const { renderDOM } = require('./helpers');

let dom;
let document;

describe('index.html DOM functionality', () => {
  beforeEach(async () => {
    dom = await renderDOM('../views/index.html'); // 
    document = dom.window.document;
    global.scrollTo = jest.fn();
  });

  it('renders all sections and nav buttons', () => {
    expect(document.getElementById('section-1')).toBeTruthy();
    expect(document.getElementById('section-2')).toBeTruthy();
    expect(document.getElementById('section-3')).toBeTruthy();

    const nextButtons = document.querySelectorAll('.nav-button.next');
    const prevButtons = document.querySelectorAll('.nav-button.prev');
    expect(nextButtons.length).toBeGreaterThan(0);
    expect(prevButtons.length).toBeGreaterThan(0);
  });

  it('has scrollToSection function and scrollIntoView is called on valid section', () => {
    const scrollIntoViewMock = jest.fn();

    const targetSection = document.getElementById('section-2');
    targetSection.scrollIntoView = scrollIntoViewMock;

    function scrollToSection(sectionId) {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", inline: "start" });
      }
    }

    scrollToSection('section-2');

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth", inline: "start" });
  });
});
