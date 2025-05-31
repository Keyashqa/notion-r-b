const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); // For socket.io
const { Server } = require('socket.io');
const session = require('express-session');
const passport = require('passport');

const connectToDB = require('./config/db');
const errorHandler = require('./middleware/errorhandler');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_URL,
    credentials: true,
  },
});

// Load Passport strategy (Google OAuth)
require('./utils/passport'); // Make sure you have this file and configured passport GoogleStrategy

// Connect to MongoDB
connectToDB();

// Middleware
app.use(cors({ origin: process.env.CORS_URL, credentials: true }));

// Session middleware (required by Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'some_random_secret', // set in your .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // set true on HTTPS production
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(express.json());

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', require('./routes/authRoutes')); // include Google OAuth routes here
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/workspaces', require('./routes/workspaceRoutes'));
app.use('/api/pages', require('./routes/pageRoutes'));
app.use('/api/blocks', require('./routes/blockRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/admin'));
// app.use('/api/ai', require('./routes/openai'));
app.use('/api/invites', require('./routes/inviteRoute'));

app.get('/', (req, res) => {
  res.send('📄 Notion Clone API is running!');
});

app.use(errorHandler);

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log('🧠 A user connected:', socket.id);

  socket.on('join-page', (pageId) => {
    socket.join(pageId);
    console.log(`User ${socket.id} joined page: ${pageId}`);
  });

  socket.on('block-update', ({ pageId, block }) => {
    socket.to(pageId).emit('block-updated', block);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
});
