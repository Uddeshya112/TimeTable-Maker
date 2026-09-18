import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const deptShort = batch.department.substring(0, 7).toUpperCase();\n        const sectionName = `${deptShort}-S${s}`;',
  `const deptShort = batch.groupNumber ? batch.groupNumber.toUpperCase() : batch.department.substring(0, 7).toUpperCase();
        const sectionName = \`\${deptShort}-S\${s}\`;`
);

fs.writeFileSync('server.ts', code);
