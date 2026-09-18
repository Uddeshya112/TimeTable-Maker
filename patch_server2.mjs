import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const freeRooms = setupRooms.filter(r => !usedRoomsThisSlot.includes(r.name));',
  `let freeRooms = setupRooms.filter(r => !usedRoomsThisSlot.includes(r.name));
              
              // Match room type (e.g. Lab -> Laboratory, Lecture -> Lecture)
              const requiredType = course.type === 'Laboratory' ? 'Laboratory' : (course.type || 'Lecture');
              const matchedTypeRooms = freeRooms.filter(r => r.type === requiredType);
              if (matchedTypeRooms.length > 0) {
                freeRooms = matchedTypeRooms;
              }`
);

fs.writeFileSync('server.ts', code);
