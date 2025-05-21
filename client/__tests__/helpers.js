const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const path = require('path');
const fs = require('fs'); // 
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const renderDOM = async (htmlPath) => {
  const filePath = path.resolve(__dirname, htmlPath);
  const html = fs.readFileSync(filePath, 'utf8');
  return new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
};

module.exports = { renderDOM };
