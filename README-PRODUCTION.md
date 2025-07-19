# 🎵 San2Stic - Plateforme de Streaming Décentralisée

## 🌐 Architecture Dual: Tor + Clear Web

San2Stic est maintenant déployable sur deux réseaux simultanément :

### 🔒 **Tor Hidden Service** (Anonymat total)
- Accès via le réseau Tor
- Adresse .onion générée automatiquement
- Aucune trace, anonymat complet
- Résistant à la censure

### 🌍 **Clear Web** (Performance optimisée)
- Accès via internet classique
- Protection DDoS via Cloudflare
- CDN global pour la performance
- SSL/TLS avec certificats Origin

## 🚀 Déploiement Rapide

### Prérequis
- Serveur Linux (Ubuntu 20.04+)
- Docker & Docker Compose
- Domaine configuré sur Cloudflare
- 4GB RAM minimum

### Installation en 3 étapes

1. **Configuration**
```bash
git clone <votre-repo>
cd San2Stic---Maps
cp .env.production .env.production.local
# Éditer .env.production.local avec vos paramètres
```

2. **Setup Cloudflare**
```bash
./scripts/setup-cloudflare.sh setup
# Suivre les instructions pour les certificats SSL
```

3. **Déploiement**
```bash
./scripts/deploy-production.sh deploy
```

## 📋 Services Inclus

| Service | Description | Port Clear Web | Port Tor |
|---------|-------------|----------------|----------|
| **Frontend** | Interface React | 443 (HTTPS) | 80 (HTTP) |
| **Backend** | API Node.js | /api | /api |
| **Icecast** | Streaming audio | /stream | /stream |
| **IPFS** | Stockage décentralisé | /ipfs | /ipfs |
| **PostgreSQL** | Base de données | - | - |
| **Redis** | Cache | - | - |

## 🔧 Commandes Utiles

```bash
# Démarrer tous les services
./scripts/deploy-production.sh start

# Voir les logs en temps réel
./scripts/deploy-production.sh logs

# Tester le déploiement
./scripts/test-deployment.sh

# Voir le statut et les URLs
./scripts/deploy-production.sh status

# Arrêter tous les services
./scripts/deploy-production.sh stop
```

## 🌐 URLs d'Accès

### Clear Web (via Cloudflare)
- **Site principal:** `https://votre-domaine.com`
- **API:** `https://votre-domaine.com/api`
- **Stream:** `https://votre-domaine.com/stream`
- **Admin Icecast:** `https://votre-domaine.com/icecast/`

### Tor Hidden Service
```bash
# Obtenir l'adresse .onion
docker-compose -f docker-compose.production.yml exec tor cat /var/lib/tor/hidden_service/hostname
```
- **Site principal:** `http://[adresse-onion]`
- **API:** `http://[adresse-onion]/api`
- **Stream:** `http://[adresse-onion]/stream`
- **Admin Icecast:** `http://[adresse-onion]/icecast/`

## 🔒 Sécurité

### Clear Web
- ✅ Protection DDoS Cloudflare
- ✅ SSL/TLS avec certificats Origin
- ✅ Headers de sécurité (HSTS, CSP, etc.)
- ✅ Rate limiting par endpoint
- ✅ Firewall configuré

### Tor
- ✅ Anonymat complet
- ✅ Chiffrement end-to-end
- ✅ Résistant à la censure
- ✅ Pas de logs d'IP
- ✅ Configuration Tor durcie

## 📊 Monitoring

### Health Checks
```bash
# Vérifier tous les services
./scripts/test-deployment.sh

# Vérifier un service spécifique
curl https://votre-domaine.com/health
curl https://votre-domaine.com/api/health
```

### Logs
```bash
# Tous les logs
docker-compose -f docker-compose.production.yml logs -f

# Logs spécifiques
docker-compose -f docker-compose.production.yml logs nginx-clearweb
docker-compose -f docker-compose.production.yml logs tor
```

### Métriques
```bash
# Utilisation des ressources
docker stats

# Espace disque
docker system df
```

## 🛠️ Maintenance

### Sauvegardes
```bash
# Base de données
docker-compose -f docker-compose.production.yml exec db pg_dump -U san2stic san2stic > backup.sql

# Volumes Docker
docker run --rm -v san2stic---maps_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

### Mises à jour
```bash
# Mettre à jour le code
git pull

# Redéployer
./scripts/deploy-production.sh deploy
```

### Nettoyage
```bash
# Nettoyer les images inutilisées
docker system prune -f

# Arrêt complet et nettoyage
./scripts/deploy-production.sh clean
```

## 🎯 Architecture Technique

```
┌─────────────────┐    ┌─────────────────┐
│   Clear Web     │    │   Tor Network   │
│   (Internet)    │    │   (Anonymous)   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│   Cloudflare    │    │  Tor Hidden     │
│   (Proxy/CDN)   │    │   Service       │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│ nginx-clearweb  │    │   nginx-tor     │
│   (HTTPS/SSL)   │    │   (HTTP only)   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
                     ▼
          ┌─────────────────┐
          │  Services Core  │
          │                 │
          │ • Frontend      │
          │ • Backend       │
          │ • Icecast       │
          │ • IPFS          │
          │ • PostgreSQL    │
          │ • Redis         │
          └─────────────────┘
```

## 🔧 Configuration Avancée

### Variables d'Environnement Critiques

```bash
# Sécurité (À CHANGER ABSOLUMENT)
POSTGRES_PASSWORD=mot_de_passe_très_sécurisé
JWT_SECRET=clé_jwt_64_caractères_minimum
ICECAST_SOURCE_PASSWORD=mot_de_passe_source
ICECAST_ADMIN_PASSWORD=mot_de_passe_admin

# Cloudflare
DOMAIN_NAME=votre-domaine.com
CLOUDFLARE_ZONE_ID=votre_zone_id
CLOUDFLARE_API_TOKEN=votre_api_token

# Blockchain (Base Mainnet)
BLOCKCHAIN_RPC_URL=https://mainnet.base.org
SAN2STIC_MAIN_CONTRACT=0x34b52da97a0e0fd89a79217c4b934e8af4f4d874
```

### Personnalisation Nginx

Les configurations Nginx sont modulaires :
- `docker/nginx/clearweb.conf.template` - Configuration Clear Web
- `docker/nginx/tor.conf.template` - Configuration Tor
- `docker/nginx/nginx.clearweb.conf` - Configuration globale Clear Web
- `docker/nginx/nginx.tor.conf` - Configuration globale Tor

### Personnalisation Tor

- `docker/tor/torrc.simple` - Configuration Tor simplifiée
- Pas de génération d'adresse .onion personnalisée
- Service caché standard avec sécurité renforcée

## 🐛 Dépannage

### Problèmes Courants

1. **Service ne démarre pas**
   ```bash
   docker-compose -f docker-compose.production.yml logs [service]
   ```

2. **Certificats SSL invalides**
   - Vérifier les certificats Cloudflare Origin
   - Régénérer depuis le dashboard Cloudflare

3. **Tor ne génère pas d'adresse .onion**
   ```bash
   docker-compose -f docker-compose.production.yml restart tor
   ```

4. **Performance dégradée**
   - Vérifier les ressources : `docker stats`
   - Nettoyer : `docker system prune -f`

### Support

📖 **Documentation complète:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

🧪 **Tests automatisés:** `./scripts/test-deployment.sh`

📊 **Monitoring:** `./scripts/deploy-production.sh status`

## 🎵 Fonctionnalités

- ✅ Streaming audio en temps réel (Icecast)
- ✅ Stockage décentralisé (IPFS)
- ✅ Smart contracts (Base Mainnet)
- ✅ Interface web moderne (React)
- ✅ API REST complète (Node.js)
- ✅ Authentification JWT
- ✅ Cache Redis pour la performance
- ✅ Base de données PostgreSQL
- ✅ Dual network (Tor + Clear Web)
- ✅ Protection DDoS (Cloudflare)
- ✅ SSL/TLS automatique
- ✅ Monitoring et health checks
- ✅ Déploiement automatisé
- ✅ Sauvegardes automatiques

## 📄 Licence

Ce projet est sous licence [MIT](./LICENSE).

---

**🚀 Prêt à déployer ? Suivez le [Guide de Déploiement](./DEPLOYMENT_GUIDE.md) !**