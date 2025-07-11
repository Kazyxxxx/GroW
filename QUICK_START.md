# 🚀 Guide de Démarrage Rapide

## Installation et Lancement (5 minutes)

### 1. Installation des dépendances
```bash
npm install
```

### 2. Démarrage du serveur
```bash
npm start
```

### 3. Accès à la plateforme
Ouvrez votre navigateur sur : **http://localhost:3000**

## 🎯 Premier Test avec le Bot d'Exemple

### 1. Créer un compte
- Cliquez sur "Inscription"
- Remplissez vos informations
- Connectez-vous automatiquement

### 2. Télécharger le bot d'exemple
Le fichier `examples/simple-discord-bot.zip` contient un bot Discord prêt à l'emploi.

### 3. Déployer le bot d'exemple
1. Dans le dashboard, remplissez le nom : **"Mon Premier Bot"**
2. Uploadez le fichier `examples/simple-discord-bot.zip`
3. Cliquez sur **"Déployer le Bot"**

### 4. Configurer votre bot Discord

**Important** : Pour que le bot fonctionne, vous devez :

1. **Créer une application Discord** :
   - Allez sur https://discord.com/developers/applications
   - Cliquez "New Application"
   - Donnez un nom à votre bot

2. **Obtenir le token** :
   - Dans votre application → "Bot"
   - Cliquez "Reset Token" et copiez-le
   - **⚠️ Ne partagez jamais ce token !**

3. **Ajouter le token dans votre bot** :
   - Vous devrez modifier le code pour inclure votre token
   - Ou utiliser les variables d'environnement (fonctionnalité à venir)

## 📋 Commandes du Bot d'Exemple

Une fois votre bot connecté sur Discord :

| Commande | Description |
|----------|-------------|
| `!ping` | Test de latence |
| `!help` | Liste des commandes |
| `!info` | Informations du bot |
| `!salut` | Salutation personnalisée |
| `!joke` | Blague aléatoire |
| `!roll [nombre]` | Lance un dé |

## 🛠️ Créer Votre Propre Bot

### Structure recommandée :
```
mon-bot/
├── index.js        # Fichier principal
├── package.json    # Dépendances
└── config.json     # Configuration (optionnel)
```

### Template minimal :
```javascript
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', () => {
    console.log('Bot connecté !');
});

client.on('messageCreate', message => {
    if (message.content === '!hello') {
        message.reply('Hello World !');
    }
});

client.login('VOTRE_TOKEN_ICI');
```

## 🚨 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifiez que Node.js est installé
node --version

# Réinstallez les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur de port 3000 occupé
```bash
# Changez le port dans .env
echo "PORT=3001" >> .env
```

### Le bot ne se connecte pas
- Vérifiez que le token Discord est correct
- Assurez-vous que le bot a les bonnes permissions
- Consultez les logs dans l'interface

## 🎉 Prochaines Étapes

1. **Explorez l'interface** : Familiarisez-vous avec le dashboard
2. **Consultez les logs** : Cliquez sur "Logs" pour voir l'activité
3. **Testez les commandes** : Arrêtez/démarrez vos bots
4. **Créez votre bot** : Développez votre propre bot Discord
5. **Lisez la documentation** : Consultez le README.md complet

## 💡 Conseils Pro

- **Sauvegardez vos bots** : Gardez toujours une copie locale
- **Testez localement** : Développez en local avant de déployer
- **Surveillez les logs** : Ils contiennent des informations précieuses
- **Limitez les ressources** : Évitez les boucles infinies dans vos bots

---

**🎯 Objectif atteint ! Vous avez maintenant une plateforme fonctionnelle pour héberger vos bots Discord.**

Pour des questions avancées, consultez le [README.md](README.md) complet.