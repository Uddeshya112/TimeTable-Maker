import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// The original server.ts has app.post("/api/generate-timetable" ... )
const newLogic = `
  app.post("/api/generate-timetable", (req, res) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00"];
    
    let newTimetable = [];
    let idCounter = 1;

    setupBatches.forEach(batch => {
      const groupName = batch.groupNumber ? batch.groupNumber.toUpperCase() : batch.department.substring(0, 7).toUpperCase();
      const numSubgroups = Number(batch.subgroups) || Number(batch.sections) || 1;

      setupCourses.forEach(course => {
        const isLab = course.type === 'Laboratory';
        const entitiesToSchedule = isLab 
          ? Array.from({length: numSubgroups}, (_, i) => \`\${groupName}-SG\${i+1}\`)
          : [groupName];

        entitiesToSchedule.forEach(sectionName => {
          let hoursAssigned = 0;
          const fac = setupFaculty.length > 0 ? setupFaculty[idCounter % setupFaculty.length] : { id: 'unknown', name: 'Unknown' };
          
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
              if (t.section === sectionName) return true;
              if (sectionName === groupName && t.section.startsWith(\`\${groupName}-SG\`)) return true;
              if (sectionName.startsWith(\`\${groupName}-SG\`) && t.section === groupName) return true;
              
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
