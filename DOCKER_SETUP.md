# Docker Setup Guide pour San2Stic

## 🚀 Configuration Corrigée

J'ai corrigé plusieurs problèmes dans votre configuration Docker :

### ✅ Problèmes Résolus

1. **Authentification Base de Données** : Mots de passe cohérents entre services
2. **Dockerfiles Manquants** : Création des Dockerfiles pour frontend et corrections backend
3. **Configuration Nginx** : Proxy vers le service frontend au lieu de volumes locaux
4. **Health Checks** : Ajout de vérifications de santé pour tous les services
5. **Dépendances** : Configuration correcte des dépendances entre services
6. **Permissions Icecast** : Correction des problèmes de permissions

### 📁 Fichiers Créés/Modifiés

- `frontend/Dockerfile` - Nouveau Dockerfile pour React
- `frontend/nginx.conf` - Configuration nginx pour le frontend
- `docker-compose.simple.yml` - Version simplifiée pour tests
- `infra/Dockerfile.backend` - Dockerfile backend corrigé
- `infra/Dockerfile.icecast` - Dockerfile Icecast corrigé
- `docker/nginx/default.conf.template` - Configuration nginx mise à jour

## 🎯 Utilisation

### Option 1: Configuration Simplifiée (Recommandée pour débuter)

```bash
# Démarrer les services essentiels
docker-compose -f docker-compose.simple.yml up -d

# Vérifier l'état
docker-compose -f docker-compose.simple.yml ps

# Voir les logs
docker-compose -f docker-compose.simple.yml logs -f

# Arrêter
docker-compose -f docker-compose.simple.yml down
```

**Services inclus :**
- ✅ PostgreSQL Database (port 5432)
- ✅ Backend API (port 4000)
- ✅ Frontend React (port 3000)
- ✅ Redis Cache (port 6379)

### Option 2: Configuration Complète

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier l'état
docker-compose ps

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

**Services inclus :**
- ✅ Tous les services de la version simple
- ✅ Nginx Reverse Proxy (ports 80, 443)
- ✅ Icecast Streaming Server
- ✅ IPFS Node
- ✅ Tor Hidden Service
- ✅ Watchtower (auto-updates)

## 🔍 Tests de Santé

### Backend API
```bash
curl http://localhost:4000/api/health
# Réponse attendue: {"status":"healthy",...}
```

### Frontend
```bash
curl http://localhost:3000/health
# Réponse attendue: <!DOCTYPE html><html><body>OK</body></html>
```

### Base de Données
```bash
docker-compose exec db pg_isready -U san2stic
# Réponse attendue: /var/run/postgresql:5432 - accepting connections
```

## 🛠️ Dépannage

### Problème: Backend ne démarre pas
```bash
# Vérifier les logs
docker-compose logs backend

# Problème courant: Base de données pas prête
# Solution: Attendre que db soit "healthy"
docker-compose ps
```

### Problème: Frontend ne se charge pas
```bash
# Vérifier si le build s'est bien passé
docker-compose logs frontend

# Reconstruire si nécessaire
docker-compose build frontend --no-cache
```

### Problème: Erreurs de permissions
```bash
# Nettoyer et redémarrer
docker-compose down -v
docker-compose up -d
```

## 🔧 Variables d'Environnement

Les variables sont définies dans `.env` :

```env
# Base de données
POSTGRES_USER=san2stic
POSTGRES_PASSWORD=secure_password_change_this
POSTGRES_DB=san2stic

# JWT
JWT_SECRET=your_jwt_secret_change_this_to_something_secure

# Icecast
ICECAST_SOURCE_PASSWORD=secure_source_password_change_this
ICECAST_ADMIN_PASSWORD=secure_admin_password_change_this
```

## 📊 Monitoring

### Vérifier l'état de tous les services
```bash
docker-compose ps
```

### Voir l'utilisation des ressources
```bash
docker stats
```

### Logs en temps réel
```bash
docker-compose logs -f --tail=100
```

## 🚨 Notes Importantes

1. **Première Utilisation** : Commencez par `docker-compose.simple.yml`
2. **Mots de Passe** : Changez les mots de passe par défaut en production
3. **Volumes** : Les données sont persistées dans des volumes Docker
4. **Ports** : Assurez-vous que les ports ne sont pas déjà utilisés
5. **Ressources** : La configuration complète nécessite plus de RAM

## 🎉 Succès !

Si tout fonctionne correctement, vous devriez voir :
- ✅ Tous les services "healthy" dans `docker-compose ps`
- ✅ Backend accessible sur http://localhost:4000
- ✅ Frontend accessible sur http://localhost:3000
- ✅ Base de données accessible sur localhost:5432

Votre application San2Stic est maintenant prête ! 🎵🗺️