import fs from 'fs';
let code = fs.readFileSync('src/components/CoordinatorView.tsx', 'utf8');

// 1. Add states
code = code.replace(
  "const [ttSearch, setTtSearch] = useState('');",
  "const [ttSearch, setTtSearch] = useState('');\n  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');\n  const [selectedSubgroupFilter, setSelectedSubgroupFilter] = useState('');"
);

// 2. Add UI
const filterUI = `
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search routine by Section, Faculty, Subject, or Room..."
                  className="w-full h-10 pl-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={ttSearch}
                  onChange={e => setTtSearch(e.target.value)}
                />
              </div>
              
              {setupData && setupData.batches && (
                <select 
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                  value={selectedGroupFilter} 
                  onChange={e => { setSelectedGroupFilter(e.target.value); setSelectedSubgroupFilter(''); }}
                >
                  <option value="">All Groups</option>
                  {setupData.batches.map((b: any) => (
                      <option key={b.id} value={b.groupNumber || b.department}>{b.groupNumber || b.department}</option>
                  ))}
                </select>
              )}

              {selectedGroupFilter && setupData && setupData.batches && (
                <select 
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                  value={selectedSubgroupFilter} 
                  onChange={e => setSelectedSubgroupFilter(e.target.value)}
                >
                  <option value="">All Subgroups</option>
                  {(() => {
                      const b = setupData.batches.find((batch: any) => (batch.groupNumber || batch.department) === selectedGroupFilter);
                      if (!b || !b.subgroupNames || b.subgroupNames.length === 0) return null;
                      return b.subgroupNames.map((name: string) => (
                          <option key={name} value={name}>{name}</option>
                      ));
                  })()}
                </select>
              )}
`;

code = code.replace(
  /<div className="relative flex-1">[\s\S]*?<\/div>/,
  filterUI.trim()
);

// 3. Update list view filter logic
const listFilterLogic = `
                  const daySlots = data.timetable.filter((t: any) => {
                    if (t.day !== day) return false;
                    
                    if (selectedGroupFilter) {
                        const batch = setupData?.batches?.find((b: any) => (b.groupNumber || b.department) === selectedGroupFilter);
                        const subgroups = batch?.subgroupNames || [];
                        const fallbackPrefix = \`\${selectedGroupFilter}-SG\`;
                        
                        if (selectedSubgroupFilter) {
                            if (t.section !== selectedGroupFilter && t.section !== selectedSubgroupFilter) {
                                return false;
                            }
                        } else {
                            if (t.section !== selectedGroupFilter && !subgroups.includes(t.section) && !(t.section && t.section.startsWith(fallbackPrefix))) {
                                return false;
                            }
                        }
                    }

                    if (!ttSearch) return true;
`;

code = code.replace(
  /const daySlots = data\.timetable\.filter\(\(t: any\) => \{\n\s*if \(t\.day !== day\) return false;\n\s*if \(!ttSearch\) return true;/g,
  listFilterLogic.trim()
);

// 4. Update matrix view filter logic
const matrixFilterLogic = `
                          const slots = data.timetable.filter((t: any) => {
                            if (t.day !== day || t.time !== timeSlot) return false;
                            
                            if (selectedGroupFilter) {
                                const batch = setupData?.batches?.find((b: any) => (b.groupNumber || b.department) === selectedGroupFilter);
                                const subgroups = batch?.subgroupNames || [];
                                const fallbackPrefix = \`\${selectedGroupFilter}-SG\`;
                                
                                if (selectedSubgroupFilter) {
                                    if (t.section !== selectedGroupFilter && t.section !== selectedSubgroupFilter) {
                                        return false;
                                    }
                                } else {
                                    if (t.section !== selectedGroupFilter && !subgroups.includes(t.section) && !(t.section && t.section.startsWith(fallbackPrefix))) {
                                        return false;
                                    }
                                }
                            }

                            if (!ttSearch) return true;
`;

code = code.replace(
  /const slots = data\.timetable\.filter\(\(t: any\) => \{\n\s*if \(t\.day !== day \|\| t\.time !== timeSlot\) return false;\n\s*if \(!ttSearch\) return true;/g,
  matrixFilterLogic.trim()
);

fs.writeFileSync('src/components/CoordinatorView.tsx', code);
