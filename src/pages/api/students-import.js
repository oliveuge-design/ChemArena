import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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
    throw error;
  }
}

// Utilità per scrivere il database enhanced
function writeEnhancedDB(data) {
  try {
    const dir = path.dirname(STUDENTS_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Aggiorna metadata
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

// Leggi database teachers
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

// Trova teacher by email
function findTeacherByEmail(email, teachersDb) {
  return teachersDb.teachers.find(t =>
    t.email.toLowerCase() === email.toLowerCase() && t.active
  );
}

// Genera nickname univoco
function generateUniqueNickname(baseNickname, className, existingStudents) {
  let nickname = baseNickname.toLowerCase().replace(/\s+/g, '_');
  let counter = 1;

  while (existingStudents.some(s =>
    s.nickname.toLowerCase() === nickname &&
    s.classes.includes(className)
  )) {
    nickname = `${baseNickname.toLowerCase().replace(/\s+/g, '_')}_${className.toLowerCase()}_${counter}`;
    counter++;
  }

  return nickname;
}

// Crea struttura base studente
function createStudentStructure(studentData, teachers, className) {
  return {
    id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    nickname: studentData.nickname,
    fullName: studentData.fullName,
    email: studentData.email || '',
    classes: [className],
    teachers: teachers,
    createdAt: new Date().toISOString(),
    isActive: true,
    passwordHash: null,
    requiresPassword: false,
    statistics: {
      totalGames: 0,
      totalPoints: 0,
      correctAnswers: 0,
      averageScore: 0,
      gamesHistory: [],
      subjectStats: {},
      teacherStats: teachers.reduce((acc, teacherId) => {
        acc[teacherId] = {
          gamesPlayed: 0,
          totalPoints: 0,
          averageScore: 0,
          subjects: [],
          lastGameDate: null,
          bestScore: 0,
          improvementRate: 0
        };
        return acc;
      }, {}),
      progressTracking: {
        weeklyProgress: [],
        monthlyProgress: [],
        subjectProgress: {},
        difficultyProgress: {},
        streaks: {
          current: 0,
          longest: 0,
          lastGameDate: null
        }
      }
    }
  };
}

// Valida dati import
async function validateImportData(studentsData) {
  const db = readEnhancedDB();
  const teachersDb = readTeachersDB();

  const results = {
    valid: [],
    errors: [],
    warnings: [],
    teachersToCreate: [],
    classesToCreate: []
  };

  for (let i = 0; i < studentsData.length; i++) {
    const student = studentsData[i];
    const rowNum = student.rowNumber || i + 1;

    try {
      // Validazione campi obbligatori
      if (!student.fullName || !student.nickname || !student.className) {
        results.errors.push(`Riga ${rowNum}: fullName, nickname e className sono obbligatori`);
        continue;
      }

      // Validazione formato email
      if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
        results.warnings.push(`Riga ${rowNum}: formato email non valido per ${student.fullName}`);
      }

      // Controlla se classe esiste
      let targetClass = db.classes.find(c => c.id === student.className || c.name === student.className);
      if (!targetClass) {
        if (!results.classesToCreate.includes(student.className)) {
          results.classesToCreate.push(student.className);
        }
      }

      // Controlla teachers
      const teacherIds = [];
      const missingTeachers = [];

      for (const email of student.teacherEmailsList || []) {
        const teacher = findTeacherByEmail(email, teachersDb);
        if (teacher) {
          teacherIds.push(teacher.id);
        } else {
          missingTeachers.push(email);
        }
      }

      if (missingTeachers.length > 0) {
        results.warnings.push(
          `Riga ${rowNum}: Teachers non trovati - ${missingTeachers.join(', ')} per ${student.fullName}`
        );
      }

      // Controlla nickname duplicati
      const existingStudent = db.students.find(s =>
        s.nickname.toLowerCase() === student.nickname.toLowerCase() &&
        s.classes.includes(student.className)
      );

      if (existingStudent) {
        results.warnings.push(
          `Riga ${rowNum}: Nickname '${student.nickname}' già esistente nella classe ${student.className}, verrà generato nickname univoco`
        );
      }

      results.valid.push({
        ...student,
        teacherIds,
        missingTeachers,
        rowNumber: rowNum
      });

    } catch (error) {
      results.errors.push(`Riga ${rowNum}: ${error.message}`);
    }
  }

  return results;
}

// Esegui import completo
async function executeImport(studentsData, validation) {
  const db = readEnhancedDB();
  const teachersDb = readTeachersDB();

  const results = {
    success: { students: 0, classes: 0, relationships: 0 },
    errors: [],
    warnings: validation.warnings || [],
    created: { students: [], classes: [], relationships: [] }
  };

  try {
    // 1. Crea classi mancanti
    for (const className of validation.classesToCreate || []) {
      const classId = className.replace(/\s+/g, '_').toUpperCase();
      const newClass = {
        id: classId,
        name: className,
        description: `Classe importata automaticamente da CSV - ${className}`,
        school: "Importata da Google Sheets",
        academicYear: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
        teachers: [],
        students: [],
        createdAt: new Date().toISOString(),
        isActive: true,
        settings: {
          requiresPassword: false,
          allowAnonymous: true,
          trackStats: true,
          autoEnrollment: true
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
      results.success.classes++;
      results.created.classes.push(newClass);
    }

    // 2. Processa ogni studente
    for (const studentData of validation.valid || []) {
      try {
        const className = studentData.className;
        const classId = className.replace(/\s+/g, '_').toUpperCase();

        // Trova o crea la classe
        let targetClass = db.classes.find(c => c.id === classId || c.name === className);
        if (!targetClass) {
          // Fallback: cerca per nome simile
          targetClass = db.classes.find(c =>
            c.name.toLowerCase().includes(className.toLowerCase())
          );
        }

        if (!targetClass) {
          results.errors.push(`Classe non trovata per studente ${studentData.fullName}: ${className}`);
          continue;
        }

        // Genera nickname univoco se necessario
        const uniqueNickname = generateUniqueNickname(
          studentData.nickname,
          targetClass.id,
          db.students
        );

        if (uniqueNickname !== studentData.nickname) {
          results.warnings.push(
            `Nickname cambiato per ${studentData.fullName}: ${studentData.nickname} → ${uniqueNickname}`
          );
        }

        // Crea lo studente
        const newStudent = createStudentStructure(
          { ...studentData, nickname: uniqueNickname },
          studentData.teacherIds || [],
          targetClass.id
        );

        db.students.push(newStudent);

        // Aggiungi studente alla classe
        if (!targetClass.students.includes(newStudent.id)) {
          targetClass.students.push(newStudent.id);
        }

        // Aggiungi teachers alla classe se non presenti
        for (const teacherId of studentData.teacherIds || []) {
          if (!targetClass.teachers.includes(teacherId)) {
            targetClass.teachers.push(teacherId);
          }
        }

        // Crea relazioni student-teacher
        for (const teacherId of studentData.teacherIds || []) {
          const relationship = {
            studentId: newStudent.id,
            teacherId: teacherId,
            subjects: [], // Da definire in base ai quiz futuri
            classrooms: [targetClass.id],
            startDate: new Date().toISOString().split('T')[0],
            isActive: true,
            statistics: {
              gamesPlayed: 0,
              averageScore: 0,
              lastInteraction: null,
              progressNotes: []
            }
          };

          db.relationships.studentTeachers.push(relationship);
          results.success.relationships++;
          results.created.relationships.push(relationship);
        }

        // Aggiorna statistiche classe
        targetClass.statistics.totalStudents = targetClass.students.length;

        results.success.students++;
        results.created.students.push({
          id: newStudent.id,
          nickname: newStudent.nickname,
          fullName: newStudent.fullName,
          className: targetClass.name
        });

      } catch (error) {
        results.errors.push(`Errore importazione ${studentData.fullName}: ${error.message}`);
      }
    }

    // 3. Aggiorna relazioni class-teacher
    for (const classData of db.classes) {
      for (const teacherId of classData.teachers) {
        const existingRelation = db.relationships.classTeachers.find(r =>
          r.classId === classData.id && r.teacherId === teacherId
        );

        if (!existingRelation) {
          const teacher = teachersDb.teachers.find(t => t.id === teacherId);
          db.relationships.classTeachers.push({
            classId: classData.id,
            teacherId: teacherId,
            subjects: [teacher?.subject || "Materia non specificata"],
            role: "imported",
            startDate: new Date().toISOString().split('T')[0],
            isActive: true
          });
        }
      }
    }

    // 4. Salva database aggiornato
    if (writeEnhancedDB(db)) {
      console.log(`✅ Import completato: ${results.success.students} studenti, ${results.success.classes} classi`);
    } else {
      throw new Error('Errore nel salvataggio del database');
    }

    return results;

  } catch (error) {
    console.error('❌ Errore durante import:', error);
    results.errors.push(`Errore generale: ${error.message}`);
    return results;
  }
}

// Handler principale
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non supportato' });
  }

  const { action, students, validation } = req.body;

  try {
    switch (action) {
      case 'validate':
        if (!students || !Array.isArray(students)) {
          return res.status(400).json({ error: 'Array studenti richiesto per validazione' });
        }

        const validateResult = await validateImportData(students);
        return res.status(200).json(validateResult);

      case 'import':
        if (!students) {
          return res.status(400).json({ error: 'Array studenti richiesto per import' });
        }

        // Genera sempre una validazione completa
        console.log('🔍 Generating validation for students:', students.length);
        const importValidation = await validateImportData(students);
        console.log('🔍 Validation result:', JSON.stringify(importValidation, null, 2));

        if (importValidation.errors && importValidation.errors.length > 0) {
          return res.status(400).json({
            error: 'Errori di validazione devono essere risolti prima dell\'import',
            validationErrors: importValidation.errors
          });
        }

        console.log('🔍 Proceeding with import using validation:', Object.keys(importValidation));
        const importResult = await executeImport(students, importValidation);

        if (importResult.errors && importResult.errors.length > 0 && importResult.success.students === 0) {
          return res.status(400).json(importResult);
        }

        return res.status(200).json({
          message: 'Import completato',
          ...importResult
        });

      default:
        return res.status(400).json({ error: 'Azione non supportata' });
    }

  } catch (error) {
    console.error('❌ Errore API students-import:', error);
    return res.status(500).json({
      error: 'Errore interno del server',
      details: error.message
    });
  }
}