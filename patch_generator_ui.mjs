import fs from 'fs';
let code = fs.readFileSync('src/components/CoordinatorView.tsx', 'utf8');

const uiPatch = `
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
`;

code = code.replace(
  /<div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 mt-4">[\s\S]*?disabled=\{isGenerating\}\n\s*>/,
  uiPatch.trim() + '\n                >'
);

// We need to pass targetGroup to the API
const apiPatch = `
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
`;

code = code.replace(
  /const simulateGeneration = \(\) => \{\n\s*setIsGenerating\(true\);\n\s*fetch\("\/api\/generate-timetable", \{ method: "POST" \}\)[\s\S]*?\}\);\n\s*\};\n/g,
  apiPatch.trim() + '\n\n'
);

fs.writeFileSync('src/components/CoordinatorView.tsx', code);
