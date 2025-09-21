import fs from 'fs';
import path from 'path';

const TEACHERS_DB_PATH = path.join(process.cwd(), 'data', 'teachers-database.json');

// Utilità per leggere database teachers
function readTeachersDB() {
  try {
    if (fs.existsSync(TEACHERS_DB_PATH)) {
      const data = fs.readFileSync(TEACHERS_DB_PATH, 'utf8');
      return JSON.parse(data);
    }
    return { teachers: [] };
  } catch (error) {
    console.error('❌ Errore lettura database teachers:', error);
    return { teachers: [] };
  }
}

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGet(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Metodo ${method} non supportato` });
  }
}

// GET: Lista teachers attivi
async function handleGet(req, res) {
  try {
    const { action } = req.query;
    const teachersDb = readTeachersDB();

    switch (action) {
      case 'list':
      default:
        // Filtra solo teachers attivi
        const activeTeachers = teachersDb.teachers
          .filter(t => t.active)
          .map(teacher => ({
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            subject: teacher.subject,
            role: teacher.role || 'teacher',
            createdAt: teacher.createdAt,
            isActive: teacher.active
          }));

        return res.status(200).json({
          teachers: activeTeachers,
          metadata: {
            totalTeachers: activeTeachers.length,
            totalInDatabase: teachersDb.teachers.length
          }
        });
    }
  } catch (error) {
    console.error('❌ Errore GET teachers:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
}