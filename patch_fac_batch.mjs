import fs from 'fs';
let code = fs.readFileSync('src/components/CoordinatorView.tsx', 'utf8');

// 1. Modify states
code = code.replace(
  "const [newFaculty, setNewFaculty] = useState({ name: '', department: '' });",
  "const [newFaculty, setNewFaculty] = useState({ name: '', department: '', subjects: [] as string[] });"
);

code = code.replace(
  "const [newBatch, setNewBatch] = useState({ groupNumber: '', department: '', totalStudents: '', subgroups: '' });",
  "const [newBatch, setNewBatch] = useState({ groupNumber: '', department: '', totalStudents: '', subgroups: '', subgroupNames: [] as string[] });"
);

// 2. Modify resets
code = code.replace(
  "if (type === 'faculty') setNewFaculty({ name: '', department: '' });",
  "if (type === 'faculty') setNewFaculty({ name: '', department: '', subjects: [] });"
);
code = code.replace(
  "if (type === 'batch') setNewBatch({ groupNumber: '', department: '', totalStudents: '', subgroups: '' });",
  "if (type === 'batch') setNewBatch({ groupNumber: '', department: '', totalStudents: '', subgroups: '', subgroupNames: [] });"
);
code = code.replace(
  "if (type === 'faculty') { setEditFacultyId(item.id); setNewFaculty(item); }",
  "if (type === 'faculty') { setEditFacultyId(item.id); setNewFaculty({ ...item, subjects: item.subjects || [] }); }"
);
code = code.replace(
  "if (type === 'batch') { setEditBatchId(item.id); setNewBatch({ ...item, subgroups: item.subgroups || item.sections || '' }); }",
  "if (type === 'batch') { setEditBatchId(item.id); setNewBatch({ ...item, subgroups: item.subgroups || item.sections || '', subgroupNames: item.subgroupNames || [] }); }"
);
code = code.replace(
  "if (type === 'faculty') { setEditFacultyId(null); setNewFaculty({ name: '', department: '' }); }",
  "if (type === 'faculty') { setEditFacultyId(null); setNewFaculty({ name: '', department: '', subjects: [] }); }"
);
code = code.replace(
  "if (type === 'batch') { setEditBatchId(null); setNewBatch({ groupNumber: '', department: '', totalStudents: '', subgroups: '' }); }",
  "if (type === 'batch') { setEditBatchId(null); setNewBatch({ groupNumber: '', department: '', totalStudents: '', subgroups: '', subgroupNames: [] }); }"
);

fs.writeFileSync('src/components/CoordinatorView.tsx', code);
