import fs from 'fs';
let code = fs.readFileSync('src/components/CoordinatorView.tsx', 'utf8');

const stateHook = `const [ttSearch, setTtSearch] = useState('');
  const [viewMode, setViewMode] = useState('list');`;

code = code.replace(/const \[ttSearch, setTtSearch\] = useState\(''\);/, stateHook);

const oldTimetable = `            <div className="mb-6 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search routine by Section (e.g. COMPUTE-S1), Faculty, Subject, or Room..."
                className="w-full h-10 pl-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={ttSearch}
                onChange={e => setTtSearch(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                const daySlots = data.timetable.filter((t: any) => {
                  if (t.day !== day) return false;
                  if (!ttSearch) return true;
                  const search = ttSearch.toLowerCase();
                  return (
                    (t.subject && t.subject.toLowerCase().includes(search)) ||
                    (t.section && t.section.toLowerCase().includes(search)) ||
                    (t.facultyId && t.facultyId.toLowerCase().includes(search)) ||
                    (t.room && t.room.toLowerCase().includes(search))
                  );
                });
                
                daySlots.sort((a: any, b: any) => (a.time || '').localeCompare(b.time || ''));
                if (daySlots.length === 0) return null;
                
                return (
                  <div key={day} className="mb-6 last:mb-0">
                    <h3 className="font-semibold text-lg text-slate-900 mb-3 border-b pb-2">{day}</h3>
                    <div className="space-y-2">
                      {daySlots.map((slot: any) => (
                        <div key={slot.id} className={\`rounded-md border p-3 flex justify-between items-center transition-colors \${slot.status === 'cancelled' ? 'bg-red-50 border-red-100 opacity-75' : slot.status === 'rescheduled' ? 'bg-green-50 border-green-100' : 'bg-white'}\`}>
                          <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                            <div className="font-mono text-sm text-slate-500">{slot.time}</div>
                            <div className={\`font-semibold \${slot.status === 'cancelled' ? 'line-through text-slate-500' : 'text-slate-900'}\`}>
                              {slot.subject}
                            </div>
                            <div className="text-sm text-slate-600">
                              {slot.section} • Room {slot.room || 'TBD'}
                            </div>
                            <div className="text-sm text-slate-500">
                              {slot.facultyId ? \`Prof. \${slot.facultyId}\` : 'No Faculty'}
                            </div>
                          </div>
                          <div>
                            {slot.status === 'planned' && (
                              <Button variant="outline" size="sm" onClick={() => handleCancelClass(slot.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                Override Cancel
                              </Button>
                            )}
                            {slot.status === 'cancelled' && (
                              <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-0 shadow-none">Cancelled</Badge>
                            )}
                            {slot.status === 'rescheduled' && (
                              <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100 border-0 shadow-none">Rescheduled</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>`;

const newTimetable = `            <div className="mb-6 flex gap-4">
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
              <select 
                className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <option value="list">List View</option>
                <option value="matrix">Matrix View</option>
              </select>
            </div>
            
            {viewMode === 'list' ? (
              <div className="space-y-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                  const daySlots = data.timetable.filter((t: any) => {
                    if (t.day !== day) return false;
                    if (!ttSearch) return true;
                    const search = ttSearch.toLowerCase();
                    return (
                      (t.subject && t.subject.toLowerCase().includes(search)) ||
                      (t.section && t.section.toLowerCase().includes(search)) ||
                      (t.facultyId && t.facultyId.toLowerCase().includes(search)) ||
                      (t.room && t.room.toLowerCase().includes(search))
                    );
                  });
                  
                  daySlots.sort((a: any, b: any) => (a.time || '').localeCompare(b.time || ''));
                  if (daySlots.length === 0) return null;
                  
                  return (
                    <div key={day} className="mb-6 last:mb-0">
                      <h3 className="font-semibold text-lg text-slate-900 mb-3 border-b pb-2">{day}</h3>
                      <div className="space-y-2">
                        {daySlots.map((slot: any) => (
                          <div key={slot.id} className={\`rounded-md border p-3 flex justify-between items-center transition-colors \${slot.status === 'cancelled' ? 'bg-red-50 border-red-100 opacity-75' : slot.status === 'rescheduled' ? 'bg-green-50 border-green-100' : 'bg-white'}\`}>
                            <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                              <div className="font-mono text-sm text-slate-500">{slot.time}</div>
                              <div className={\`font-semibold \${slot.status === 'cancelled' ? 'line-through text-slate-500' : 'text-slate-900'}\`}>
                                {slot.subject}
                              </div>
                              <div className="text-sm text-slate-600">
                                {slot.section} • Room {slot.room || 'TBD'}
                              </div>
                              <div className="text-sm text-slate-500">
                                {slot.facultyId ? \`Prof. \${slot.facultyId}\` : 'No Faculty'}
                              </div>
                            </div>
                            <div>
                              {slot.status === 'planned' && (
                                <Button variant="outline" size="sm" onClick={() => handleCancelClass(slot.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                  Override Cancel
                                </Button>
                              )}
                              {slot.status === 'cancelled' && (
                                <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-0 shadow-none">Cancelled</Badge>
                              )}
                              {slot.status === 'rescheduled' && (
                                <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100 border-0 shadow-none">Rescheduled</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-md">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="p-3 font-semibold border-b border-r">Time / Day</th>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                        <th key={day} className="p-3 font-semibold border-b border-r last:border-r-0 min-w-[200px]">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00"].map(timeSlot => (
                      <tr key={timeSlot} className="border-b last:border-0">
                        <td className="p-3 border-r font-mono text-slate-500 whitespace-nowrap">{timeSlot}</td>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                          const slots = data.timetable.filter((t: any) => {
                            if (t.day !== day || t.time !== timeSlot) return false;
                            if (!ttSearch) return true;
                            const search = ttSearch.toLowerCase();
                            return (
                              (t.subject && t.subject.toLowerCase().includes(search)) ||
                              (t.section && t.section.toLowerCase().includes(search)) ||
                              (t.facultyId && t.facultyId.toLowerCase().includes(search)) ||
                              (t.room && t.room.toLowerCase().includes(search))
                            );
                          });
                          
                          return (
                            <td key={day} className="p-2 border-r last:border-r-0 align-top">
                              <div className="space-y-2">
                                {slots.map((slot: any) => (
                                  <div key={slot.id} className={\`p-2 rounded border text-xs \${slot.status === 'cancelled' ? 'bg-red-50 border-red-200' : slot.status === 'rescheduled' ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}\`}>
                                    <div className="font-semibold mb-1 truncate" title={slot.subject}>{slot.subject}</div>
                                    <div className="text-slate-500 flex justify-between">
                                      <span>{slot.section}</span>
                                      <span>{slot.room}</span>
                                    </div>
                                    <div className="text-slate-500 mt-1 truncate" title={slot.facultyId}>{slot.facultyId}</div>
                                  </div>
                                ))}
                                {slots.length === 0 && <div className="text-slate-300 text-center py-2">-</div>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}`;

code = code.replace(oldTimetable, newTimetable);

fs.writeFileSync('src/components/CoordinatorView.tsx', code);
