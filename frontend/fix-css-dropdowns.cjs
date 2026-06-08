const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf-8');

const newCSS = `
.vc-dropdown-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.vc-dropdown-wrapper svg {
  position: absolute;
  right: 10px;
  pointer-events: none;
  opacity: 0.5;
}
.vc-custom-select {
  appearance: none;
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 99px;
  padding: 6px 32px 6px 14px;
  font-size: 13px;
  color: #333;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}
.vc-custom-select:hover {
  background: #e2e8f0;
}
.vc-custom-select:focus {
  border-color: #4684EE;
  background: #fff;
}
`;

if (!css.includes('.vc-dropdown-wrapper')) {
  css += newCSS;
  fs.writeFileSync('src/index.css', css);
}

