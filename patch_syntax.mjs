import fs from 'fs';
let code = fs.readFileSync('src/components/CoordinatorView.tsx', 'utf8');
code = code.replace(
  "                >\n                >",
  "                >"
);
fs.writeFileSync('src/components/CoordinatorView.tsx', code);
