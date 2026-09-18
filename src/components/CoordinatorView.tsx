import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { CheckCircle2, Clock, AlertTriangle, CalendarRange, Bell, BookOpen, AlertCircle, TrendingUp, TrendingDown, Info, Settings, Wand2, Database, Search, UserCheck, Play, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";

export default function CoordinatorView() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timetable' | 'syllabus' | 'inbox' | 'generator' | 'simulator' | 'setup'>('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [substitutes, setSubstitutes] = useState<any[]>([]);
  const [activeMakeupSearch, setActiveMakeupSearch] = useState<string | null>(null);
  
  // Simulator State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Setup Data State
  const [setupData, setSetupData] = useState<any>(null);
  const [newRoom, setNewRoom] = useState({ name: '', capacity: '', type: 'Lecture' });
  const [newCourse, setNewCourse] = useState({ name: '', hours: '', type: 'Lecture' });
  const [newFaculty, setNewFaculty] = useState({ name: '', department: '', subjects: [] as string[] });
  const [newBatch, setNewBatch] = useState({ groupNumber: '', department: '', totalStudents: '', subgroups: '', subgroupNames: [] as string[] });
  
  const [editRoomId, setEditRoomId] = useState<string | null>(null);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [editFacultyId, setEditFacultyId] = useState<string | null>(null);
  const [editBatchId, setEditBatchId] = useState<string | null>(null);
  
  const [ttSearch, setTtSearch] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
  const [selectedSubgroupFilter, setSelectedSubgroupFilter] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const loadData = () => {
    fetch("/api/dashboard/coordinator")
      .then(res => res.json())
      .then(setData);
  };

  const loadSetup = () => {
    fetch("/api/setup-data")
      .then(res => res.json())
      .then(setSetupData);
  };

  useEffect(() => {
    loadData();
    loadSetup();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddSetup = (type: string, payload: any) => {
    fetch("/api/setup-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, payload })
    }).then(() => {
      loadSetup();
      if (type === 'room') setNewRoom({ name: '', capacity: '', type: 'Lecture' });
      if (type === 'course') setNewCourse({ name: '', hours: '', type: 'Lecture' });
      if (type === 'faculty') setNewFaculty({ name: '', department: '', subjects: [] });
      if (type === 'batch') setNewBatch({ groupNumber: '', department: '', totalStudents: '', subgroups: '', subgroupNames: [] });
    });
  };

  const startEdit = (type: string, item: any) => {
    if (type === 'room') { setEditRoomId(item.id); setNewRoom(item); }
    if (type === 'course') { setEditCourseId(item.id); setNewCourse(item); }
    if (type === 'faculty') { setEditFacultyId(item.id); setNewFaculty({ name: item.name, department: item.department, subjects: item.subjects || [] }); }
    if (type === 'batch') { setEditBatchId(item.id); setNewBatch({ ...item, subgroups: item.subgroups || item.sections || '', subgroupNames: item.subgroupNames || [] }); }
  };

  const cancelEdit = (type: string) => {
    if (type === 'room') { setEditRoomId(null); setNewRoom({ name: '', capacity: '', type: 'Lecture' }); }
    if (type === 'course') { setEditCourseId(null); setNewCourse({ name: '', hours: '', type: 'Lecture' }); }
    if (type === 'faculty') { setEditFacultyId(null); setNewFaculty({ name: '', department: '', subjects: [] }); }
    if (type === 'batch') { setEditBatchId(null); setNewBatch({ groupNumber: '', department: '', totalStudents: '', subgroups: '', subgroupNames: [] }); }
  };

  const handleUpdateSetup = (type: string, id: string, payload: any) => {
    fetch(`/api/setup-data/${type}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload })
    }).then(() => {
      loadSetup();
      cancelEdit(type);
    });
  };

  const handleDeleteSetup = (type: string, id: string) => {
    fetch(`/api/setup-data/${type}/${id}`, { method: "DELETE" }).then(() => loadSetup());
  };

  const handleApprove = (approvalId: string) => {
    fetch("/api/approve-makeup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalId })
    }).then(loadData);
  };

  const handleCancelClass = (slotId: string) => {
    fetch("/api/cancel-class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId })
    }).then(loadData);
  };

  const findSubstitutes = (subject: string, makeupId: string) => {
    setActiveMakeupSearch(makeupId);
    fetch(`/api/substitutes/${encodeURIComponent(subject)}`)
      .then(res => res.json())
      .then(resData => setSubstitutes(resData.candidates));
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationResult(null);
    fetch("/api/simulate", { method: "POST" })
      .then(res => res.json())
      .then(resData => {
        setIsSimulating(false);
        setSimulationResult(resData);
      });
  };

  const simulateGeneration = () => {
    setIsGenerating(true);
    fetch("/api/generate-timetable", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetGroup: selectedGroupFilter || undefined })
    })
      .then(res => res.json())
      .then(result => {
        setIsGenerating(false);
        if(result.success) {
          loadData(); // reload dashboard data
          setActiveTab('timetable');
        }
      });
  };


  if (!data) return <div className="p-8 text-slate-500 flex items-center"><Clock className="mr-2 h-4 w-4 animate-spin"/> Loading Platform Data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Academic Operations Center</h1>
      </div>

      <div className="flex space-x-2 border-b pb-4 mb-6 overflow-x-auto scrollbar-hide">
        <Button 
          variant={activeTab === 'dashboard' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('dashboard')}
          className={activeTab === 'dashboard' ? 'bg-slate-900' : 'text-slate-600'}
        >
          Operations & Recovery
        </Button>
        <Button 
          variant={activeTab === 'timetable' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('timetable')}
          className={activeTab === 'timetable' ? 'bg-slate-900' : 'text-slate-600'}
        >
          Master Timetable
        </Button>
        <Button 
          variant={activeTab === 'setup' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('setup')}
          className={activeTab === 'setup' ? 'bg-slate-900' : 'text-slate-600'}
        >
          <Database className="h-4 w-4 mr-2" />
          College Data
        </Button>
        <Button 
          variant={activeTab === 'syllabus' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('syllabus')}
          className={activeTab === 'syllabus' ? 'bg-slate-900' : 'text-slate-600'}
        >
          Syllabus Intelligence
        </Button>
        <Button 
          variant={activeTab === 'simulator' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('simulator')}
          className={activeTab === 'simulator' ? 'bg-slate-900' : 'text-slate-600'}
        >
          What-If Simulator
        </Button>
        <Button 
          variant={activeTab === 'generator' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('generator')}
          className={activeTab === 'generator' ? 'bg-slate-900' : 'text-slate-600'}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Auto-Scheduler
        </Button>
        <Button 
          variant={activeTab === 'inbox' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('inbox')}
          className={activeTab === 'inbox' ? 'bg-slate-900' : 'text-slate-600 relative'}
        >
          Academic Inbox
          {data.inbox && data.inbox.length > 0 && (
             <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Button>
      </div>
      
      {activeTab === 'dashboard' && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${Number(data.healthScore) < 90 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {data.healthScore}
                </div>
                <p className="text-xs text-slate-500 mt-1">Out of 100</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Makeups</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.pendingMakeups.length}</div>
                <p className="text-xs text-slate-500 mt-1">Awaiting recovery</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Queue</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.approvals.length}</div>
                <p className="text-xs text-slate-500 mt-1">Awaiting coordinator review</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Approval Queue</CardTitle>
                <CardDescription>Faculty have accepted these cross-cancellation matches.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.approvals.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">No pending approvals.</div>
                  ) : (
                    data.approvals.map((apprv: any) => (
                      <div key={apprv.id} className="rounded-lg border p-4 bg-slate-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-semibold text-lg">{apprv.subject} / {apprv.section}</div>
                            <div className="text-sm text-slate-600">Proposed Slot: {apprv.day} {apprv.time}</div>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Needs Review</Badge>
                        </div>
                        <Button onClick={() => handleApprove(apprv.id)} size="sm" className="w-full bg-slate-900 hover:bg-slate-800">
                          Approve Match & Publish
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Makeups & Substitutes</CardTitle>
                <CardDescription>Use the Substitute Faculty Engine to resolve missing classes.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.pendingMakeups.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">All makeups resolved!</div>
                  ) : (
                    data.pendingMakeups.map((mk: any) => (
                      <div key={mk.id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-semibold text-lg">{mk.subject} / {mk.section}</div>
                            <div className="text-sm text-slate-500 flex items-center mt-1">
                              <Clock className="w-4 h-4 mr-1"/> Original Faculty: {mk.facultyId}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mb-1">Priority: {mk.priority}</Badge>
                          </div>
                        </div>
                        
                        {activeMakeupSearch === mk.id ? (
                          <div className="mt-4 border-t pt-4 space-y-3">
                            <div className="text-sm font-semibold text-slate-700 mb-2">Substitute Engine Results:</div>
                            {substitutes.map(sub => (
                              <div key={sub.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border">
                                <div>
                                  <div className="font-medium text-sm">{sub.name} <span className="text-slate-400 font-normal ml-1">— {sub.compatibility}% compatibility</span></div>
                                  <div className="text-xs text-slate-500 mt-0.5">{sub.reasons.join(" • ")}</div>
                                </div>
                                <Button size="sm" disabled={sub.status === 'Unavailable'} className={sub.status === 'Available' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}>
                                  {sub.status === 'Available' ? 'Assign' : 'Unavailable'}
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => findSubstitutes(mk.subject, mk.id)}>
                            <Search className="w-4 h-4 mr-2" /> Find Qualified Substitute
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'simulator' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>What-If Simulator</CardTitle>
            <CardDescription>Preview the cascading impact of emergency changes before publishing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Disruption Scenario</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Main Computer Lab (Room 204) is unavailable next week</option>
                <option>Prof. Sharma goes on emergency leave for 3 days</option>
                <option>Building B is closed for maintenance on Friday</option>
              </select>
            </div>
            
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800" 
              onClick={runSimulation}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <><Clock className="w-4 h-4 mr-2 animate-spin" /> Running Impact Analysis...</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Run Simulation</>
              )}
            </Button>

            {simulationResult && (
              <div className="mt-6 border rounded-lg bg-slate-50 p-6 shadow-sm">
                <h3 className="font-semibold text-lg text-slate-900 mb-4 border-b pb-2">Simulation Results</h3>
                <div className="space-y-3">
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-slate-600">Affected classes:</span>
                    <span className="font-bold text-slate-900">{simulationResult.affectedClasses}</span>
                  </div>
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-slate-600">Required room changes:</span>
                    <span className="font-bold text-slate-900">{simulationResult.roomChanges}</span>
                  </div>
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-slate-600">New conflicts:</span>
                    <span className="font-bold text-green-600">{simulationResult.newConflicts}</span>
                  </div>
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-slate-600">Stability:</span>
                    <span className="font-bold text-slate-900">{simulationResult.stability}%</span>
                  </div>
                  <div className="flex justify-between font-mono text-sm pt-2 border-t mt-2">
                    <span className="text-slate-600 font-semibold">New Health score:</span>
                    <span className="font-bold text-indigo-600">{simulationResult.healthScore}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">Apply Changes</Button>
                  <Button variant="outline" className="flex-1">Discard</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'timetable' && (
        <Card>
          <CardHeader>
            <CardTitle>Master Timetable</CardTitle>
            <CardDescription>Full institutional view. As a coordinator, you can force-cancel sessions from here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex gap-4">
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
                    
                    if (selectedGroupFilter) {
                        const batch = setupData?.batches?.find((b: any) => (b.groupNumber || b.department) === selectedGroupFilter);
                        const subgroups = batch?.subgroupNames || [];
                        const fallbackPrefix = `${selectedGroupFilter}-SG`;
                        
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
                          <div key={slot.id} className={`rounded-md border p-3 flex justify-between items-center transition-colors ${slot.status === 'cancelled' ? 'bg-red-50 border-red-100 opacity-75' : slot.status === 'rescheduled' ? 'bg-green-50 border-green-100' : 'bg-white'}`}>
                            <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                              <div className="font-mono text-sm text-slate-500">{slot.time}</div>
                              <div className={`font-semibold ${slot.status === 'cancelled' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                {slot.subject}
                              </div>
                              <div className="text-sm text-slate-600">
                                {slot.section} • Room {slot.room || 'TBD'}
                              </div>
                              <div className="text-sm text-slate-500">
                                {slot.facultyId ? `Prof. ${setupData?.faculty?.find((f: any) => f.id === slot.facultyId)?.name || slot.facultyId}` : 'No Faculty'}
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
                            
                            if (selectedGroupFilter) {
                                const batch = setupData?.batches?.find((b: any) => (b.groupNumber || b.department) === selectedGroupFilter);
                                const subgroups = batch?.subgroupNames || [];
                                const fallbackPrefix = `${selectedGroupFilter}-SG`;
                                
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
                                  <div key={slot.id} className={`p-2 rounded border text-xs ${slot.status === 'cancelled' ? 'bg-red-50 border-red-200' : slot.status === 'rescheduled' ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
                                    <div className="font-semibold mb-1 truncate" title={slot.subject}>{slot.subject}</div>
                                    <div className="text-slate-500 flex justify-between">
                                      <span>{slot.section}</span>
                                      <span>{slot.room}</span>
                                    </div>
                                    <div className="text-slate-500 mt-1 truncate" title={slot.facultyId}>{setupData?.faculty?.find((f: any) => f.id === slot.facultyId)?.name || slot.facultyId}</div>
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
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'syllabus' && (
        <Card>
          <CardHeader>
            <CardTitle>Syllabus Intelligence</CardTitle>
            <CardDescription>Track syllabus completion and identify at-risk subjects across the institution.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.syllabus.map((syl: any) => (
                <div key={syl.subject} className="rounded-lg border p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{syl.subject}</h3>
                      <p className="text-sm text-slate-500">Completion Status</p>
                    </div>
                    {syl.risk === 'HIGH' && <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">High Risk</Badge>}
                    {syl.risk === 'MEDIUM' && <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Medium Risk</Badge>}
                    {syl.risk === 'LOW' && <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">On Track</Badge>}
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4 mb-4 text-center">
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-xs text-slate-500 font-medium uppercase">Required</div>
                      <div className="text-lg font-bold">{syl.required}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-xs text-slate-500 font-medium uppercase">Planned</div>
                      <div className="text-lg font-bold">{syl.planned}</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-xs text-blue-600 font-medium uppercase">Completed</div>
                      <div className="text-lg font-bold text-blue-700">{syl.completed}</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <div className="text-xs text-red-600 font-medium uppercase">Cancelled</div>
                      <div className="text-lg font-bold text-red-700">{syl.cancelled}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-xs text-slate-500 font-medium uppercase">Remaining</div>
                      <div className="text-lg font-bold">{syl.remaining}</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${syl.risk === 'HIGH' ? 'bg-red-500' : syl.risk === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`} 
                      style={{ width: `${(syl.completed / syl.required) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'inbox' && (
        <Card>
          <CardHeader>
            <CardTitle>Academic Inbox</CardTitle>
            <CardDescription>Centralized notifications and contextual alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.inbox.map((msg: any) => (
                <div key={msg.id} className={`flex items-center p-4 rounded-lg border ${
                  msg.type === 'error' ? 'bg-red-50 border-red-100 text-red-900' :
                  msg.type === 'warning' ? 'bg-yellow-50 border-yellow-100 text-yellow-900' :
                  msg.type === 'success' ? 'bg-green-50 border-green-100 text-green-900' :
                  'bg-blue-50 border-blue-100 text-blue-900'
                }`}>
                  <div className="mr-4">
                    {msg.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                    {msg.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                    {msg.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    {msg.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div className="font-medium text-sm">{msg.message}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'setup' && setupData && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Rooms Setup */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg">Rooms</CardTitle>
                <CardDescription>Define physical spaces and capacities.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {setupData.rooms.map((r: any) => (
                    <div key={r.id} className="group flex justify-between items-center bg-slate-50 p-2 rounded border text-sm hover:bg-slate-100 transition-colors">
                      <div>
                        <span className="font-medium">{r.name}</span>
                        <span className="text-slate-500 text-xs ml-2 bg-slate-200 px-2 py-0.5 rounded-full">{r.capacity} seats</span>
                        {r.type && <span className="text-slate-500 text-xs ml-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{r.type}</span>}
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit('room', r)} className="p-1 text-blue-600 hover:text-blue-800"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteSetup('room', r.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-700">{editRoomId ? "Edit Room" : "Add New Room"}</h4>
                  <input type="text" placeholder="Room Name (e.g. 101)" className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} />
                  <div className="flex gap-2">
                    <input type="number" placeholder="Capacity" className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} />
                    <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})}>
                      <option value="Lecture">Lecture</option>
                      <option value="Laboratory">Laboratory</option>
                    </select>
                  </div>
                  {editRoomId ? (
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={() => handleUpdateSetup('room', editRoomId, newRoom)} disabled={!newRoom.name || !newRoom.capacity}>Update</Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => cancelEdit('room')}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800" onClick={() => handleAddSetup('room', newRoom)} disabled={!newRoom.name || !newRoom.capacity}>Add Room</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Courses Setup */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg">Subjects</CardTitle>
                <CardDescription>Configure course requirements.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {setupData.courses.map((c: any) => (
                    <div key={c.id} className="group flex justify-between items-center bg-slate-50 p-2 rounded border text-sm hover:bg-slate-100 transition-colors">
                      <div>
                        <span className="font-medium block">{c.name}</span>
                        <span className="text-slate-500 text-xs bg-slate-200 px-2 py-0.5 rounded-full">{c.hours} hrs/week</span>
                        {c.type && <span className="text-slate-500 text-xs ml-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{c.type}</span>}
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit('course', c)} className="p-1 text-blue-600 hover:text-blue-800"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteSetup('course', c.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-700">{editCourseId ? "Edit Subject" : "Add Subject"}</h4>
                  <input type="text" placeholder="Subject Name" className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} />
                  <div className="flex gap-2">
                    <input type="number" placeholder="Hours/Week" className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newCourse.hours} onChange={e => setNewCourse({...newCourse, hours: e.target.value})} />
                    <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newCourse.type} onChange={e => setNewCourse({...newCourse, type: e.target.value})}>
                      <option value="Lecture">Lecture</option>
                      <option value="Laboratory">Laboratory</option>
                    </select>
                  </div>
                  {editCourseId ? (
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={() => handleUpdateSetup('course', editCourseId, newCourse)} disabled={!newCourse.name || !newCourse.hours}>Update</Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => cancelEdit('course')}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800" onClick={() => handleAddSetup('course', newCourse)} disabled={!newCourse.name || !newCourse.hours}>Add Subject</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Faculty Setup */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg">Faculty</CardTitle>
                <CardDescription>Manage teachers and subject assignments.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {setupData.faculty.map((f: any) => (
                    <div key={f.id} className="group flex justify-between items-center bg-slate-50 p-2 rounded border text-sm hover:bg-slate-100 transition-colors">
                      <div>
                        <span className="font-medium block">{f.name}</span>
                        <span className="text-slate-500 text-xs">{f.department}</span>
                        {f.subjects && f.subjects.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {f.subjects.map((subId: string) => {
                              const c = setupData.courses.find((c: any) => c.id === subId);
                              return c ? <span key={subId} className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">{c.name}</span> : null;
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit('faculty', f)} className="p-1 text-blue-600 hover:text-blue-800"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteSetup('faculty', f.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-700">{editFacultyId ? "Edit Faculty" : "Add Faculty"}</h4>
                  <input type="text" placeholder="Name" className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newFaculty.name} onChange={e => setNewFaculty({...newFaculty, name: e.target.value})} />
                  <input type="text" placeholder="Department" className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newFaculty.department} onChange={e => setNewFaculty({...newFaculty, department: e.target.value})} />
                  
                  {setupData.courses.length > 0 && (
                    <div className="border rounded-md p-2 bg-slate-50 space-y-2 max-h-32 overflow-y-auto">
                      <p className="text-xs font-medium text-slate-500">Qualified Subjects</p>
                      <div className="space-y-1">
                        {setupData.courses.map((c: any) => (
                          <label key={c.id} className="flex items-center space-x-2 text-sm">
                            <input 
                              type="checkbox" 
                              checked={newFaculty.subjects?.includes(c.id) || false}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const currentSubjects = newFaculty.subjects || [];
                                if (isChecked) {
                                  setNewFaculty({...newFaculty, subjects: [...currentSubjects, c.id]});
                                } else {
                                  setNewFaculty({...newFaculty, subjects: currentSubjects.filter(id => id !== c.id)});
                                }
                              }}
                            />
                            <span>{c.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {editFacultyId ? (
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={() => handleUpdateSetup('faculty', editFacultyId, newFaculty)} disabled={!newFaculty.name || !newFaculty.department}>Update</Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => cancelEdit('faculty')}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800" onClick={() => handleAddSetup('faculty', newFaculty)} disabled={!newFaculty.name || !newFaculty.department}>Add Faculty</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Batches Setup */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg">Student Batches</CardTitle>
                <CardDescription>Setup cohorts & divisions.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {setupData.batches.map((b: any) => (
                    <div key={b.id} className="group flex justify-between items-center bg-slate-50 p-2 rounded border text-sm hover:bg-slate-100 transition-colors">
                      <div>
                        <span className="font-medium block">{b.groupNumber || b.department}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-slate-500 text-xs bg-slate-200 px-2 py-0.5 rounded-full">{b.totalStudents} Students</span>
                          <span className="text-indigo-600 text-xs bg-indigo-50 px-2 py-0.5 rounded-full">{b.subgroups || b.sections || 1} Sub-groups</span>
                        </div>
                        {b.subgroupNames && b.subgroupNames.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {b.subgroupNames.map((n: string, i: number) => (
                              <span key={i} className="text-[10px] bg-slate-200 text-slate-700 px-1 rounded">{n}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit('batch', b)} className="p-1 text-blue-600 hover:text-blue-800"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteSetup('batch', b.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-700">{editBatchId ? "Edit Batch" : "Add Batch"}</h4>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Group (e.g. 2C4)" className="w-1/3 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newBatch.groupNumber} onChange={e => setNewBatch({...newBatch, groupNumber: e.target.value})} />
                    <input type="text" placeholder="Department" className="w-2/3 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newBatch.department} onChange={e => setNewBatch({...newBatch, department: e.target.value})} />
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Total Students" className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newBatch.totalStudents} onChange={e => setNewBatch({...newBatch, totalStudents: e.target.value})} />
                    <input type="number" placeholder="Sub-groups (e.g. 4)" className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={newBatch.subgroups || ('sections' in newBatch ? (newBatch as any).sections : '') || ''} onChange={e => {
                      const val = e.target.value;
                      const count = parseInt(val) || 0;
                      const names = newBatch.subgroupNames || [];
                      const newNames = Array.from({length: count}, (_, i) => names[i] || `${newBatch.groupNumber ? newBatch.groupNumber.toUpperCase() : 'SG'}-${i+1}`);
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
                  {editBatchId ? (
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={() => handleUpdateSetup('batch', editBatchId, newBatch)} disabled={!newBatch.department || !newBatch.totalStudents || !newBatch.subgroups}>Update</Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => cancelEdit('batch')}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800" onClick={() => handleAddSetup('batch', newBatch)} disabled={!newBatch.department || !newBatch.totalStudents || !newBatch.subgroups}>Add Batch</Button>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}
      {activeTab === 'generator' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-4">
              <CardTitle className="text-indigo-900 flex items-center">
                <Wand2 className="w-5 h-5 mr-2 text-indigo-600" />
                AI Timetable Generation
              </CardTitle>
              <CardDescription>
                Generate a conflict-free master timetable based on constraints.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg bg-slate-50">
                  <div className="flex items-center">
                    <Database className="w-4 h-4 mr-2 text-slate-500" />
                    <span className="text-sm font-medium">Faculty Constraints</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {setupData ? setupData.faculty.length : 0} Loaded
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg bg-slate-50">
                  <div className="flex items-center">
                    <Database className="w-4 h-4 mr-2 text-slate-500" />
                    <span className="text-sm font-medium">Room Capacities</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {setupData ? setupData.rooms.length : 0} Loaded
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg bg-slate-50">
                  <div className="flex items-center">
                    <Database className="w-4 h-4 mr-2 text-slate-500" />
                    <span className="text-sm font-medium">Subject Credits</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {setupData ? setupData.courses.length : 0} Loaded
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg bg-slate-50">
                  <div className="flex items-center">
                    <UserCheck className="w-4 h-4 mr-2 text-slate-500" />
                    <span className="text-sm font-medium">Student Cohorts & Divisions</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {setupData && setupData.batches ? setupData.batches.length : 0} Loaded
                  </Badge>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 mt-4">
                  <Info className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="text-sm text-blue-900">
                    <strong>Clash-Free Generation Enabled:</strong> The algorithm will automatically read your loaded batch sizes (e.g., 1000 CS students) and section divisions to ensure no student groups or faculty are double-booked.
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <label className="text-sm font-medium text-slate-700 block mb-2">Target Group (Optional)</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    value={selectedGroupFilter}
                    onChange={(e) => setSelectedGroupFilter(e.target.value)}
                  >
                    <option value="">Build Full Timetable (All Groups)</option>
                    {setupData && setupData.batches && setupData.batches.map((b: any) => (
                      <option key={b.id} value={b.groupNumber || b.department}>{b.groupNumber || b.department}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">If a group is selected, only that group's routines will be regenerated. Other groups will remain intact.</p>
                </div>

                <Button 
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white" 
                  size="lg"
                  onClick={simulateGeneration}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Computing Combinations...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Run Genetic Algorithm
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
              <CardDescription>Adjust optimization weights.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">Minimize Student Gaps</span>
                  <span className="text-sm text-slate-500">80%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full">
                  <div className="bg-slate-900 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">Faculty Consecutive Limits</span>
                  <span className="text-sm text-slate-500">Max 2</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full">
                  <div className="bg-slate-900 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">Room Travel Distance</span>
                  <span className="text-sm text-slate-500">Low Priority</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full">
                  <div className="bg-slate-900 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
