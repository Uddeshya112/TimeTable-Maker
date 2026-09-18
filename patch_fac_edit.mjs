import fs from 'fs';
let code = fs.readFileSync('src/components/CoordinatorView.tsx', 'utf8');
code = code.replace(
  "if (type === 'faculty') { setEditFacultyId(item.id); setNewFaculty({ ...item, subjects: item.subjects || [] }); }",
  "if (type === 'faculty') { setEditFacultyId(item.id); setNewFaculty({ name: item.name, department: item.department, subjects: item.subjects || [] }); }"
);
fs.writeFileSync('src/components/CoordinatorView.tsx', code);
