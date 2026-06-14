const fs = require('fs');
const path = 'C:\\Users\\august\\.gemini\\antigravity\\brain\\a9d3f26e-70b7-4b6c-b2c8-45cfa1ca1ffb\\scratch\\findrealestate_all_cleaned.css';

if (!fs.existsSync(path)) {
  console.log('File does not exist:', path);
  process.exit(1);
}

const css = fs.readFileSync(path, 'utf8');
console.log('Size of findrealestate_all_cleaned.css:', css.length, 'bytes');

const terms = ['about-page', 'agents-page', 'search-page', 'listing-card', 'about-page_row', 'why-us_preview', 'hero_house'];
terms.forEach(term => {
  let count = 0;
  let pos = css.indexOf(term);
  while (pos !== -1) {
    count++;
    pos = css.indexOf(term, pos + 1);
  }
  console.log(`Found ${count} occurrences of "${term}"`);
});
