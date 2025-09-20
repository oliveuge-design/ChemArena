import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const STUDENTS_DB_PATH = path.join(process.cwd(), 'data', 'students-db.json');

// Utilità per leggere il database studenti
function readStudentsDB() {
  try {
    if (fs.existsSync(STUDENTS_DB_PATH)) {
      const data = fs.readFileSync(STUDENTS_DB_PATH, 'utf8');
      return JSON.parse(data);
    }
    return { students: [], classes: [], metadata: { version: "1.0", totalStudents: 0, totalClasses: 0 } };
  } catch (error) {
    console.error('❌ Errore lettura database studenti:', error);
    return { students: [], classes: [], metadata: { version: "1.0", totalStudents: 0, totalClasses: 0 } };
  }
}

// Utilità per scrivere il database studenti
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
    console.error('❌ Errore scrittura database studenti:', error);
    return false;
  }
}

// Utilità per verificare se un nickname è disponibile
function isNicknameAvailable(nickname, className = null, excludeStudentId = null) {
  const db = readStudentsDB();

  return !db.students.some(student =>
    student.nickname.toLowerCase() === nickname.toLowerCase() &&
    student.className === className &&
    student.id !== excludeStudentId &&
    student.isActive
  );
}

// Utilità per generare nickname univoco
function generateUniqueNickname(baseNickname, className) {
  let counter = 1;
  let nickname = baseNickname;

  while (!isNicknameAvailable(nickname, className)) {
    nickname = `${baseNickname}_${counter}`;
    counter++;
  }

  return nickname;
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

// GET: Lista studenti, verifica nickname, statistiche
async function handleGet(req, res) {
  try {
    const { action, nickname, className, studentId, classId } = req.query;
    const db = readStudentsDB();

    switch (action) {
      case 'check-nickname':
        if (!nickname) {
          return res.status(400).json({ error: 'Nickname richiesto' });
        }

        const student = db.students.find(s =>
          s.nickname.toLowerCase() === nickname.toLowerCase() &&
          s.isActive &&
          (!className || s.className === className)
        );

        if (student) {
          return res.status(200).json({
            exists: true,
            student: {
              id: student.id,
              nickname: student.nickname,
              className: student.className,
              fullName: student.fullName,
              requiresPassword: student.requiresPassword || false
            }
          });
        } else {
          return res.status(200).json({ exists: false });
        }

      case 'stats':
        if (!studentId) {
          return res.status(400).json({ error: 'Student ID richiesto' });
        }

        const targetStudent = db.students.find(s => s.id === studentId && s.isActive);
        if (!targetStudent) {
          return res.status(404).json({ error: 'Studente non trovato' });
        }

        return res.status(200).json({
          student: {
            id: targetStudent.id,
            nickname: targetStudent.nickname,
            fullName: targetStudent.fullName,
            className: targetStudent.className
          },
          stats: targetStudent.stats
        });

      case 'class-students':
        if (!classId) {
          return res.status(400).json({ error: 'Class ID richiesto' });
        }

        const classStudents = db.students.filter(s => s.className === classId && s.isActive);
        return res.status(200).json({
          students: classStudents.map(s => ({
            id: s.id,
            nickname: s.nickname,
            fullName: s.fullName,
            stats: {
              totalGames: s.stats.totalGames,
              totalPoints: s.stats.totalPoints,
              averagePosition: s.stats.averagePosition,
              bestPosition: s.stats.bestPosition
            }
          }))
        });

      case 'list':
        return res.status(200).json({
          students: db.students.filter(s => s.isActive).map(s => ({
            id: s.id,
            nickname: s.nickname,
            fullName: s.fullName,
            className: s.className,
            createdAt: s.createdAt
          })),
          classes: db.classes.filter(c => c.isActive)
        });

      default:
        return res.status(400).json({ error: 'Azione non valida' });
    }
  } catch (error) {
    console.error('❌ Errore GET studenti:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
}

// POST: Crea nuovo studente o autentica studente esistente
async function handlePost(req, res) {
  try {
    const { action, nickname, className, fullName, email, password } = req.body;
    const db = readStudentsDB();

    switch (action) {
      case 'register':
        if (!nickname || !className || !fullName) {
          return res.status(400).json({ error: 'Nickname, classe e nome completo richiesti' });
        }

        // Verifica se la classe esiste
        const targetClass = db.classes.find(c => c.id === className && c.isActive);
        if (!targetClass) {
          return res.status(400).json({ error: 'Classe non trovata' });
        }

        // Genera nickname univoco se necessario
        const uniqueNickname = generateUniqueNickname(nickname, className);

        const newStudent = {
          id: `student_${Date.now()}`,
          nickname: uniqueNickname,
          className,
          fullName,
          email: email || '',
          createdAt: new Date().toISOString().split('T')[0],
          isActive: true,
          passwordHash: password ? await bcrypt.hash(password, 10) : null,
          requiresPassword: !!password,
          stats: {
            totalGames: 0,
            totalPoints: 0,
            averagePosition: 0,
            bestPosition: null,
            worstPosition: null,
            favoriteSubject: null,
            gamesHistory: [],
            subjectStats: {}
          }
        };

        db.students.push(newStudent);

        if (writeStudentsDB(db)) {
          return res.status(201).json({
            student: {
              id: newStudent.id,
              nickname: newStudent.nickname,
              className: newStudent.className,
              fullName: newStudent.fullName,
              nicknameChanged: uniqueNickname !== nickname
            }
          });
        } else {
          return res.status(500).json({ error: 'Errore salvataggio studente' });
        }

      case 'authenticate':
        if (!nickname) {
          return res.status(400).json({ error: 'Nickname richiesto' });
        }

        const student = db.students.find(s =>
          s.nickname.toLowerCase() === nickname.toLowerCase() &&
          s.isActive &&
          (!className || s.className === className)
        );

        if (!student) {
          return res.status(404).json({ error: 'Studente non trovato' });
        }

        // Verifica password se richiesta
        if (student.requiresPassword) {
          if (!password) {
            return res.status(400).json({ error: 'Password richiesta per questo studente' });
          }

          const passwordValid = await bcrypt.compare(password, student.passwordHash);
          if (!passwordValid) {
            return res.status(401).json({ error: 'Password non corretta' });
          }
        }

        return res.status(200).json({
          authenticated: true,
          student: {
            id: student.id,
            nickname: student.nickname,
            className: student.className,
            fullName: student.fullName
          }
        });

      case 'update-statistics':
        const { studentId, gameData } = req.body;

        if (!studentId || !gameData) {
          return res.status(400).json({ error: 'StudentId e gameData richiesti' });
        }

        const targetStudent = db.students.find(s => s.id === studentId && s.isActive);
        if (!targetStudent) {
          return res.status(404).json({ error: 'Studente non trovato' });
        }

        // Aggiorna le statistiche
        targetStudent.stats.totalGames += 1;
        targetStudent.stats.totalPoints += gameData.score || 0;
        targetStudent.stats.correctAnswers = (targetStudent.stats.correctAnswers || 0) + (gameData.correctAnswers || 0);
        targetStudent.stats.averageScore = Math.round(
          (targetStudent.stats.totalPoints / targetStudent.stats.totalGames) / 10
        );

        // Aggiorna statistiche per materia
        if (gameData.quizSubject) {
          if (!targetStudent.stats.subjectStats) {
            targetStudent.stats.subjectStats = {};
          }

          if (!targetStudent.stats.subjectStats[gameData.quizSubject]) {
            targetStudent.stats.subjectStats[gameData.quizSubject] = {
              gamesPlayed: 0,
              totalPoints: 0,
              averageScore: 0
            };
          }

          const subjectStats = targetStudent.stats.subjectStats[gameData.quizSubject];
          subjectStats.gamesPlayed += 1;
          subjectStats.totalPoints += gameData.score || 0;
          subjectStats.averageScore = Math.round(subjectStats.totalPoints / subjectStats.gamesPlayed);
        }

        // Aggiungi al history
        if (!targetStudent.stats.gamesHistory) {
          targetStudent.stats.gamesHistory = [];
        }

        targetStudent.stats.gamesHistory.push({
          date: gameData.date,
          subject: gameData.quizSubject,
          score: gameData.score,
          correctAnswers: gameData.correctAnswers,
          totalQuestions: gameData.totalQuestions,
          averageScore: gameData.averageScore,
          duration: gameData.duration
        });

        // Mantieni solo gli ultimi 50 giochi nel history
        if (targetStudent.stats.gamesHistory.length > 50) {
          targetStudent.stats.gamesHistory = targetStudent.stats.gamesHistory.slice(-50);
        }

        // Salva nel database
        if (writeStudentsDB(db)) {
          return res.status(200).json({
            success: true,
            message: 'Statistiche aggiornate con successo',
            newStats: {
              totalGames: targetStudent.stats.totalGames,
              totalPoints: targetStudent.stats.totalPoints,
              averageScore: targetStudent.stats.averageScore
            }
          });
        } else {
          return res.status(500).json({ error: 'Errore salvataggio statistiche' });
        }

      case 'create':
        if (!nickname || !className || !fullName) {
          return res.status(400).json({ error: 'Nickname, classe e nome completo richiesti' });
        }

        // Verifica se la classe esiste
        const createTargetClass = db.classes.find(c => c.name === className && c.isActive);
        if (!createTargetClass) {
          return res.status(400).json({ error: 'Classe non trovata' });
        }

        // Genera nickname univoco se necessario
        const createUniqueNickname = generateUniqueNickname(nickname, className);

        const createNewStudent = {
          id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nickname: createUniqueNickname,
          className,
          fullName,
          email: email || '',
          createdAt: new Date().toISOString(),
          isActive: true,
          passwordHash: password ? await bcrypt.hash(password, 10) : null,
          requiresPassword: !!password,
          statistics: {
            totalGames: 0,
            totalPoints: 0,
            correctAnswers: 0,
            averageScore: 0,
            gamesHistory: [],
            subjectStats: {}
          }
        };

        db.students.push(createNewStudent);

        if (writeStudentsDB(db)) {
          return res.status(201).json({
            success: true,
            student: {
              id: createNewStudent.id,
              nickname: createNewStudent.nickname,
              className: createNewStudent.className,
              fullName: createNewStudent.fullName,
              email: createNewStudent.email,
              requiresPassword: createNewStudent.requiresPassword,
              createdAt: createNewStudent.createdAt,
              statistics: createNewStudent.statistics,
              nicknameChanged: createUniqueNickname !== nickname
            }
          });
        } else {
          return res.status(500).json({ error: 'Errore salvataggio studente' });
        }

      default:
        return res.status(400).json({ error: 'Azione non valida' });
    }
  } catch (error) {
    console.error('❌ Errore POST studenti:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
}

// PUT: Aggiorna statistiche studente
async function handlePut(req, res) {
  try {
    const { action, studentId, gameData, stats } = req.body;
    const db = readStudentsDB();

    if (action === 'update-stats' && studentId && gameData) {
      const studentIndex = db.students.findIndex(s => s.id === studentId && s.isActive);
      if (studentIndex === -1) {
        return res.status(404).json({ error: 'Studente non trovato' });
      }

      const student = db.students[studentIndex];

      // Aggiorna statistiche
      student.stats.totalGames += 1;
      student.stats.totalPoints += gameData.points || 0;

      // Aggiorna posizioni
      if (student.stats.bestPosition === null || gameData.position < student.stats.bestPosition) {
        student.stats.bestPosition = gameData.position;
      }
      if (student.stats.worstPosition === null || gameData.position > student.stats.worstPosition) {
        student.stats.worstPosition = gameData.position;
      }

      // Calcola media posizione
      const totalPositions = student.stats.gamesHistory.reduce((sum, game) => sum + game.position, 0) + gameData.position;
      student.stats.averagePosition = Number((totalPositions / student.stats.totalGames).toFixed(1));

      // Aggiorna statistiche per materia
      const subject = gameData.subject || 'Generale';
      if (!student.stats.subjectStats[subject]) {
        student.stats.subjectStats[subject] = { games: 0, avgPosition: 0, totalPoints: 0 };
      }

      const subjectStats = student.stats.subjectStats[subject];
      subjectStats.games += 1;
      subjectStats.totalPoints += gameData.points || 0;
      subjectStats.avgPosition = Number(((subjectStats.avgPosition * (subjectStats.games - 1) + gameData.position) / subjectStats.games).toFixed(1));

      // Determina materia preferita
      let maxGames = 0;
      let favoriteSubject = null;
      Object.entries(student.stats.subjectStats).forEach(([subj, stats]) => {
        if (stats.games > maxGames) {
          maxGames = stats.games;
          favoriteSubject = subj;
        }
      });
      student.stats.favoriteSubject = favoriteSubject;

      // Aggiungi alla cronologia (mantieni ultimi 50 giochi)
      student.stats.gamesHistory.push({
        gameId: gameData.gameId || `game_${Date.now()}`,
        quizTitle: gameData.quizTitle || 'Quiz',
        position: gameData.position,
        points: gameData.points || 0,
        date: new Date().toISOString().split('T')[0],
        subject: subject
      });

      // Mantieni solo ultimi 50 giochi
      if (student.stats.gamesHistory.length > 50) {
        student.stats.gamesHistory = student.stats.gamesHistory.slice(-50);
      }

      if (writeStudentsDB(db)) {
        return res.status(200).json({
          success: true,
          stats: student.stats
        });
      } else {
        return res.status(500).json({ error: 'Errore aggiornamento statistiche' });
      }
    }

    return res.status(400).json({ error: 'Parametri non validi' });
  } catch (error) {
    console.error('❌ Errore PUT studenti:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
}

// DELETE: Disattiva studente
async function handleDelete(req, res) {
  try {
    const { studentId } = req.query;
    const db = readStudentsDB();

    const studentIndex = db.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Studente non trovato' });
    }

    // Soft delete - marca come inattivo
    db.students[studentIndex].isActive = false;

    if (writeStudentsDB(db)) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Errore disattivazione studente' });
    }
  } catch (error) {
    console.error('❌ Errore DELETE studenti:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
}