const fs = require('fs');
let txt = fs.readFileSync('src/index.css', 'utf8');

txt = txt.replace(
  'grid-template-columns: 480px minmax(0, 1fr) !important;',
  'grid-template-columns: minmax(500px, 45%) minmax(0, 1fr) !important;'
);

fs.writeFileSync('src/index.css', txt);
console.log('Fixed Canvas layout in index.css!');
