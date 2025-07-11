# 🤖 Discord Bot Hosting Platform

Une plateforme moderne et intuitive pour héberger vos bots Discord facilement !

![Discord Bot Hosting](https://img.shields.io/badge/Discord-Bot%20Hosting-7289da?style=for-the-badge&logo=discord)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)

## ✨ Fonctionnalités

- 🚀 **Déploiement facile** - Uploadez votre bot en fichier ZIP et déployez instantanément
- 📊 **Dashboard intuitif** - Interface moderne pour gérer tous vos bots
- 🔄 **Contrôle en temps réel** - Démarrez, arrêtez et surveillez vos bots
- 📝 **Logs en direct** - Consultez les logs de vos bots en temps réel
- 👥 **Multi-utilisateurs** - Système d'authentification sécurisé
- 📱 **Interface responsive** - Compatible mobile et desktop
- ⚡ **WebSocket** - Mises à jour en temps réel via Socket.IO

## 🛠️ Technologies utilisées

- **Backend** : Node.js + Express.js
- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **WebSocket** : Socket.IO
- **Sécurité** : bcryptjs, helmet
- **Upload** : Multer
- **Interface** : Font Awesome, CSS Grid/Flexbox

## 📦 Installation

### Prérequis

- Node.js 16+ 
- npm ou yarn

### Installation rapide

1. **Clonez le projet**
```bash
git clone <votre-repo>
cd discord-bot-hosting
```

2. **Installez les dépendances**
```bash
npm install
```

3. **Configurez l'environnement**
```bash
# Copiez le fichier .env.example vers .env
cp .env.example .env

# Modifiez les variables selon vos besoins
nano .env
```

4. **Démarrez l'application**
```bash
# Mode développement avec rechargement automatique
npm run dev

# Mode production
npm start
```

5. **Accédez à l'application**
Ouvrez votre navigateur sur `http://localhost:3000`

## 🎮 Utilisation

### 1. Créer un compte
- Rendez-vous sur la page d'accueil
- Cliquez sur "Inscription" 
- Remplissez vos informations

### 2. Préparer votre bot Discord

Votre bot doit être structuré comme suit :
```
mon-bot-discord/
├── index.js          # Fichier principal (obligatoire)
├── package.json      # Dépendances (obligatoire)
├── config.json       # Configuration (optionnel)
├── commands/         # Commandes du bot (optionnel)
│   ├── ping.js
│   └── help.js
└── data/            # Données du bot (optionnel)
```

**Exemple d'index.js minimal :**
```javascript
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    if (message.content === '!ping') {
        message.reply('Pong!');
    }
});

client.login(process.env.DISCORD_TOKEN);
```

### 3. Déployer votre bot

1. **Créez un fichier ZIP** contenant tous les fichiers de votre bot
2. **Connectez-vous** au dashboard
3. **Remplissez le nom** de votre bot
4. **Glissez-déposez** votre fichier ZIP ou cliquez pour sélectionner
5. **Cliquez sur "Déployer le Bot"**

### 4. Gérer vos bots

- ▶️ **Démarrer/Arrêter** : Contrôlez l'état de vos bots
- 📊 **Voir les logs** : Consultez les logs en temps réel
- 🗑️ **Supprimer** : Supprimez un bot et ses fichiers

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
PORT=3000                              # Port du serveur
SESSION_SECRET=votre-secret-securise   # Clé secrète pour les sessions
NODE_ENV=development                   # Environnement (development/production)

# Configuration pour l'hébergement
BOTS_DIR=./bots                       # Dossier des bots
UPLOADS_DIR=./uploads                 # Dossier temporaire uploads
MAX_FILE_SIZE=50MB                    # Taille max des fichiers
```

### Structure des dossiers

```
discord-bot-hosting/
├── server.js              # Serveur principal
├── package.json           # Configuration npm
├── .env                   # Variables d'environnement
├── README.md              # Documentation
├── public/                # Fichiers statiques
│   ├── index.html         # Page d'accueil
│   └── dashboard.html     # Dashboard
├── bots/                  # Bots déployés (auto-créé)
│   ├── 1234567890/        # Dossier d'un bot
│   └── 1234567891/        # Dossier d'un autre bot
└── uploads/               # Uploads temporaires (auto-créé)
```

## 🔒 Sécurité

- ✅ Authentification par session sécurisée
- ✅ Hashage des mots de passe avec bcrypt
- ✅ Protection CSRF avec helmet
- ✅ Validation des fichiers uploadés
- ✅ Limitation de taille des fichiers
- ✅ Isolation des bots par utilisateur

## 🚀 Déploiement en production

### 1. Variables d'environnement
```env
NODE_ENV=production
SESSION_SECRET=votre-secret-tres-securise
PORT=80
```

### 2. Avec PM2 (recommandé)
```bash
npm install -g pm2
pm2 start server.js --name "discord-bot-hosting"
pm2 startup
pm2 save
```

### 3. Avec Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["npm", "start"]
```

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- 📖 Consultez la documentation
- 🐛 Signalez les bugs via les Issues GitHub
- 💬 Posez vos questions sur Discord

## 🔮 Roadmap

- [ ] Base de données persistante (PostgreSQL/MongoDB)
- [ ] Système de ressources (CPU/RAM limits)
- [ ] Backup automatique des bots
- [ ] Métriques avancées (uptime, mémoire, etc.)
- [ ] API REST complète
- [ ] Support Docker Compose
- [ ] Interface d'administration
- [ ] Système de notifications

---

**Fait avec ❤️ pour la communauté Discord**