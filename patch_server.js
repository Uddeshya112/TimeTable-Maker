const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const routeCode = `
  app.post("/api/generate-timetable", (req, res) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00"];
    
    let newTimetable = [];
    let idCounter = 1;

    setupBatches.forEach(batch => {
      for (let s = 1; s <= batch.sections; s++) {
        // Shorten long department names like "Computer Science" to "Comp-Sec1"
        const deptShort = batch.department.split(' ').map(w => w.substring(0,3)).join('').toUpperCase();
        const sectionName = \`\${deptShort}-S\${s}\`;
        
        setupCourses.forEach(course => {
          let hoursAssigned = 0;
          // Just cycle through faculty to distribute evenly instead of purely random
          const fac = setupFaculty.length > 0 ? setupFaculty[idCounter % setupFaculty.length] : { id: 'unknown', name: 'Unknown' };
          
          let attempts = 0;
          while (hoursAssigned < course.hours && attempts < 1000) {
            attempts++;
            const randDay = days[Math.floor(Math.random() * days.length)];
            const randSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
            
            const clash = newTimetable.some(t => 
              t.day === randDay && t.time === randSlot &&
              (t.section === sectionName || t.facultyId === fac.id)
            );
            
            if (!clash) {
              const usedRoomsThisSlot = newTimetable.filter(t => t.day === randDay && t.time === randSlot).map(t => t.room);
              const freeRooms = setupRooms.filter(r => !usedRoomsThisSlot.includes(r.name));
              
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
      }
    });

    timetable = newTimetable;
    res.json({ success: true, count: newTimetable.length });
  });
`;

code = code.replace('// --- API ROUTES ---', '// --- API ROUTES ---\n' + routeCode);
fs.writeFileSync('server.ts', code);
