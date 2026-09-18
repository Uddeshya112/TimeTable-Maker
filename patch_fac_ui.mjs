import fs from 'fs';
let code = fs.readFileSync('src/components/CoordinatorView.tsx', 'utf8');

const facultyUI = `
                  <input type="text" placeholder="Name (e.g. Prof. Sharma)" className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newFaculty.name} onChange={e => setNewFaculty({...newFaculty, name: e.target.value})} />
                  <input type="text" placeholder="Department" className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newFaculty.department} onChange={e => setNewFaculty({...newFaculty, department: e.target.value})} />
                  
                  <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Assign Subjects (Optional)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {setupData?.courses?.map((c: any) => (
                        <label key={c.id} className="flex items-center space-x-2 text-xs">
                          <input 
                            type="checkbox" 
                            checked={newFaculty.subjects?.includes(c.id)}
                            onChange={(e) => {
                              const subs = newFaculty.subjects || [];
                              if (e.target.checked) setNewFaculty({...newFaculty, subjects: [...subs, c.id]});
                              else setNewFaculty({...newFaculty, subjects: subs.filter(s => s !== c.id)});
                            }}
                          />
                          <span className="truncate" title={c.name}>{c.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
`;

code = code.replace(
  /<input type="text" placeholder="Name \(e.g\. Prof\. Sharma\)"[\s\S]*?<input type="text" placeholder="Department"[\s\S]*?\/>/,
  facultyUI.trim()
);

fs.writeFileSync('src/components/CoordinatorView.tsx', code);
