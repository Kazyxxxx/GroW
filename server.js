const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { spawn } = require('child_process');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuration
const PORT = process.env.PORT || 3000;
const BOTS_DIR = path.join(__dirname, 'bots');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Créer les dossiers nécessaires
fs.ensureDirSync(BOTS_DIR);
fs.ensureDirSync(UPLOADS_DIR);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'discord-bot-hosting-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 heures
}));

// Configuration Multer pour l'upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers ZIP sont acceptés'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Base de données simple en mémoire (en production, utiliser une vraie BDD)
let users = [];
let bots = [];
let botProcesses = new Map();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API d'authentification
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(),
    username,
    email,
    password: hashedPassword,
    createdAt: new Date()
  };
  
  users.push(user);
  req.session.userId = user.id;
  res.json({ success: true, user: { id: user.id, username, email } });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }
  
  req.session.userId = user.id;
  res.json({ success: true, user: { id: user.id, username: user.username, email } });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// API des bots
app.get('/api/bots', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  const userBots = bots.filter(bot => bot.userId === req.session.userId);
  res.json(userBots);
});

app.post('/api/bots/upload', upload.single('botFile'), async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  try {
    const { botName } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }
    
    const botId = Date.now().toString();
    const botDir = path.join(BOTS_DIR, botId);
    
    // Créer le dossier du bot
    await fs.ensureDir(botDir);
    
    // Extraire le ZIP
    const extract = require('extract-zip');
    await extract(file.path, { dir: botDir });
    
    // Supprimer le fichier ZIP temporaire
    await fs.unlink(file.path);
    
    const bot = {
      id: botId,
      name: botName,
      userId: req.session.userId,
      status: 'stopped',
      createdAt: new Date(),
      logs: []
    };
    
    bots.push(bot);
    
    res.json({ success: true, bot });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

app.post('/api/bots/:botId/start', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  const bot = bots.find(b => b.id === req.params.botId && b.userId === req.session.userId);
  if (!bot) {
    return res.status(404).json({ error: 'Bot non trouvé' });
  }
  
  try {
    const botDir = path.join(BOTS_DIR, bot.id);
    const mainFile = path.join(botDir, 'index.js');
    
    if (!fs.existsSync(mainFile)) {
      return res.status(400).json({ error: 'Fichier index.js non trouvé' });
    }
    
    // Démarrer le bot
    const botProcess = spawn('node', [mainFile], {
      cwd: botDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    botProcesses.set(bot.id, botProcess);
    bot.status = 'running';
    
    // Gérer les logs
    botProcess.stdout.on('data', (data) => {
      const log = data.toString();
      bot.logs.push({ type: 'info', message: log, timestamp: new Date() });
      io.emit('botLog', { botId: bot.id, log: { type: 'info', message: log, timestamp: new Date() } });
    });
    
    botProcess.stderr.on('data', (data) => {
      const log = data.toString();
      bot.logs.push({ type: 'error', message: log, timestamp: new Date() });
      io.emit('botLog', { botId: bot.id, log: { type: 'error', message: log, timestamp: new Date() } });
    });
    
    botProcess.on('close', (code) => {
      bot.status = 'stopped';
      botProcesses.delete(bot.id);
      io.emit('botStatusChange', { botId: bot.id, status: 'stopped' });
    });
    
    res.json({ success: true, status: 'running' });
  } catch (error) {
    console.error('Erreur démarrage bot:', error);
    res.status(500).json({ error: 'Erreur lors du démarrage' });
  }
});

app.post('/api/bots/:botId/stop', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  const bot = bots.find(b => b.id === req.params.botId && b.userId === req.session.userId);
  if (!bot) {
    return res.status(404).json({ error: 'Bot non trouvé' });
  }
  
  const botProcess = botProcesses.get(bot.id);
  if (botProcess) {
    botProcess.kill();
    botProcesses.delete(bot.id);
  }
  
  bot.status = 'stopped';
  res.json({ success: true, status: 'stopped' });
});

app.delete('/api/bots/:botId', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  const botIndex = bots.findIndex(b => b.id === req.params.botId && b.userId === req.session.userId);
  if (botIndex === -1) {
    return res.status(404).json({ error: 'Bot non trouvé' });
  }
  
  const bot = bots[botIndex];
  
  // Arrêter le bot s'il tourne
  const botProcess = botProcesses.get(bot.id);
  if (botProcess) {
    botProcess.kill();
    botProcesses.delete(bot.id);
  }
  
  // Supprimer les fichiers
  const botDir = path.join(BOTS_DIR, bot.id);
  await fs.remove(botDir);
  
  // Supprimer de la liste
  bots.splice(botIndex, 1);
  
  res.json({ success: true });
});

app.get('/api/bots/:botId/logs', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  const bot = bots.find(b => b.id === req.params.botId && b.userId === req.session.userId);
  if (!bot) {
    return res.status(404).json({ error: 'Bot non trouvé' });
  }
  
  res.json(bot.logs || []);
});

// WebSocket pour les mises à jour en temps réel
io.on('connection', (socket) => {
  console.log('Utilisateur connecté:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté:', socket.id);
  });
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📱 Accédez à l'application sur http://localhost:${PORT}`);
});

module.exports = app;