import fs from 'fs';
import path from 'path';

const STUDENTS_DB_PATH = path.join(process.cwd(), 'data', 'students-db-enhanced.json');
const QUIZ_ARCHIVE_PATH = path.join(process.cwd(), 'data', 'quiz-archive.json');

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

// Utilità per leggere l'archivio quiz
function readQuizArchive() {
  try {
    if (fs.existsSync(QUIZ_ARCHIVE_PATH)) {
      const data = fs.readFileSync(QUIZ_ARCHIVE_PATH, 'utf8');
      return JSON.parse(data);
    }
    return { quizzes: [] };
  } catch (error) {
    console.error('❌ Errore lettura archivio quiz:', error);
    return { quizzes: [] };
  }
}

// Salva risultato di gioco nel database enhanced
export async function saveGameResult(gameResult) {
  try {
    const db = readEnhancedDB();

    // Struttura completa del risultato
    const enhancedGameResult = {
      id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      gameDate: new Date().toISOString().split('T')[0],

      // Informazioni quiz
      quizInfo: {
        quizId: gameResult.quizId || null,
        quizTitle: gameResult.quizTitle || "Quiz sconosciuto",
        subject: gameResult.subject || "Materia non specificata",
        difficulty: gameResult.difficulty || "media",
        totalQuestions: gameResult.totalQuestions || 0,
        gameMode: gameResult.gameMode || "standard",
        timeLimit: gameResult.timeLimit || null
      },

      // Informazioni sessione
      sessionInfo: {
        teacherId: gameResult.teacherId || null,
        classId: gameResult.classId || null,
        sessionDuration: gameResult.sessionDuration || 0,
        totalPlayers: gameResult.totalPlayers || 0,
        completedPlayers: gameResult.completedPlayers || 0
      },

      // Risultati giocatori
      players: gameResult.players || [],

      // Statistiche generali
      statistics: {
        averageScore: 0,
        medianScore: 0,
        minScore: 0,
        maxScore: 0,
        totalCorrectAnswers: 0,
        totalAnswers: 0,
        accuracyPercentage: 0,
        questionsStats: gameResult.questionsStats || [],
        difficultyBreakdown: gameResult.difficultyBreakdown || {},
        timeStatistics: {
          averageAnswerTime: 0,
          fastestAnswer: null,
          slowestAnswer: null
        }
      }
    };

    // Calcola statistiche automaticamente
    if (enhancedGameResult.players.length > 0) {
      const scores = enhancedGameResult.players.map(p => p.score || 0);
      const sortedScores = scores.sort((a, b) => a - b);

      enhancedGameResult.statistics.averageScore =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;

      enhancedGameResult.statistics.medianScore =
        sortedScores[Math.floor(sortedScores.length / 2)];

      enhancedGameResult.statistics.minScore = Math.min(...scores);
      enhancedGameResult.statistics.maxScore = Math.max(...scores);

      // Calcola risposte corrette totali
      enhancedGameResult.statistics.totalCorrectAnswers =
        enhancedGameResult.players.reduce((sum, p) => sum + (p.correctAnswers || 0), 0);

      enhancedGameResult.statistics.totalAnswers =
        enhancedGameResult.players.reduce((sum, p) => sum + (p.totalAnswers || 0), 0);

      if (enhancedGameResult.statistics.totalAnswers > 0) {
        enhancedGameResult.statistics.accuracyPercentage =
          (enhancedGameResult.statistics.totalCorrectAnswers / enhancedGameResult.statistics.totalAnswers) * 100;
      }
    }

    // Aggiungi al database
    db.gameResults.push(enhancedGameResult);

    // Aggiorna statistiche studenti
    for (const player of enhancedGameResult.players) {
      const student = db.students.find(s =>
        s.nickname === player.nickname || s.id === player.studentId
      );

      if (student) {
        // Aggiorna statistiche generali
        student.statistics.totalGames++;
        student.statistics.totalPoints += player.score || 0;
        student.statistics.correctAnswers += player.correctAnswers || 0;
        student.statistics.averageScore = student.statistics.totalPoints / student.statistics.totalGames;

        // Aggiungi alla cronologia
        student.statistics.gamesHistory.push({
          gameId: enhancedGameResult.id,
          date: enhancedGameResult.gameDate,
          quizTitle: enhancedGameResult.quizInfo.quizTitle,
          subject: enhancedGameResult.quizInfo.subject,
          score: player.score || 0,
          correctAnswers: player.correctAnswers || 0,
          totalQuestions: enhancedGameResult.quizInfo.totalQuestions,
          accuracy: enhancedGameResult.quizInfo.totalQuestions > 0 ?
            ((player.correctAnswers || 0) / enhancedGameResult.quizInfo.totalQuestions) * 100 : 0,
          position: player.position || null,
          timeSpent: player.timeSpent || null
        });

        // Aggiorna statistiche per materia
        const subject = enhancedGameResult.quizInfo.subject;
        if (!student.statistics.subjectStats[subject]) {
          student.statistics.subjectStats[subject] = {
            gamesPlayed: 0,
            totalPoints: 0,
            averageScore: 0,
            bestScore: 0,
            accuracy: 0,
            totalQuestions: 0,
            correctAnswers: 0
          };
        }

        student.statistics.subjectStats[subject].gamesPlayed++;
        student.statistics.subjectStats[subject].totalPoints += player.score || 0;
        student.statistics.subjectStats[subject].correctAnswers += player.correctAnswers || 0;
        student.statistics.subjectStats[subject].totalQuestions += enhancedGameResult.quizInfo.totalQuestions;
        student.statistics.subjectStats[subject].averageScore =
          student.statistics.subjectStats[subject].totalPoints / student.statistics.subjectStats[subject].gamesPlayed;

        if ((player.score || 0) > student.statistics.subjectStats[subject].bestScore) {
          student.statistics.subjectStats[subject].bestScore = player.score || 0;
        }

        if (student.statistics.subjectStats[subject].totalQuestions > 0) {
          student.statistics.subjectStats[subject].accuracy =
            (student.statistics.subjectStats[subject].correctAnswers / student.statistics.subjectStats[subject].totalQuestions) * 100;
        }

        // Aggiorna statistiche teacher
        if (enhancedGameResult.sessionInfo.teacherId && student.statistics.teacherStats[enhancedGameResult.sessionInfo.teacherId]) {
          const teacherStats = student.statistics.teacherStats[enhancedGameResult.sessionInfo.teacherId];
          teacherStats.gamesPlayed++;
          teacherStats.totalPoints += player.score || 0;
          teacherStats.averageScore = teacherStats.totalPoints / teacherStats.gamesPlayed;
          teacherStats.lastGameDate = enhancedGameResult.gameDate;

          if ((player.score || 0) > teacherStats.bestScore) {
            teacherStats.bestScore = player.score || 0;
          }

          if (!teacherStats.subjects.includes(subject)) {
            teacherStats.subjects.push(subject);
          }
        }

        // Aggiorna progress tracking
        const today = new Date().toISOString().split('T')[0];
        student.statistics.progressTracking.streaks.lastGameDate = today;

        // Calcola streak
        const lastGame = student.statistics.gamesHistory[student.statistics.gamesHistory.length - 2];
        if (lastGame) {
          const daysDiff = Math.floor((new Date(today) - new Date(lastGame.date)) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            student.statistics.progressTracking.streaks.current++;
          } else if (daysDiff > 1) {
            student.statistics.progressTracking.streaks.current = 1;
          }

          if (student.statistics.progressTracking.streaks.current > student.statistics.progressTracking.streaks.longest) {
            student.statistics.progressTracking.streaks.longest = student.statistics.progressTracking.streaks.current;
          }
        } else {
          student.statistics.progressTracking.streaks.current = 1;
          student.statistics.progressTracking.streaks.longest = 1;
        }
      }
    }

    // Aggiorna statistiche classe
    if (enhancedGameResult.sessionInfo.classId) {
      const classData = db.classes.find(c => c.id === enhancedGameResult.sessionInfo.classId);
      if (classData) {
        classData.statistics.totalGames++;
        classData.statistics.lastGameDate = enhancedGameResult.gameDate;

        // Calcola media classe da tutti i giochi
        const classGames = db.gameResults.filter(g => g.sessionInfo.classId === classData.id);
        if (classGames.length > 0) {
          const totalScores = classGames.reduce((sum, game) => {
            return sum + game.players.reduce((gameSum, player) => gameSum + (player.score || 0), 0);
          }, 0);
          const totalPlayers = classGames.reduce((sum, game) => sum + game.players.length, 0);

          if (totalPlayers > 0) {
            classData.statistics.averageScore = totalScores / totalPlayers;
          }
        }
      }
    }

    // Salva database aggiornato
    const dir = path.dirname(STUDENTS_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Aggiorna metadata
    db.metadata.lastUpdate = new Date().toISOString().split('T')[0];
    db.metadata.totalGameResults = db.gameResults.length;

    fs.writeFileSync(STUDENTS_DB_PATH, JSON.stringify(db, null, 2));

    console.log(`✅ Risultato gioco salvato: ${enhancedGameResult.id}`);
    return { success: true, gameId: enhancedGameResult.id };

  } catch (error) {
    console.error('❌ Errore salvataggio risultato gioco:', error);
    return { success: false, error: error.message };
  }
}

// API per ottenere statistiche
export default async function handler(req, res) {
  if (req.method === 'POST' && req.body.action === 'saveGameResult') {
    const result = await saveGameResult(req.body.gameResult);
    return res.status(result.success ? 200 : 500).json(result);
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo non supportato' });
  }

  const { type, studentId, classId, teacherId, subject, timeRange } = req.query;

  try {
    const db = readEnhancedDB();
    const quizArchive = readQuizArchive();

    switch (type) {
      case 'student':
        if (!studentId) {
          return res.status(400).json({ error: 'studentId richiesto' });
        }

        const student = db.students.find(s => s.id === studentId || s.nickname === studentId);
        if (!student) {
          return res.status(404).json({ error: 'Studente non trovato' });
        }

        return res.status(200).json({
          student: {
            id: student.id,
            nickname: student.nickname,
            fullName: student.fullName,
            classes: student.classes
          },
          statistics: student.statistics,
          gameResults: db.gameResults.filter(g =>
            g.players.some(p => p.nickname === student.nickname || p.studentId === student.id)
          )
        });

      case 'class':
        if (!classId) {
          return res.status(400).json({ error: 'classId richiesto' });
        }

        const classData = db.classes.find(c => c.id === classId);
        if (!classData) {
          return res.status(404).json({ error: 'Classe non trovata' });
        }

        const classStudents = db.students.filter(s => s.classes.includes(classId));
        const classGames = db.gameResults.filter(g => g.sessionInfo.classId === classId);

        return res.status(200).json({
          class: classData,
          students: classStudents.map(s => ({
            id: s.id,
            nickname: s.nickname,
            fullName: s.fullName,
            statistics: s.statistics
          })),
          gameResults: classGames,
          aggregatedStats: {
            totalStudents: classStudents.length,
            totalGames: classGames.length,
            averageClassScore: classData.statistics.averageScore,
            subjectBreakdown: {}
          }
        });

      case 'teacher':
        if (!teacherId) {
          return res.status(400).json({ error: 'teacherId richiesto' });
        }

        const teacherStudents = db.students.filter(s =>
          s.teachers.includes(teacherId) ||
          Object.keys(s.statistics.teacherStats).includes(teacherId)
        );
        const teacherGames = db.gameResults.filter(g => g.sessionInfo.teacherId === teacherId);
        const teacherClasses = db.classes.filter(c => c.teachers.includes(teacherId));

        return res.status(200).json({
          teacherId,
          students: teacherStudents.map(s => ({
            id: s.id,
            nickname: s.nickname,
            fullName: s.fullName,
            classes: s.classes,
            teacherStats: s.statistics.teacherStats[teacherId] || null
          })),
          classes: teacherClasses,
          gameResults: teacherGames,
          aggregatedStats: {
            totalStudents: teacherStudents.length,
            totalClasses: teacherClasses.length,
            totalGames: teacherGames.length,
            averageScore: teacherGames.length > 0 ?
              teacherGames.reduce((sum, g) => sum + g.statistics.averageScore, 0) / teacherGames.length : 0
          }
        });

      case 'overview':
        return res.status(200).json({
          metadata: db.metadata,
          summary: {
            totalStudents: db.students.length,
            totalClasses: db.classes.length,
            totalGameResults: db.gameResults.length,
            totalQuizzes: quizArchive.quizzes.length,
            recentGames: db.gameResults
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 10),
            topPerformers: db.students
              .filter(s => s.statistics.totalGames > 0)
              .sort((a, b) => b.statistics.averageScore - a.statistics.averageScore)
              .slice(0, 10)
              .map(s => ({
                id: s.id,
                nickname: s.nickname,
                fullName: s.fullName,
                averageScore: s.statistics.averageScore,
                totalGames: s.statistics.totalGames
              })),
            subjectStats: {}
          }
        });

      default:
        return res.status(400).json({ error: 'Tipo di statistica non supportato' });
    }

  } catch (error) {
    console.error('❌ Errore API quiz-statistics:', error);
    return res.status(500).json({
      error: 'Errore interno del server',
      details: error.message
    });
  }
}