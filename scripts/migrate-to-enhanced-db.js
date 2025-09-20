const fs = require('fs');
const path = require('path');

// Percorsi file
const OLD_DB_PATH = path.join(__dirname, '..', 'data', 'students-db.json');
const NEW_DB_PATH = path.join(__dirname, '..', 'data', 'students-db-enhanced.json');
const TEACHERS_DB_PATH = path.join(__dirname, '..', 'data', 'teachers-database.json');
const BACKUP_PATH = path.join(__dirname, '..', 'data', `students-db-backup-${Date.now()}.json`);

function log(message) {
  console.log(`🔄 [MIGRATION] ${message}`);
}

function migrateDatabase() {
  try {
    log('Starting database migration to enhanced structure...');

    // 1. Leggi database esistenti
    const oldDb = JSON.parse(fs.readFileSync(OLD_DB_PATH, 'utf8'));
    const teachersDb = JSON.parse(fs.readFileSync(TEACHERS_DB_PATH, 'utf8'));

    // 2. Crea backup
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(oldDb, null, 2));
    log(`Backup created: ${BACKUP_PATH}`);

    // 3. Mappa teachers per nome → ID
    const teacherNameToId = {};
    teachersDb.teachers.forEach(teacher => {
      // Estrai nome senza "Prof." o "Prof.ssa"
      const cleanName = teacher.name.replace(/^Prof\.?\s*ssa?\s*/, '').trim();
      teacherNameToId[cleanName] = teacher.id;
      teacherNameToId[teacher.name] = teacher.id; // Anche nome completo
    });

    log(`Teachers mapped: ${Object.keys(teacherNameToId).length} entries`);

    // 4. Inizializza nuova struttura
    const newDb = {
      students: [],
      classes: [],
      gameResults: [],
      relationships: {
        studentTeachers: [],
        classTeachers: []
      },
      metadata: {
        version: "2.0",
        lastUpdate: new Date().toISOString().split('T')[0],
        totalStudents: 0,
        totalClasses: 0,
        totalTeachers: 0,
        totalGameResults: 0,
        totalRelationships: 0,
        migrationDate: new Date().toISOString(),
        structure: "enhanced_many_to_many"
      }
    };

    // 5. Migra le classi
    oldDb.classes.forEach(oldClass => {
      // Trova teacher ID dal nome
      const teacherId = teacherNameToId[oldClass.teacher] || null;

      const newClass = {
        id: oldClass.id,
        name: oldClass.name,
        description: `Classe migrata automaticamente - ${oldClass.name}`,
        school: oldClass.school || "Scuola non specificata",
        academicYear: oldClass.academicYear || new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
        teachers: teacherId ? [teacherId] : [],
        students: [], // Verrà popolato durante migrazione studenti
        createdAt: oldClass.createdAt,
        isActive: oldClass.isActive,
        settings: oldClass.settings || {
          requiresPassword: false,
          allowAnonymous: true,
          trackStats: true,
          autoEnrollment: false
        },
        statistics: {
          totalStudents: oldClass.studentsCount || 0,
          totalGames: 0,
          averageScore: 0,
          lastGameDate: null
        }
      };

      newDb.classes.push(newClass);

      // Aggiungi relazione class-teacher
      if (teacherId) {
        newDb.relationships.classTeachers.push({
          classId: oldClass.id,
          teacherId: teacherId,
          subjects: [oldClass.subject || "Materia non specificata"],
          role: "primary",
          startDate: oldClass.createdAt || new Date().toISOString().split('T')[0],
          isActive: true
        });
      }
    });

    log(`Classes migrated: ${newDb.classes.length}`);

    // 6. Migra gli studenti
    oldDb.students.forEach(oldStudent => {
      // Trova la classe e il teacher
      const studentClass = newDb.classes.find(c => c.id === oldStudent.className);
      const teacherId = studentClass ? studentClass.teachers[0] : null;

      const newStudent = {
        id: oldStudent.id,
        nickname: oldStudent.nickname,
        fullName: oldStudent.fullName,
        email: oldStudent.email || '',
        classes: oldStudent.className ? [oldStudent.className] : [],
        teachers: teacherId ? [teacherId] : [],
        createdAt: oldStudent.createdAt,
        isActive: oldStudent.isActive,
        passwordHash: oldStudent.passwordHash,
        requiresPassword: oldStudent.requiresPassword,
        statistics: {
          totalGames: oldStudent.stats?.totalGames || 0,
          totalPoints: oldStudent.stats?.totalPoints || 0,
          correctAnswers: oldStudent.stats?.correctAnswers || 0,
          averageScore: oldStudent.stats?.averageScore || 0,
          gamesHistory: [], // Migreremo separatamente se necessario
          subjectStats: {},
          teacherStats: {}
        }
      };

      // Migra subjectStats se esistono
      if (oldStudent.stats?.subjectStats) {
        Object.keys(oldStudent.stats.subjectStats).forEach(subject => {
          const oldSubjectStat = oldStudent.stats.subjectStats[subject];
          newStudent.statistics.subjectStats[subject] = {
            gamesPlayed: oldSubjectStat.games || 0,
            totalPoints: oldSubjectStat.totalPoints || 0,
            averageScore: Math.round((oldSubjectStat.totalPoints || 0) / Math.max(oldSubjectStat.games || 1, 1)),
            bestScore: oldSubjectStat.bestScore || 0,
            teachers: teacherId ? [teacherId] : []
          };
        });
      }

      // Crea teacherStats se ha teachers
      if (teacherId) {
        newStudent.statistics.teacherStats[teacherId] = {
          gamesPlayed: newStudent.statistics.totalGames,
          totalPoints: newStudent.statistics.totalPoints,
          averageScore: newStudent.statistics.averageScore,
          subjects: Object.keys(newStudent.statistics.subjectStats)
        };
      }

      newDb.students.push(newStudent);

      // Aggiungi studente alla classe
      if (studentClass) {
        studentClass.students.push(oldStudent.id);
      }

      // Aggiungi relazione student-teacher
      if (teacherId) {
        newDb.relationships.studentTeachers.push({
          studentId: oldStudent.id,
          teacherId: teacherId,
          subjects: Object.keys(newStudent.statistics.subjectStats),
          classrooms: oldStudent.className ? [oldStudent.className] : [],
          startDate: oldStudent.createdAt || new Date().toISOString().split('T')[0],
          isActive: true
        });
      }
    });

    log(`Students migrated: ${newDb.students.length}`);

    // 7. Aggiorna metadata
    newDb.metadata.totalStudents = newDb.students.length;
    newDb.metadata.totalClasses = newDb.classes.length;
    newDb.metadata.totalTeachers = new Set(newDb.classes.flatMap(c => c.teachers)).size;
    newDb.metadata.totalGameResults = newDb.gameResults.length;
    newDb.metadata.totalRelationships = newDb.relationships.studentTeachers.length + newDb.relationships.classTeachers.length;

    // 8. Salva nuovo database
    fs.writeFileSync(NEW_DB_PATH, JSON.stringify(newDb, null, 2));
    log(`New enhanced database saved: ${NEW_DB_PATH}`);

    // 9. Statistiche finali
    log('='.repeat(50));
    log('MIGRATION COMPLETED SUCCESSFULLY');
    log('='.repeat(50));
    log(`📊 Students: ${newDb.metadata.totalStudents}`);
    log(`🏫 Classes: ${newDb.metadata.totalClasses}`);
    log(`👥 Teachers: ${newDb.metadata.totalTeachers}`);
    log(`🔗 Relationships: ${newDb.metadata.totalRelationships}`);
    log(`💾 Backup: ${path.basename(BACKUP_PATH)}`);
    log('='.repeat(50));

    return {
      success: true,
      newDbPath: NEW_DB_PATH,
      backupPath: BACKUP_PATH,
      stats: newDb.metadata
    };

  } catch (error) {
    log(`❌ Migration failed: ${error.message}`);
    console.error(error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Esegui migrazione se chiamato direttamente
if (require.main === module) {
  const result = migrateDatabase();
  process.exit(result.success ? 0 : 1);
}

module.exports = { migrateDatabase };