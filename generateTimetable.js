function generateTimetable(rooms, courses, faculty, batches) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "13:00 - 14:00", "14:00 - 15:00"];
  
  let newTimetable = [];
  let idCounter = 1;

  // Tracking occupied states: Map<DaySlot, Set<ID>>
  // ID can be roomId, facultyId, or sectionId (batch.department + section index)
  
  // For each batch and its sections, we need to schedule `course.hours` per week for each course.
  batches.forEach(batch => {
    for (let s = 1; s <= batch.sections; s++) {
      const sectionName = `${batch.department} - Sec ${s}`;
      
      courses.forEach(course => {
        let hoursAssigned = 0;
        
        // Find a faculty (just pick one, maybe cycle through them)
        const fac = faculty.length > 0 ? faculty[Math.floor(Math.random() * faculty.length)] : { id: 'unknown', name: 'Unknown' };
        
        // Try to place the course `course.hours` times
        let attempts = 0;
        while (hoursAssigned < course.hours && attempts < 1000) {
          attempts++;
          
          const randDay = days[Math.floor(Math.random() * days.length)];
          const randSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
          
          const timeKey = `${randDay}-${randSlot}`;
          
          // Check clashes
          const clash = newTimetable.some(t => 
            t.day === randDay && t.time === randSlot &&
            (t.section === sectionName || t.facultyId === fac.id) // Room clash checked separately
          );
          
          if (!clash) {
            // Find a free room
            const usedRoomsThisSlot = newTimetable.filter(t => t.day === randDay && t.time === randSlot).map(t => t.room);
            const freeRooms = rooms.filter(r => !usedRoomsThisSlot.includes(r.name));
            
            if (freeRooms.length > 0) {
              const assignedRoom = freeRooms[0];
              newTimetable.push({
                id: `gen_${idCounter++}`,
                day: randDay,
                time: randSlot,
                subject: course.name,
                section: sectionName,
                facultyId: fac.id,
                room: assignedRoom.name,
                status: "planned"
              });
              hoursAssigned++;
            }
          }
        }
      });
    }
  });

  return newTimetable;
}
