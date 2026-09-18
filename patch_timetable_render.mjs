import fs from 'fs';
let code = fs.readFileSync('src/components/CoordinatorView.tsx', 'utf8');

// List view
code = code.replace(
  "{slot.facultyId ? `Prof. ${slot.facultyId}` : 'No Faculty'}",
  "{slot.facultyId ? `Prof. ${setupData?.faculty?.find((f: any) => f.id === slot.facultyId)?.name || slot.facultyId}` : 'No Faculty'}"
);

// Matrix view
code = code.replace(
  '<div className="text-slate-500 mt-1 truncate" title={slot.facultyId}>{slot.facultyId}</div>',
  '<div className="text-slate-500 mt-1 truncate" title={slot.facultyId}>{setupData?.faculty?.find((f: any) => f.id === slot.facultyId)?.name || slot.facultyId}</div>'
);

fs.writeFileSync('src/components/CoordinatorView.tsx', code);
