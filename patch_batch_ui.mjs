import fs from 'fs';
let code = fs.readFileSync('src/components/CoordinatorView.tsx', 'utf8');

const batchUI = `
                  <div className="flex gap-2">
                    <input type="number" placeholder="Total Students" className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newBatch.totalStudents} onChange={e => setNewBatch({...newBatch, totalStudents: e.target.value})} />
                    <input type="number" placeholder="Sub-groups (e.g. 4)" className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newBatch.subgroups || newBatch.sections || ''} onChange={e => {
                      const val = e.target.value;
                      const count = parseInt(val) || 0;
                      const names = newBatch.subgroupNames || [];
                      const newNames = Array.from({length: count}, (_, i) => names[i] || \`\${newBatch.groupNumber ? newBatch.groupNumber.toUpperCase() : 'SG'}-\${i+1}\`);
                      setNewBatch({...newBatch, subgroups: val, subgroupNames: newNames});
                    }} />
                  </div>
                  {(parseInt(newBatch.subgroups) > 0) && (
                    <div className="border rounded-md p-2 bg-slate-50 space-y-2 max-h-32 overflow-y-auto">
                      <p className="text-xs font-medium text-slate-500">Name Sub-groups</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({length: parseInt(newBatch.subgroups)}).map((_, i) => (
                          <input 
                            key={i}
                            type="text" 
                            className="w-full h-8 rounded border border-input bg-background px-2 py-1 text-xs" 
                            value={newBatch.subgroupNames?.[i] || ''}
                            onChange={(e) => {
                              const names = [...(newBatch.subgroupNames || [])];
                              names[i] = e.target.value;
                              setNewBatch({...newBatch, subgroupNames: names});
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
`;

code = code.replace(
  /<div className="flex gap-2">[\s\S]*?<input type="number" placeholder="Total Students"[\s\S]*?<input type="number" placeholder="Sub-groups \(e\.g\. 4\)"[\s\S]*?<\/div>/,
  batchUI.trim()
);

fs.writeFileSync('src/components/CoordinatorView.tsx', code);
