# 🚀 Quick Start Guide

Ce guide vous permet de démarrer rapidement avec San2Stic Maps, que ce soit pour le développement ou la production.

## 📋 Prérequis

- Docker et Docker Compose
- Git
- (Optionnel) Node.js 18+ pour le développement local

## 🏃‍♂️ Démarrage Rapide

### Option 1: Production avec Images du Registry

```bash
# 1. Cloner le repository
git clone https://github.com/YOUR_USERNAME/san2stic-maps.git
cd san2stic-maps

# 2. Configurer l'environnement
cp .env.prod.example .env.prod
# Éditer .env.prod avec vos valeurs

# 3. Se connecter au GitHub Container Registry (si nécessaire)
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# 4. Démarrer l'application
export GITHUB_REPOSITORY=YOUR_USERNAME/san2stic-maps
./scripts/start-prod.sh
```

### Option 2: Développement Local

```bash
# 1. Cloner le repository
git clone https://github.com/YOUR_USERNAME/san2stic-maps.git
cd san2stic-maps

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Démarrer en mode développement
docker-compose up -d --build

# 4. Vérifier le statut
./scripts/check-deployment.sh docker-compose.yml
```

## 🔧 Configuration Minimale

### Variables d'Environnement Essentielles

```env
# Base de données
POSTGRES_PASSWORD=your_secure_password

# JWT pour l'authentification
JWT_SECRET=your_very_secure_jwt_secret_at_least_32_characters

# Icecast (streaming)
ICECAST_SOURCE_PASSWORD=your_icecast_source_password
ICECAST_ADMIN_PASSWORD=your_icecast_admin_password

# GitHub Container Registry (pour production)
GITHUB_REPOSITORY=your-username/san2stic-maps
```

## 🌐 Points d'Accès

Une fois l'application démarrée :

- **Interface Web**: http://localhost
- **API**: http://localhost/api
- **Documentation API**: http://localhost/api/docs
- **Icecast Admin**: http://localhost/icecast/admin
- **IPFS Gateway**: http://localhost/ipfs

## 🛠️ Commandes Utiles

```bash
# Tester tous les builds
./scripts/test-builds.sh

# Vérifier le statut du déploiement
./scripts/check-deployment.sh

# Voir les logs
docker-compose logs -f [service]

# Redémarrer un service
docker-compose restart [service]

# Arrêter l'application
docker-compose down
```

## 🔍 Dépannage

### Problèmes Courants

1. **Port déjà utilisé**
   ```bash
   # Vérifier les ports utilisés
   lsof -i :80
   lsof -i :443
   ```

2. **Problème de permissions Docker**
   ```bash
   # Ajouter votre utilisateur au groupe docker
   sudo usermod -aG docker $USER
   # Redémarrer votre session
   ```

3. **Images non trouvées**
   ```bash
   # Se connecter au registry
   docker login ghcr.io
   
   # Puller manuellement les images
   ./scripts/pull-images.sh
   ```

4. **Base de données non accessible**
   ```bash
   # Vérifier les logs de la base
   docker-compose logs db
   
   # Redémarrer la base
   docker-compose restart db
   ```

### Logs de Debug

```bash
# Tous les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend

# Logs avec timestamps
docker-compose logs -f -t

# Dernières 100 lignes
docker-compose logs --tail=100
```

## 🚀 Déploiement en Production

### Serveur Cloud

```bash
# Sur votre serveur
git clone https://github.com/YOUR_USERNAME/san2stic-maps.git
cd san2stic-maps

# Configuration
cp .env.prod.example .env.prod
# Éditer avec vos valeurs de production

# Démarrage
export GITHUB_REPOSITORY=YOUR_USERNAME/san2stic-maps
./scripts/start-prod.sh

# Vérification
./scripts/check-deployment.sh
```

### Mise à Jour

```bash
# Puller les dernières images
./scripts/pull-images.sh

# Redémarrer avec les nouvelles images
docker-compose -f docker-compose.prod.yml up -d

# Vérifier
./scripts/check-deployment.sh docker-compose.prod.yml
```

## 📚 Ressources

- [Documentation CI/CD](docs/CI-CD.md)
- [Documentation API](docs/API.md)
- [Guide de Déploiement](README-DEPLOYMENT.md)
- [Architecture](README.md#architecture-overview)

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs : `docker-compose logs -f`
2. Consultez les [Issues GitHub](https://github.com/YOUR_USERNAME/san2stic-maps/issues)
3. Utilisez le script de diagnostic : `./scripts/check-deployment.sh`

---

**Temps de démarrage estimé** : 5-10 minutes pour la production, 2-5 minutes pour le développement.