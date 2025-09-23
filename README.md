<p align="center">
  <h1 align="center">🧪 ChemArena</h1>
  <p align="center">Piattaforma educativa avanzata per quiz interattivi di chimica</p>
</p>

## 🧩 What is this project?

ChemArena is a powerful, open-source chemistry quiz platform with advanced features including:
- **📚 Quiz Archive System** - Permanent storage of all quizzes with 30+ preloaded questions
- **📸 Image Management** - Upload and manage images for questions
- **📊 Statistics Dashboard** - Automatic game statistics and performance tracking
- **📱 QR Code Integration** - Students can join games by scanning QR codes with smartphones
- **👨‍🏫 Teacher Dashboard** - Complete quiz management interface
- **🎮 Real-time Gaming** - Socket.io powered multiplayer experience

> ✨ **NEW FEATURES**: This enhanced version includes quiz persistence, statistics tracking, image support, and smartphone QR code access!

## ⚙️ Prerequisites

- Node.js version 20 or higher

## 📖 Getting Started

1.  #### Clone or download the project
    ```bash
    git clone https://github.com/your-username/ChemArena.git
    cd ./ChemArena
    ```

2.  #### Install dependencies
    ```bash
    npm install
    ```

## 🚀 Running the Application

### Development Mode (Recommended):
```bash
npm run all-dev
```

### Production Mode:
```bash
npm run all
```

## 🌐 Access URLs

After starting the application, access these URLs:

- **🎮 Student Game Page:** http://localhost:3000 (or http://localhost:3001)
- **👨‍🏫 Teacher Dashboard:** http://localhost:3000/dashboard
- **🎯 Game Manager:** http://localhost:3000/manager
- **📊 Socket Server:** Running on port 5505

### Dashboard Login
- **Password:** `admin123`

## 📱 How Students Join Games

### Method 1: QR Code (Smartphone - RECOMMENDED)
1. Teacher starts a game and displays the QR code
2. Students open their smartphone camera
3. Scan the QR code displayed on screen
4. Automatically redirected to game with PIN pre-filled
5. Enter name and start playing!

### Method 2: Manual PIN Entry
1. Go to http://localhost:3000
2. Enter the PIN shown by the teacher
3. Enter your name and join the game

### Method 3: Direct Link
Share the generated URL that includes the PIN automatically.

## 👨‍🏫 Teacher Dashboard Features

### 📚 Quiz Archive
- Browse 30+ preloaded chemistry questions across 6 categories:
  - **Chimica Generale** (Password: chem123)
  - **Chimica Organica** (Password: organica123)
  - **Biochimica** (Password: bio123)
  - **Chimica Analitica** (Password: analitica123)
  - **Chimica Fisica** (Password: fisica123)
  - **Stechiometria** (Password: stechiometria123)

### ➕ Create New Quizzes
- Visual quiz creator with image support
- Upload custom images for questions
- Save quizzes permanently to archive
- Set custom passwords for quiz access

### 🚀 Launch Games
- Select from saved quizzes
- Generate unique PIN codes
- Display QR codes for easy student access
- Real-time player management

### 📊 Statistics & Reports
- Automatic game data collection
- Player performance tracking
- Question difficulty analysis
- Export game data to JSON
- Historical game records (last 50 games)

## 🎯 Complete Game Flow

1. **Teacher Setup:**
   - Access Dashboard → Choose "Launch Game"
   - Select quiz from archive or create new one
   - Enter quiz password → Generate game PIN
   - **QR code appears automatically**

2. **Student Join:**
   - **Smartphone**: Scan QR code → Auto-join
   - **Desktop**: Enter PIN manually at main page

3. **Game Play:**
   - Teacher controls game flow with "Start" button
   - Students answer questions in real-time
   - Live leaderboard updates
   - **Statistics saved automatically**

4. **Game End:**
   - Podium ceremony with final rankings
   - Teacher clicks "🏠 New Game" to return to dashboard
   - All game data saved to statistics panel

## 🔧 Advanced Configuration

### Quiz Structure (in Archive System)
```json
{
  "id": "unique-id",
  "title": "Quiz Title",
  "description": "Quiz description",
  "category": "Subject",
  "password": "quiz-password",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "questions": [
    {
      "question": "What is the correct answer?",
      "answers": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "solution": 1,
      "time": 15,
      "image": "path/to/image.jpg"
    }
  ]
}
```

### Network Configuration
Edit [config.mjs](config.mjs) for custom network setup:
```js
export const WEBSOCKET_PUBLIC_URL = "http://your-ip:5505/"
export const WEBSOCKET_SERVER_PORT = 5505
export const GAME_STATE_INIT = {
  password: "admin123", // Dashboard password
  // ... other settings
}
```

## 🆕 New Features Added

### 📊 Statistics System
- **Automatic Collection**: Every game automatically saves statistics
- **Performance Metrics**: Player scores, question difficulty, game duration
- **Export Functionality**: Download complete game data as JSON
- **Historical Tracking**: View last 50 games with detailed breakdowns

### 📱 QR Code Integration
- **Instant Access**: Students scan QR code to join immediately
- **Responsive Design**: Optimized for all smartphone sizes
- **Fallback Options**: Manual PIN entry always available
- **Share Links**: Generate direct URLs with embedded PIN

### 📚 Quiz Archive System
- **Permanent Storage**: All quizzes saved permanently in JSON database
- **30+ Preloaded Questions**: Ready-to-use content across multiple subjects
- **Image Support**: Upload and manage question images
- **CRUD Operations**: Create, Read, Update, Delete quiz management

### 👨‍🏫 Enhanced Dashboard
- **Tabbed Interface**: Organized sections for different functions
- **Real-time Updates**: Live connection status and server management
- **User-Friendly Design**: Intuitive interface for teachers
- **Quick Actions**: One-click quiz loading and server restart

## 🎓 Educational Benefits

- **Easy Setup**: Teachers can start games in under 2 minutes
- **Student Engagement**: QR codes make joining fun and immediate
- **Performance Tracking**: Detailed statistics help identify learning gaps
- **Reusable Content**: Build a library of quizzes for repeated use
- **Multi-Device Support**: Works on computers, tablets, and smartphones

## 🛠️ Troubleshooting

### Common Issues:
- **Port 5505 in use**: Restart system or change port in config.mjs
- **QR code not working**: Check network connection and URL accessibility
- **Statistics not saving**: Verify localStorage is enabled in browser
- **Quiz not loading**: Check password matches exactly (case-sensitive)

### Server Management:
- Use "🔄 Restart Server" button in dashboard for socket issues
- Check console output for detailed error messages
- Ensure all dependencies are installed with `npm install`

## 📝 Contributing

- Fork the repository
- Create feature branch (`git checkout -b feature/amazing-feature`)
- Commit changes (`git commit -m 'Add amazing feature'`)
- Push to branch (`git push origin feature/amazing-feature`)
- Open a Pull Request

---

## 🎉 Ready to Play!

Start the application with `npm run all-dev` and visit the dashboard to begin creating engaging chemistry quiz experiences for your students!

**Dashboard:** http://localhost:3000/dashboard (Password: admin123)