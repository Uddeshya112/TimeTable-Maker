import fs from 'fs';
let code = fs.readFileSync('src/components/CoordinatorView.tsx', 'utf8');

code = code.replace(
  /const \[newBatch, setNewBatch\] = useState\(\{ groupNumber: '', department: '', totalStudents: '', sections: '' \}\);/g,
  "const [newBatch, setNewBatch] = useState({ groupNumber: '', department: '', totalStudents: '', subgroups: '' });"
);

code = code.replace(
  /if \(type === 'batch'\) setNewBatch\(\{ groupNumber: '', department: '', totalStudents: '', sections: '' \}\);/g,
  "if (type === 'batch') setNewBatch({ groupNumber: '', department: '', totalStudents: '', subgroups: '' });"
);

code = code.replace(
  /if \(type === 'batch'\) \{ setEditBatchId\(item.id\); setNewBatch\(item\); \}/g,
  "if (type === 'batch') { setEditBatchId(item.id); setNewBatch({ ...item, subgroups: item.subgroups || item.sections || '' }); }"
);

code = code.replace(
  /if \(type === 'batch'\) \{ setEditBatchId\(null\); setNewBatch\(\{ groupNumber: '', department: '', totalStudents: '', sections: '' \}\); \}/g,
  "if (type === 'batch') { setEditBatchId(null); setNewBatch({ groupNumber: '', department: '', totalStudents: '', subgroups: '' }); }"
);

code = code.replace(
  /<span>\{b.sections\} Sections<\/span>/g,
  "<span>{b.subgroups || b.sections} Sub-groups</span>"
);

code = code.replace(
  /<input type="number" placeholder="Sections" (.*?) value=\{newBatch.sections\} onChange=\{e => setNewBatch\(\{\.\.\.newBatch, sections: e.target.value\}\)\} \/>/g,
  '<input type="number" placeholder="Sub-groups (e.g. 4)" $1 value={newBatch.subgroups || newBatch.sections || \'\'} onChange={e => setNewBatch({...newBatch, subgroups: e.target.value})} />'
);

code = code.replace(
  /!newBatch.sections/g,
  "!newBatch.subgroups"
);

fs.writeFileSync('src/components/CoordinatorView.tsx', code);
