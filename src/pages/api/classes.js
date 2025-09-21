import fs from 'fs';
import path from 'path';

const STUDENTS_DB_PATH = path.join(process.cwd(), 'data', 'students-db-enhanced.json');
const TEACHERS_DB_PATH = path.join(process.cwd(), 'data', 'teachers-database.json');

// Utilità per leggere il database enhanced
function readEnhancedDB() {
  try {
    if (fs.existsSync(STUDENTS_DB_PATH)) {
      const data = fs.readFileSync(STUDENTS_DB_PATH, 'utf8');
      return JSON.parse(data);
    }
    return {
      students: [],
      classes: [],
      gameResults: [],
      relationships: { studentTeachers: [], classTeachers: [] },
      metadata: { version: "2.0", totalStudents: 0, totalClasses: 0, totalTeachers: 0 }
    };
  } catch (error) {
    console.error('❌ Errore lettura database enhanced:', error);
    return {
      students: [],
      classes: [],
      gameResults: [],
      relationships: { studentTeachers: [], classTeachers: [] },
      metadata: { version: "2.0", totalStudents: 0, totalClasses: 0, totalTeachers: 0 }
    };
  }
}

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

// Utilità per scrivere il database enhanced
function writeEnhancedDB(data) {
  try {
    const dir = path.dirname(STUDENTS_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Aggiorna metadata enhanced
    data.metadata.lastUpdate = new Date().toISOString().split('T')[0];
    data.metadata.totalStudents = data.students.length;
    data.metadata.totalClasses = data.classes.length;
    data.metadata.totalTeachers = new Set(data.classes.flatMap(c => c.teachers)).size;
    data.metadata.totalGameResults = data.gameResults.length;
    data.metadata.totalRelationships =
      data.relationships.studentTeachers.length + data.relationships.classTeachers.length;

    // Backup automatico
    const backupPath = path.join(dir, `students-db-backup-${Date.now()}.json`);
    if (fs.existsSync(STUDENTS_DB_PATH)) {
      fs.copyFileSync(STUDENTS_DB_PATH, backupPath);
    }

    fs.writeFileSync(STUDENTS_DB_PATH, JSON.stringify(data, null, 2));
    console.log('✅ Database enhanced salvato con backup:', path.basename(backupPath));
    return true;
  } catch (error) {
    console.error('❌ Errore scrittura database enhanced:', error);
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

// GET: Lista classi e statistiche enhanced
async function handleGet(req, res) {
  try {
    const { action, classId } = req.query;
    const db = readEnhancedDB();
    const teachersDb = readTeachersDB();

    switch (action) {
      case 'list':
        const classesWithStats = db.classes.filter(c => c.isActive).map(cls => {
          // Trova studenti appartenenti alla classe (Many-to-Many)
          const classStudents = db.students.filter(s =>
            s.classes && Array.isArray(s.classes) && s.classes.includes(cls.id) && s.isActive
          );

          // Calcola statistiche aggregate
          const totalGames = classStudents.reduce((sum, s) => sum + (s.statistics?.totalGames || 0), 0);
          const totalPoints = classStudents.reduce((sum, s) => sum + (s.statistics?.totalPoints || 0), 0);
          const averageScore = classStudents.length > 0
            ? classStudents.reduce((sum, s) => sum + (s.statistics?.averageScore || 0), 0) / classStudents.length
            : 0;

          // Trova teachers collegati alla classe
          const classTeachers = cls.teachers.map(teacherId => {
            const teacher = teachersDb.teachers.find(t => t.id === teacherId);
            return teacher ? {
              id: teacher.id,
              name: teacher.name,
              email: teacher.email,
              subject: teacher.subject
            } : null;
          }).filter(Boolean);

          // Top studenti per performance
          const topStudents = classStudents
            .sort((a, b) => (b.statistics?.averageScore || 0) - (a.statistics?.averageScore || 0))
            .slice(0, 3)
            .map(s => ({
              id: s.id,
              nickname: s.nickname,
              fullName: s.fullName,
              totalPoints: s.statistics?.totalPoints || 0,
              averageScore: s.statistics?.averageScore || 0,
              totalGames: s.statistics?.totalGames || 0
            }));

          // Statistiche game results della classe
          const classGameResults = db.gameResults.filter(gr => gr.sessionInfo?.classId === cls.id);
          const recentGames = classGameResults
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5)
            .map(gr => ({
              id: gr.id,
              date: gr.gameDate,
              quizTitle: gr.quizInfo?.quizTitle,
              subject: gr.quizInfo?.subject,
              totalPlayers: gr.sessionInfo?.totalPlayers || 0,
              averageScore: gr.statistics?.averageScore || 0
            }));

          return {
            ...cls,
            studentsCount: classStudents.length,
            teachersCount: classTeachers.length,
            totalGames,
            totalPoints,
            averageScore: Number(averageScore.toFixed(1)),
            teachers: classTeachers,
            topStudents,
            recentGames,
            performanceStats: {
              totalGameResults: classGameResults.length,
              lastGameDate: cls.statistics?.lastGameDate || null,
              improvementRate: cls.statistics?.progressTracking?.improvementRate || 0
            }
          };
        });

        return res.status(200).json({
          classes: classesWithStats,
          metadata: {
            totalClasses: classesWithStats.length,
            totalActiveStudents: db.students.filter(s => s.isActive).length,
            totalActiveTeachers: teachersDb.teachers.filter(t => t.active).length
          }
        });

      case 'details':
        if (!classId) {
          return res.status(400).json({ error: 'Class ID richiesto' });
        }

        const targetClass = db.classes.find(c => c.id === classId && c.isActive);
        if (!targetClass) {
          return res.status(404).json({ error: 'Classe non trovata' });
        }

        // Trova studenti della classe (Many-to-Many)
        const classStudents = db.students.filter(s =>
          s.classes && Array.isArray(s.classes) && s.classes.includes(classId) && s.isActive
        );

        // Trova teachers della classe
        const classTeachers = targetClass.teachers.map(teacherId => {
          const teacher = teachersDb.teachers.find(t => t.id === teacherId);
          return teacher ? {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            subject: teacher.subject,
            role: teacher.role
          } : null;
        }).filter(Boolean);

        // Statistiche aggregate enhanced
        const classStats = {
          totalStudents: classStudents.length,
          totalTeachers: classTeachers.length,
          totalGames: classStudents.reduce((sum, s) => sum + (s.statistics?.totalGames || 0), 0),
          totalPoints: classStudents.reduce((sum, s) => sum + (s.statistics?.totalPoints || 0), 0),
          averageScore: classStudents.length > 0
            ? classStudents.reduce((sum, s) => sum + (s.statistics?.averageScore || 0), 0) / classStudents.length
            : 0,
          subjectDistribution: {},
          gameResults: targetClass.statistics?.totalGames || 0,
          lastActivity: targetClass.statistics?.lastGameDate || null
        };

        // Distribuzione per materia enhanced
        classStudents.forEach(student => {
          if (student.statistics?.subjectStats) {
            Object.entries(student.statistics.subjectStats).forEach(([subject, stats]) => {
              if (!classStats.subjectDistribution[subject]) {
                classStats.subjectDistribution[subject] = {
                  gamesPlayed: 0,
                  totalPoints: 0,
                  averageScore: 0,
                  studentsCount: 0,
                  accuracy: 0
                };
              }
              classStats.subjectDistribution[subject].gamesPlayed += stats.gamesPlayed || 0;
              classStats.subjectDistribution[subject].totalPoints += stats.totalPoints || 0;
              classStats.subjectDistribution[subject].studentsCount++;
            });
          }
        });

        // Calcola medie per materia
        Object.keys(classStats.subjectDistribution).forEach(subject => {
          const subjectData = classStats.subjectDistribution[subject];
          if (subjectData.studentsCount > 0) {
            subjectData.averageScore = subjectData.totalPoints / subjectData.studentsCount;
          }
        });

        // Game results della classe
        const classGameResults = db.gameResults.filter(gr => gr.sessionInfo?.classId === classId);

        // Student relationships
        const studentTeacherRelations = db.relationships.studentTeachers.filter(rel =>
          classStudents.some(s => s.id === rel.studentId)
        );

        return res.status(200).json({
          class: targetClass,
          stats: classStats,
          teachers: classTeachers,
          students: classStudents.map(s => ({
            id: s.id,
            nickname: s.nickname,
            fullName: s.fullName,
            email: s.email,
            statistics: s.statistics,
            joinDate: s.createdAt
          })),
          gameResults: classGameResults.slice(0, 10), // Ultimi 10 game results
          relationships: {
            studentTeachers: studentTeacherRelations,
            classTeachers: db.relationships.classTeachers.filter(rel => rel.classId === classId)
          }
        });

      default:
        return res.status(400).json({ error: 'Azione non valida' });
    }
  } catch (error) {
    console.error('❌ Errore GET classi:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
}

// POST: Crea nuova classe enhanced
async function handlePost(req, res) {
  try {
    const { name, description, teachers, school, academicYear, settings } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome classe richiesto' });
    }

    const db = readEnhancedDB();
    const teachersDb = readTeachersDB();

    // Genera ID classe univoco
    const classId = name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
    let uniqueId = classId;
    let counter = 1;

    while (db.classes.some(c => c.id === uniqueId)) {
      uniqueId = `${classId}_${counter}`;
      counter++;
    }

    // Valida teachers se forniti
    const validTeachers = [];
    if (teachers && Array.isArray(teachers)) {
      for (const teacherId of teachers) {
        const teacher = teachersDb.teachers.find(t => t.id === teacherId && t.active);
        if (teacher) {
          validTeachers.push(teacherId);
        } else {
          return res.status(400).json({ error: `Teacher con ID ${teacherId} non trovato o non attivo` });
        }
      }
    }

    const newClass = {
      id: uniqueId,
      name,
      description: description || `Classe ${name}`,
      school: school || "Scuola non specificata",
      academicYear: academicYear || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      teachers: validTeachers,
      students: [], // Array di student IDs (Many-to-Many)
      createdAt: new Date().toISOString(),
      isActive: true,
      settings: {
        requiresPassword: settings?.requiresPassword || false,
        allowAnonymous: settings?.allowAnonymous ?? true,
        trackStats: settings?.trackStats ?? true,
        autoEnrollment: settings?.autoEnrollment ?? true
      },
      statistics: {
        totalStudents: 0,
        totalGames: 0,
        averageScore: 0,
        lastGameDate: null,
        progressTracking: {
          weeklyAverage: 0,
          monthlyAverage: 0,
          improvementRate: 0
        }
      }
    };

    db.classes.push(newClass);

    // Crea relazioni class-teacher
    for (const teacherId of validTeachers) {
      const teacher = teachersDb.teachers.find(t => t.id === teacherId);
      db.relationships.classTeachers.push({
        classId: uniqueId,
        teacherId: teacherId,
        subjects: [teacher?.subject || "Materia non specificata"],
        role: teacher?.role || "teacher",
        startDate: new Date().toISOString().split('T')[0],
        isActive: true
      });
    }

    if (writeEnhancedDB(db)) {
      console.log(`✅ Classe creata: ${uniqueId} con ${validTeachers.length} teachers`);
      return res.status(201).json({
        class: newClass,
        generatedId: uniqueId !== classId ? uniqueId : null,
        teachersAssigned: validTeachers.length
      });
    } else {
      return res.status(500).json({ error: 'Errore creazione classe enhanced' });
    }
  } catch (error) {
    console.error('❌ Errore POST classi enhanced:', error);
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  }
}

// PUT: Aggiorna classe enhanced
async function handlePut(req, res) {
  try {
    const { classId } = req.query;
    const updateData = req.body;

    if (!classId) {
      return res.status(400).json({ error: 'Class ID richiesto' });
    }

    const db = readEnhancedDB();
    const teachersDb = readTeachersDB();
    const classIndex = db.classes.findIndex(c => c.id === classId && c.isActive);

    if (classIndex === -1) {
      return res.status(404).json({ error: 'Classe non trovata' });
    }

    // Aggiorna solo campi specificati
    const allowedFields = ['name', 'description', 'school', 'academicYear', 'settings', 'teachers'];
    const updatedClass = { ...db.classes[classIndex] };

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'teachers') {
          // Valida teachers se aggiornati
          const validTeachers = [];
          if (Array.isArray(updateData.teachers)) {
            for (const teacherId of updateData.teachers) {
              const teacher = teachersDb.teachers.find(t => t.id === teacherId && t.active);
              if (teacher) {
                validTeachers.push(teacherId);
              } else {
                return res.status(400).json({ error: `Teacher con ID ${teacherId} non trovato o non attivo` });
              }
            }
          }

          // Aggiorna relazioni class-teacher
          // Rimuovi relazioni esistenti
          db.relationships.classTeachers = db.relationships.classTeachers.filter(rel =>
            rel.classId !== classId
          );

          // Aggiungi nuove relazioni
          for (const teacherId of validTeachers) {
            const teacher = teachersDb.teachers.find(t => t.id === teacherId);
            db.relationships.classTeachers.push({
              classId: classId,
              teacherId: teacherId,
              subjects: [teacher?.subject || "Materia non specificata"],
              role: teacher?.role || "teacher",
              startDate: new Date().toISOString().split('T')[0],
              isActive: true
            });
          }

          updatedClass.teachers = validTeachers;
        } else {
          updatedClass[field] = updateData[field];
        }
      }
    }

    db.classes[classIndex] = updatedClass;

    if (writeEnhancedDB(db)) {
      console.log(`✅ Classe aggiornata: ${classId}`);
      return res.status(200).json({
        class: updatedClass,
        message: 'Classe aggiornata con successo'
      });
    } else {
      return res.status(500).json({ error: 'Errore aggiornamento classe enhanced' });
    }
  } catch (error) {
    console.error('❌ Errore PUT classi enhanced:', error);
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  }
}

// DELETE: Disattiva classe enhanced
async function handleDelete(req, res) {
  try {
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({ error: 'Class ID richiesto' });
    }

    const db = readEnhancedDB();
    const classIndex = db.classes.findIndex(c => c.id === classId);

    if (classIndex === -1) {
      return res.status(404).json({ error: 'Classe non trovata' });
    }

    // Soft delete - marca come inattiva
    db.classes[classIndex].isActive = false;

    // Rimuovi classe dalle liste degli studenti (Many-to-Many)
    db.students.forEach(student => {
      if (student.classes && Array.isArray(student.classes) && student.classes.includes(classId)) {
        student.classes = student.classes.filter(clsId => clsId !== classId);
        // Se studente non ha più classi, disattivalo
        if (student.classes.length === 0) {
          student.isActive = false;
        }
      }
    });

    // Disattiva relazioni class-teacher
    db.relationships.classTeachers.forEach(rel => {
      if (rel.classId === classId) {
        rel.isActive = false;
      }
    });

    // Disattiva relazioni student-teacher della classe
    const classStudentIds = db.students
      .filter(s => s.classes && Array.isArray(s.classes) && s.classes.includes(classId))
      .map(s => s.id);

    db.relationships.studentTeachers.forEach(rel => {
      if (classStudentIds.includes(rel.studentId) && rel.classrooms.includes(classId)) {
        rel.classrooms = rel.classrooms.filter(clsId => clsId !== classId);
        // Se relazione non ha più classi, disattivala
        if (rel.classrooms.length === 0) {
          rel.isActive = false;
        }
      }
    });

    if (writeEnhancedDB(db)) {
      console.log(`✅ Classe disattivata: ${classId}`);
      return res.status(200).json({
        success: true,
        message: 'Classe disattivata con successo',
        affectedStudents: classStudentIds.length
      });
    } else {
      return res.status(500).json({ error: 'Errore disattivazione classe enhanced' });
    }
  } catch (error) {
    console.error('❌ Errore DELETE classi enhanced:', error);
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  }
}