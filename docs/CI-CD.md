# CI/CD Pipeline Documentation

Ce document explique comment utiliser le pipeline CI/CD pour builder et déployer les images Docker de San2Stic Maps.

## 🏗️ Architecture du Pipeline

Le pipeline CI/CD est composé de deux workflows GitHub Actions :

1. **Build and Push** (`docker-build-push.yml`) - Build et pousse les images vers GitHub Container Registry
2. **Deploy** (`deploy.yml`) - Déploie l'application en utilisant les images du registry

## 📦 Images Docker

Les images suivantes sont buildées et poussées automatiquement :

- `ghcr.io/YOUR_USERNAME/san2stic-maps/backend:latest`
- `ghcr.io/YOUR_USERNAME/san2stic-maps/frontend:latest`
- `ghcr.io/YOUR_USERNAME/san2stic-maps/nginx:latest`
- `ghcr.io/YOUR_USERNAME/san2stic-maps/tor:latest`
- `ghcr.io/YOUR_USERNAME/san2stic-maps/ipfs:latest`
- `ghcr.io/YOUR_USERNAME/san2stic-maps/icecast:latest`

## 🚀 Déclenchement du Pipeline

### Build Automatique

Le pipeline de build se déclenche automatiquement sur :
- Push vers `main` ou `develop`
- Pull Request vers `main`
- Création d'une release

### Déploiement Manuel

Le déploiement peut être déclenché manuellement via l'interface GitHub Actions avec les options :
- `staging` (par défaut)
- `production`

## 🔧 Configuration Requise

### 1. Permissions GitHub

Assurez-vous que votre repository a les permissions suivantes activées :
- `Settings` → `Actions` → `General` → `Workflow permissions` → `Read and write permissions`

### 2. Variables d'Environnement

Créez les secrets suivants dans `Settings` → `Secrets and variables` → `Actions` :

```bash
# Optionnel : si vous voulez utiliser un token personnalisé
GITHUB_TOKEN  # (automatiquement fourni par GitHub)
```

### 3. Environnements

Créez les environnements dans `Settings` → `Environments` :
- `staging`
- `production`

## 📋 Utilisation

### 1. Développement Local avec Images du Registry

```bash
# 1. Cloner le repository
git clone https://github.com/YOUR_USERNAME/san2stic-maps.git
cd san2stic-maps

# 2. Configurer les variables d'environnement
cp .env.prod.example .env.prod
# Éditer .env.prod avec vos valeurs

# 3. Se connecter au GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# 4. Puller les images (optionnel, docker-compose le fera automatiquement)
export GITHUB_REPOSITORY=YOUR_USERNAME/san2stic-maps
./scripts/pull-images.sh

# 5. Lancer l'application avec les images du registry
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### 2. Build Local (Développement)

```bash
# Utiliser le docker-compose de développement
docker-compose up -d --build
```

### 3. Déploiement en Production

```bash
# Sur votre serveur de production
export GITHUB_REPOSITORY=YOUR_USERNAME/san2stic-maps
export POSTGRES_PASSWORD=your_secure_password
export JWT_SECRET=your_secure_jwt_secret

# Puller les dernières images
./scripts/pull-images.sh

# Lancer en production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Monitoring et Logs

### Vérifier le Status des Services

```bash
# Status des containers
docker-compose -f docker-compose.prod.yml ps

# Logs d'un service spécifique
docker-compose -f docker-compose.prod.yml logs -f backend

# Health checks
docker-compose -f docker-compose.prod.yml exec backend curl -f http://localhost:4000/api/health
```

### Images Disponibles

```bash
# Lister les images du registry
docker images | grep ghcr.io

# Informations sur une image
docker inspect ghcr.io/YOUR_USERNAME/san2stic-maps/backend:latest
```

## 🔄 Workflow de Développement

1. **Développement** : Travaillez sur une branche feature
2. **Pull Request** : Créez une PR vers `main` (déclenche le build)
3. **Review** : Les images sont buildées et testées automatiquement
4. **Merge** : Merge vers `main` (déclenche build + déploiement staging)
5. **Production** : Déploiement manuel vers production via GitHub Actions

## 🛠️ Personnalisation

### Ajouter un Nouveau Service

1. Ajoutez le service dans `docker-compose.yml`
2. Ajoutez-le dans la matrice du workflow `.github/workflows/docker-build-push.yml`
3. Mettez à jour `docker-compose.prod.yml`
4. Ajoutez-le dans `scripts/pull-images.sh`

### Modifier les Tags

Les tags sont générés automatiquement :
- `latest` pour la branche main
- `branch-name` pour les autres branches
- `pr-123` pour les pull requests
- `v1.0.0` pour les releases

## 🐛 Dépannage

### Erreur d'Authentification

```bash
# Vérifier la connexion au registry
docker login ghcr.io

# Vérifier les permissions du token
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

### Image Non Trouvée

```bash
# Vérifier que l'image existe
docker pull ghcr.io/YOUR_USERNAME/san2stic-maps/backend:latest

# Lister les packages du repository
# Aller sur https://github.com/YOUR_USERNAME/san2stic-maps/packages
```

### Build Failed

1. Vérifiez les logs dans GitHub Actions
2. Testez le build localement :
   ```bash
   docker build -t test-backend ./backend -f ./infra/Dockerfile.backend
   ```

## 📚 Ressources

- [GitHub Container Registry Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)