import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// Update endpoint to accept targetGroup
const replaceGen = `
  app.post("/api/generate-timetable", (req, res) => {
    const { targetGroup } = req.body || {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00"];
    
    // If regenerating for a specific group, keep the others
    let newTimetable: any[] = [];
    if (targetGroup) {
        newTimetable = timetable.filter(t => {
            // Remove old entries for this group
            const batch = setupBatches.find(b => (b.groupNumber || b.department) === targetGroup);
            const subgroups = batch?.subgroupNames || [];
            const isTarget = t.section === targetGroup || subgroups.includes(t.section) || (t.section && t.section.startsWith(\`\${targetGroup}-SG\`));
            return !isTarget;
        });
    }

    let idCounter = Date.now();

    const batchesToProcess = targetGroup 
        ? setupBatches.filter(b => (b.groupNumber || b.department) === targetGroup)
        : setupBatches;

    batchesToProcess.forEach(batch => {
`;

code = code.replace(
  /app\.post\("\/api\/generate-timetable", \(req, res\) => \{\n\s*const days = \["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"\];\n\s*const timeSlots = \["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00"\];\n\s*let newTimetable: any\[\] = \[\];\n\s*let idCounter = 1;\n\s*setupBatches\.forEach\(batch => \{/,
  replaceGen.trim() + '\n'
);

fs.writeFileSync('server.ts', code);
