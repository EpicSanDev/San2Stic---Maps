# 🚀 Guide de Déploiement San2Stic - Tor + Clear Web

Ce guide vous explique comment déployer San2Stic pour qu'il soit accessible à la fois sur le réseau Tor et sur le clear web via Cloudflare.

## 📋 Prérequis

### Serveur
- Ubuntu 20.04+ ou Debian 11+
- 4GB RAM minimum (8GB recommandé)
- 50GB d'espace disque minimum
- Docker et Docker Compose installés
- Accès root ou sudo

### Cloudflare
- Compte Cloudflare (gratuit ou payant)
- Domaine configuré sur Cloudflare
- API Token avec permissions Zone:Edit

### Outils requis
```bash
# Installer les dépendances
sudo apt update
sudo apt install -y curl jq git docker.io docker-compose
```

## 🔧 Configuration Initiale

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd San2Stic---Maps
```

### 2. Configurer l'environnement
```bash
# Copier le fichier d'environnement
cp .env.production .env.production.local

# Éditer la configuration
nano .env.production.local
```

**Variables critiques à modifier :**
```bash
# Domaine
DOMAIN_NAME=votre-domaine.com

# Sécurité (CHANGEZ CES VALEURS !)
POSTGRES_PASSWORD=votre_mot_de_passe_db_securise
JWT_SECRET=votre_jwt_secret_tres_securise_64_caracteres_minimum
ICECAST_SOURCE_PASSWORD=mot_de_passe_source_icecast
ICECAST_ADMIN_PASSWORD=mot_de_passe_admin_icecast

# Cloudflare
CLOUDFLARE_ZONE_ID=votre_zone_id_cloudflare
CLOUDFLARE_API_TOKEN=votre_api_token_cloudflare
CLOUDFLARE_TUNNEL_TOKEN=votre_tunnel_token_cloudflare  # Optionnel
```

### 3. Configurer Cloudflare

#### Option A: Configuration automatique
```bash
# Configurer Cloudflare automatiquement
./scripts/setup-cloudflare.sh setup
```

#### Option B: Configuration manuelle
1. **DNS Records:**
   - A record: `votre-domaine.com` → IP de votre serveur (Proxied: ON)
   - A record: `www.votre-domaine.com` → IP de votre serveur (Proxied: ON)

2. **SSL/TLS Settings:**
   - Mode: Full (strict)
   - Always Use HTTPS: ON
   - HSTS: ON (max-age: 31536000, include subdomains, preload)

3. **Page Rules:**
   - `votre-domaine.com/stream*` → Cache Level: Bypass
   - `votre-domaine.com/api/*` → Cache Level: Bypass

### 4. Certificats SSL Cloudflare Origin

```bash
# Créer le répertoire SSL
mkdir -p ssl

# Obtenir les certificats Origin depuis Cloudflare Dashboard
# https://dash.cloudflare.com/ssl-tls/origin
# Sauvegarder comme:
# - ssl/cloudflare-origin.pem (certificat)
# - ssl/cloudflare-origin.key (clé privée)
```

## 🚀 Déploiement

### Déploiement complet
```bash
# Déployer tous les services
./scripts/deploy-production.sh deploy
```

### Commandes utiles
```bash
# Démarrer les services
./scripts/deploy-production.sh start

# Arrêter les services
./scripts/deploy-production.sh stop

# Redémarrer les services
./scripts/deploy-production.sh restart

# Voir les logs
./scripts/deploy-production.sh logs

# Voir le statut
./scripts/deploy-production.sh status

# Nettoyer complètement
./scripts/deploy-production.sh clean
```

## 🌐 Accès aux Services

### Clear Web (via Cloudflare)
- **Site principal:** https://votre-domaine.com
- **API:** https://votre-domaine.com/api
- **Stream audio:** https://votre-domaine.com/stream
- **Admin Icecast:** https://votre-domaine.com/icecast/

### Tor Hidden Service
Après le déploiement, l'adresse .onion sera affichée dans les logs :
```bash
# Obtenir l'adresse .onion
docker-compose -f docker-compose.production.yml exec tor cat /var/lib/tor/hidden_service/hostname
```

- **Site principal:** http://[adresse-onion]
- **API:** http://[adresse-onion]/api
- **Stream audio:** http://[adresse-onion]/stream
- **Admin Icecast:** http://[adresse-onion]/icecast/

## 🔍 Vérification du Déploiement

### 1. Vérifier les services Docker
```bash
docker-compose -f docker-compose.production.yml ps
```

Tous les services doivent être "Up" :
- ✅ db
- ✅ redis
- ✅ ipfs
- ✅ backend
- ✅ icecast
- ✅ frontend
- ✅ nginx-clearweb
- ✅ nginx-tor
- ✅ tor

### 2. Tester les endpoints

#### Clear Web
```bash
# Test HTTPS
curl -I https://votre-domaine.com/health

# Test API
curl https://votre-domaine.com/api/health

# Test streaming
curl -I https://votre-domaine.com/stream
```

#### Tor
```bash
# Obtenir l'adresse .onion
ONION_ADDRESS=$(docker-compose -f docker-compose.production.yml exec -T tor cat /var/lib/tor/hidden_service/hostname)

# Test via Tor (nécessite tor installé localement)
curl --socks5-hostname 127.0.0.1:9050 http://$ONION_ADDRESS/health
```

### 3. Vérifier les logs
```bash
# Logs généraux
docker-compose -f docker-compose.production.yml logs --tail=50

# Logs spécifiques
docker-compose -f docker-compose.production.yml logs nginx-clearweb
docker-compose -f docker-compose.production.yml logs tor
docker-compose -f docker-compose.production.yml logs backend
```

## 🔒 Sécurité

### Firewall (UFW)
```bash
# Configurer le firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Mise à jour automatique
```bash
# Activer Watchtower pour les mises à jour automatiques
# (déjà inclus dans docker-compose.production.yml)
```

### Monitoring
```bash
# Vérifier l'utilisation des ressources
docker stats

# Vérifier l'espace disque
df -h
docker system df
```

## 🛠️ Maintenance

### Sauvegardes
```bash
# Sauvegarder la base de données
docker-compose -f docker-compose.production.yml exec db pg_dump -U san2stic san2stic > backup_$(date +%Y%m%d_%H%M%S).sql

# Sauvegarder les volumes Docker
docker run --rm -v san2stic---maps_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

### Mise à jour
```bash
# Mettre à jour le code
git pull

# Reconstruire et redéployer
./scripts/deploy-production.sh deploy
```

### Nettoyage
```bash
# Nettoyer les images Docker inutilisées
docker system prune -f

# Nettoyer les volumes orphelins
docker volume prune -f
```

## 🐛 Dépannage

### Problèmes courants

#### 1. Service ne démarre pas
```bash
# Vérifier les logs
docker-compose -f docker-compose.production.yml logs [service-name]

# Redémarrer un service spécifique
docker-compose -f docker-compose.production.yml restart [service-name]
```

#### 2. Certificats SSL invalides
```bash
# Vérifier les certificats
openssl x509 -in ssl/cloudflare-origin.pem -text -noout

# Régénérer les certificats depuis Cloudflare Dashboard
```

#### 3. Tor ne génère pas d'adresse .onion
```bash
# Vérifier les logs Tor
docker-compose -f docker-compose.production.yml logs tor

# Redémarrer Tor
docker-compose -f docker-compose.production.yml restart tor
```

#### 4. Base de données inaccessible
```bash
# Vérifier la connexion DB
docker-compose -f docker-compose.production.yml exec db psql -U san2stic -d san2stic -c "SELECT 1;"

# Réinitialiser la DB (ATTENTION: perte de données)
docker-compose -f docker-compose.production.yml down
docker volume rm san2stic---maps_postgres_data
./scripts/deploy-production.sh deploy
```

### Logs utiles
```bash
# Tous les logs
docker-compose -f docker-compose.production.yml logs -f

# Logs Nginx Clear Web
docker-compose -f docker-compose.production.yml logs -f nginx-clearweb

# Logs Tor
docker-compose -f docker-compose.production.yml logs -f tor

# Logs Backend
docker-compose -f docker-compose.production.yml logs -f backend
```

## 📞 Support

En cas de problème :
1. Vérifiez les logs avec les commandes ci-dessus
2. Consultez la documentation Docker Compose
3. Vérifiez la configuration Cloudflare
4. Testez la connectivité réseau

## 🎯 Architecture Déployée

```
Internet
    ↓
Cloudflare (Proxy + CDN + Security)
    ↓
nginx-clearweb (HTTPS, SSL termination)
    ↓
[Services internes]

Tor Network
    ↓
tor (Hidden Service)
    ↓
nginx-tor (HTTP only)
    ↓
[Services internes]

Services internes:
- frontend (React app)
- backend (Node.js API)
- icecast (Audio streaming)
- ipfs (Decentralized storage)
- db (PostgreSQL)
- redis (Cache)
```

Cette architecture garantit :
- ✅ Haute disponibilité
- ✅ Sécurité renforcée
- ✅ Performance optimisée
- ✅ Anonymat via Tor
- ✅ Protection DDoS via Cloudflare