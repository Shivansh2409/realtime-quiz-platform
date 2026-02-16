# Real-Time Synchronized Quiz Platform

A high-concurrency web application using the MERN stack that allows an Admin to host live, timed quizzes for multiple students simultaneously.

## Features

### Student Experience

- **Multi-User Access**: Multiple students can join the same quiz session via unique Name/ID
- **Synchronized Progression**: All students see the same question at the same time
- **Dynamic Timer**: Countdown clock (20s, 30s, or 60s) per question
- **Instant Results**: Leaderboard and individual score summary after quiz ends

### Admin Control Panel

- **Live Quiz Controller**: Start quiz button pushes questions to all connected students
- **Timer Configuration**: Set custom durations per question during quiz creation
- **QR Generation**: Quick access for students via generated QR code
- **Live Monitoring**: Dashboard showing real-time submission count

### Technical Stack

- **Frontend**: React 18, Vite, React Router, Socket.io-client
- **Backend**: Node.js, Express, Socket.io, MongoDB/Mongoose
- **Real-Time**: Socket.io for instant synchronization

## Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd realtime-quiz-platform
```

2. Install all dependencies:

```bash
npm run install:all
```

3. Configure environment variables:

   **Backend** (`backend/.env`):

   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/quiz-platform
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

   **Frontend** (`frontend/.env`):

   ```env
   VITE_API_URL=http://localhost:3001
   ```

## Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

### Manual Start

**Start Backend:**

```bash
cd backend
npm run dev
```

Server runs on http://localhost:3001

**Start Frontend:**

```bash
cd frontend
npm run dev
```

Client runs on http://localhost:5173

## Usage

### Admin Flow

1. Navigate to http://localhost:5173/admin
2. Create a new quiz with questions and timer settings
3. Click "Host Live" to start a session
4. Share the session code or QR code with students
5. Click "Start Quiz" when ready
6. Control question progression with "Next Question"
7. End the quiz and view results

### Student Flow

1. Navigate to http://localhost:5173/join
2. Enter the session code provided by admin
3. Enter your name
4. Wait for the quiz to start
5. Answer questions before the timer expires
6. View your results and leaderboard

## Project Structure

```
realtime-quiz-platform/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── middleware/        # Express middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── socket/           # Socket.io handlers
│   ├── server.js         # Express server
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Admin/    # Admin dashboard components
│   │   │   ├── Shared/   # Shared components
│   │   │   └── Student/  # Student components
│   │   ├── context/      # React context (Socket)
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
│   ├── .env              # Environment variables
│   └── vite.config.js    # Vite configuration
├── package.json
└── .gitignore
```

## Socket Events

| Event               | Direction       | Description                     |
| ------------------- | --------------- | ------------------------------- |
| `admin-join`        | Client → Server | Admin joins session             |
| `student-join`      | Client → Server | Student joins session           |
| `start-quiz`        | Client → Server | Admin starts the quiz           |
| `next-question`     | Client → Server | Admin advances to next question |
| `submit-answer`     | Client → Server | Student submits answer          |
| `end-quiz`          | Client → Server | Admin ends the quiz             |
| `question`          | Server → Client | Broadcast question to all       |
| `timer-sync`        | Server → Client | Timer countdown updates         |
| `submission-update` | Server → Client | Updated submission count        |
| `quiz-ended`        | Server → Client | Quiz ended with results         |

## API Endpoints

### Quizzes

- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### Sessions

- `POST /api/sessions` - Create session
- `GET /api/sessions/:id` - Get session by ID
- `GET /api/sessions/code/:code` - Get session by code
- `GET /api/sessions/:id/results` - Get session results

## License

MIT
