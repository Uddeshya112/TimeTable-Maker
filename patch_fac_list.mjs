import fs from 'fs';
let code = fs.readFileSync('src/components/CoordinatorView.tsx', 'utf8');

const listUI = `
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{f.name}</span>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-slate-500 text-xs">{f.department}</span>
                          {f.subjects && f.subjects.length > 0 && (
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                              {f.subjects.length} Subjects
                            </span>
                          )}
                        </div>
                      </div>
`;

code = code.replace(
  /<div className="flex flex-col">[\s\S]*?<span className="font-medium text-sm">\{f.name\}<\/span>[\s\S]*?<span className="text-slate-500 text-xs">\{f.department\}<\/span>[\s\S]*?<\/div>/,
  listUI.trim()
);

fs.writeFileSync('src/components/CoordinatorView.tsx', code);
