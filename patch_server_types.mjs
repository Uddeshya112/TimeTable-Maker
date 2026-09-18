import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// Replace newTimetable declaration with proper type
code = code.replace(
  "let newTimetable = [];",
  "let newTimetable: any[] = [];"
);

// Add interface for setup Batches
code = code.replace(
  "let setupBatches = [",
  "let setupBatches: any[] = ["
);

// Add interface for setup Faculty
code = code.replace(
  "let setupFaculty = [",
  "let setupFaculty: any[] = ["
);

// Add interface for setup Rooms
code = code.replace(
  "let setupRooms = [",
  "let setupRooms: any[] = ["
);

// Add interface for setup Courses
code = code.replace(
  "let setupCourses = [",
  "let setupCourses: any[] = ["
);

code = code.replace(
  "let usedRoomsThisSlot = newTimetable",
  "let usedRoomsThisSlot: string[] = newTimetable"
);

code = code.replace(
  "let freeRooms = setupRooms.filter(r => !usedRoomsThisSlot.includes(r.name));",
  "let freeRooms: any[] = setupRooms.filter((r: any) => !usedRoomsThisSlot.includes(r.name));"
);

fs.writeFileSync('server.ts', code);
