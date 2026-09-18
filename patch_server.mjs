import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const newLogic = `
  app.post("/api/generate-timetable", (req, res) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00"];
    
    let newTimetable = [];
    let idCounter = 1;

    setupBatches.forEach(batch => {
      const groupName = batch.groupNumber ? batch.groupNumber.toUpperCase() : batch.department.substring(0, 7).toUpperCase();
      const numSubgroups = Number(batch.subgroups) || Number(batch.sections) || 1;
      
      const customNames = batch.subgroupNames || [];

      setupCourses.forEach(course => {
        const isLab = course.type === 'Laboratory';
        const entitiesToSchedule = isLab 
          ? Array.from({length: numSubgroups}, (_, i) => customNames[i] || \`\${groupName}-SG\${i+1}\`)
          : [groupName];

        entitiesToSchedule.forEach(sectionName => {
          let hoursAssigned = 0;
          
          // Find faculty who can teach this subject
          let eligibleFaculty = setupFaculty.filter(f => f.subjects && f.subjects.includes(course.id));
          if (eligibleFaculty.length === 0) {
            eligibleFaculty = setupFaculty; // fallback
          }
          const fac = eligibleFaculty.length > 0 ? eligibleFaculty[idCounter % eligibleFaculty.length] : { id: 'unknown', name: 'Unknown' };
          
          let attempts = 0;
          while (hoursAssigned < course.hours && attempts < 1000) {
            attempts++;
            const randDay = days[Math.floor(Math.random() * days.length)];
            const randSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
            
            // Check clash
            const clash = newTimetable.some(t => {
              if (t.day !== randDay || t.time !== randSlot) return false;
              if (t.facultyId === fac.id) return true; // Teacher clash
              
              // Group / Subgroup clash
              const isGroup = sectionName === groupName;
              const isSubgroup = customNames.includes(sectionName) || sectionName.startsWith(\`\${groupName}-SG\`);
              
              if (t.section === sectionName) return true;
              if (isGroup && (customNames.includes(t.section) || t.section.startsWith(\`\${groupName}-SG\`))) return true;
              if (isSubgroup && t.section === groupName) return true;
              
              return false;
            });
            
            if (!clash) {
              const usedRoomsThisSlot = newTimetable.filter(t => t.day === randDay && t.time === randSlot).map(t => t.room);
              let freeRooms = setupRooms.filter(r => !usedRoomsThisSlot.includes(r.name));
              
              const requiredType = course.type === 'Laboratory' ? 'Laboratory' : (course.type || 'Lecture');
              const matchedTypeRooms = freeRooms.filter(r => r.type === requiredType);
              if (matchedTypeRooms.length > 0) {
                freeRooms = matchedTypeRooms;
              }
              
              if (freeRooms.length > 0) {
                newTimetable.push({
                  id: \`gen_\${idCounter++}\`,
                  day: randDay,
                  time: randSlot,
                  subject: course.name,
                  section: sectionName,
                  facultyId: fac.id,
                  room: freeRooms[0].name,
                  status: "planned"
                });
                hoursAssigned++;
              }
            }
          }
        });
      });
    });

    timetable = newTimetable;
    res.json({ success: true, count: newTimetable.length });
  });
`;

code = code.replace(/app\.post\("\/api\/generate-timetable", \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, count: newTimetable\.length \}\);\n  \}\);/, newLogic.trim());

fs.writeFileSync('server.ts', code);
