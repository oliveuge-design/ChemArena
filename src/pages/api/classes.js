import fs from 'fs';
import path from 'path';

const STUDENTS_DB_PATH = path.join(process.cwd(), 'data', 'students-db.json');

// Utilità per leggere il database
function readStudentsDB() {
  try {
    if (fs.existsSync(STUDENTS_DB_PATH)) {
      const data = fs.readFileSync(STUDENTS_DB_PATH, 'utf8');
      return JSON.parse(data);
    }
    return { students: [], classes: [], metadata: { version: "1.0", totalStudents: 0, totalClasses: 0 } };
  } catch (error) {
    console.error('❌ Errore lettura database:', error);
    return { students: [], classes: [], metadata: { version: "1.0", totalStudents: 0, totalClasses: 0 } };
  }
}

// Utilità per scrivere il database
function writeStudentsDB(data) {
  try {
    const dir = path.dirname(STUDENTS_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Aggiorna metadata
    data.metadata.lastUpdate = new Date().toISOString().split('T')[0];
    data.metadata.totalStudents = data.students.length;
    data.metadata.totalClasses = data.classes.length;

    fs.writeFileSync(STUDENTS_DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Errore scrittura database:', error);
    return false;
  }
}

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Metodo ${method} non supportato` });
  }
}

// GET: Lista classi e statistiche
async function handleGet(req, res) {
  try {
    const { action, classId } = req.query;
    const db = readStudentsDB();

    switch (action) {
      case 'list':
        const classesWithStats = db.classes.filter(c => c.isActive).map(cls => {
          const classStudents = db.students.filter(s => s.className === cls.id && s.isActive);
          const totalGames = classStudents.reduce((sum, s) => sum + s.stats.totalGames, 0);
          const totalPoints = classStudents.reduce((sum, s) => sum + s.stats.totalPoints, 0);
          const avgClassPosition = classStudents.length > 0
            ? Number((classStudents.reduce((sum, s) => sum + s.stats.averagePosition, 0) / classStudents.length).toFixed(1))
            : 0;

          return {
            ...cls,
            studentsCount: classStudents.length,
            totalGames,
            totalPoints,
            avgClassPosition,
            topStudents: classStudents
              .sort((a, b) => b.stats.totalPoints - a.stats.totalPoints)
              .slice(0, 3)
              .map(s => ({
                nickname: s.nickname,
                fullName: s.fullName,
                totalPoints: s.stats.totalPoints,
                averagePosition: s.stats.averagePosition
              }))
          };
        });

        return res.status(200).json({ classes: classesWithStats });

      case 'details':
        if (!classId) {
          return res.status(400).json({ error: 'Class ID richiesto' });
        }

        const targetClass = db.classes.find(c => c.id === classId && c.isActive);
        if (!targetClass) {
          return res.status(404).json({ error: 'Classe non trovata' });
        }

        const students = db.students.filter(s => s.className === classId && s.isActive);

        // Statistiche aggregate classe
        const classStats = {
          totalStudents: students.length,
          totalGames: students.reduce((sum, s) => sum + s.stats.totalGames, 0),
          totalPoints: students.reduce((sum, s) => sum + s.stats.totalPoints, 0),
          averagePosition: students.length > 0
            ? Number((students.reduce((sum, s) => sum + s.stats.averagePosition, 0) / students.length).toFixed(1))
            : 0,
          subjectDistribution: {}
        };

        // Distribuzione per materia
        students.forEach(student => {
          Object.entries(student.stats.subjectStats).forEach(([subject, stats]) => {
            if (!classStats.subjectDistribution[subject]) {
              classStats.subjectDistribution[subject] = { games: 0, totalPoints: 0 };
            }
            classStats.subjectDistribution[subject].games += stats.games;
            classStats.subjectDistribution[subject].totalPoints += stats.totalPoints;
          });
        });

        return res.status(200).json({
          class: targetClass,
          stats: classStats,
          students: students.map(s => ({
            id: s.id,
            nickname: s.nickname,
            fullName: s.fullName,
            stats: s.stats
          }))
        });

      default:
        return res.status(400).json({ error: 'Azione non valida' });
    }
  } catch (error) {
    console.error('❌ Errore GET classi:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
}

// POST: Crea nuova classe
async function handlePost(req, res) {
  try {
    const { name, teacher, school, settings } = req.body;

    if (!name || !teacher) {
      return res.status(400).json({ error: 'Nome classe e docente richiesti' });
    }

    const db = readStudentsDB();

    // Genera ID classe univoco
    const classId = name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
    let uniqueId = classId;
    let counter = 1;

    while (db.classes.some(c => c.id === uniqueId)) {
      uniqueId = `${classId}_${counter}`;
      counter++;
    }

    const newClass = {
      id: uniqueId,
      name,
      teacher,
      school: school || '',
      studentsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
      settings: {
        requiresPassword: settings?.requiresPassword || false,
        allowAnonymous: settings?.allowAnonymous ?? true,
        trackStats: settings?.trackStats ?? true
      }
    };

    db.classes.push(newClass);

    if (writeStudentsDB(db)) {
      return res.status(201).json({
        class: newClass,
        generatedId: uniqueId !== classId ? uniqueId : null
      });
    } else {
      return res.status(500).json({ error: 'Errore creazione classe' });
    }
  } catch (error) {
    console.error('❌ Errore POST classi:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
}

// PUT: Aggiorna classe
async function handlePut(req, res) {
  try {
    const { classId } = req.query;
    const updateData = req.body;

    if (!classId) {
      return res.status(400).json({ error: 'Class ID richiesto' });
    }

    const db = readStudentsDB();
    const classIndex = db.classes.findIndex(c => c.id === classId && c.isActive);

    if (classIndex === -1) {
      return res.status(404).json({ error: 'Classe non trovata' });
    }

    // Aggiorna solo campi specificati
    const allowedFields = ['name', 'teacher', 'school', 'settings'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        db.classes[classIndex][field] = updateData[field];
      }
    });

    if (writeStudentsDB(db)) {
      return res.status(200).json({ class: db.classes[classIndex] });
    } else {
      return res.status(500).json({ error: 'Errore aggiornamento classe' });
    }
  } catch (error) {
    console.error('❌ Errore PUT classi:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
}

// DELETE: Disattiva classe
async function handleDelete(req, res) {
  try {
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({ error: 'Class ID richiesto' });
    }

    const db = readStudentsDB();
    const classIndex = db.classes.findIndex(c => c.id === classId);

    if (classIndex === -1) {
      return res.status(404).json({ error: 'Classe non trovata' });
    }

    // Soft delete - marca come inattiva
    db.classes[classIndex].isActive = false;

    // Disattiva anche tutti gli studenti della classe
    db.students.forEach(student => {
      if (student.className === classId) {
        student.isActive = false;
      }
    });

    if (writeStudentsDB(db)) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Errore disattivazione classe' });
    }
  } catch (error) {
    console.error('❌ Errore DELETE classi:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
}