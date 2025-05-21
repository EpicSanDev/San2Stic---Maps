# Stratégie de Déploiement Cloud pour San2Stic

Ce document décrit la stratégie de déploiement cloud pour les services backend du projet San2Stic, incluant l'application Node.js/Express, le serveur Icecast et la base de données PostgreSQL.

## 1. Analyse des Options : VM (Google Compute Engine) vs GKE (Google Kubernetes Engine)

| Critère                     | Machine Virtuelle (GCE)                                                                                                | Google Kubernetes Engine (GKE)                                                                                                                               |
| :-------------------------- | :--------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Complexité de mise en place** | Relativement simple. Configuration manuelle des services, du réseau, de la sécurité. Docker Compose peut être utilisé. | Plus complexe initialement. Nécessite la compréhension des concepts Kubernetes (Pods, Deployments, Services, ConfigMaps, Secrets, PersistentVolumes, etc.). |
| **Scalabilité**             | Manuelle (nouvelles VM, load balancer) ou via groupes d'instances gérés. Scalabilité verticale plus simple mais limitée. | Native et automatisée (Horizontal Pod Autoscaler, Cluster Autoscaler). Très flexible et réactive.                                                              |
| **Maintenabilité**          | Maintenance du SE, des patchs, des runtimes à gérer manuellement. Mises à jour applicatives manuelles ou via scripts.     | Google gère le plan de contrôle. Mises à jour applicatives facilitées (rolling updates). Runtimes encapsulés dans les conteneurs.                             |
| **Coûts**                   | Potentiellement plus bas pour une petite charge fixe. Peut augmenter avec la redondance et la scalabilité.                 | Coût du cluster (nœuds + frais de gestion). Peut être plus rentable à grande échelle ou avec optimisation des ressources (bin-packing).                     |
| **Expérience de l'équipe**  | Plus accessible pour une équipe avec une expérience modérée en administration système.                                   | Courbe d'apprentissage plus abrupte. Nécessite des compétences Kubernetes.                                                                                   |
| **Haute Disponibilité**     | Nécessite une configuration manuelle (multi-VM, load balancer, réplication BDD).                                       | Conçu pour la haute disponibilité (pods répliqués, services stables).                                                                                        |
| **Gestion de la config.**   | Fichiers sur la VM, variables d'environnement.                                                                         | `ConfigMaps` pour la configuration, `Secrets` pour les données sensibles. Structuré et versionnable.                                                         |
| **Persistance des données** | Disques persistants attachés à la VM.                                                                                  | `PersistentVolumeClaims` et `PersistentVolumes`. Solutions de stockage managées ou disques persistants.                                                      |

## 2. Recommandation

Compte tenu que :
*   Vos services sont déjà conteneurisés ([`infra/Dockerfile.backend`](infra/Dockerfile.backend:0), [`infra/Dockerfile.icecast`](infra/Dockerfile.icecast:0), et PostgreSQL).
*   Vous utilisez Google Cloud Storage, ce qui indique une familiarité avec l'écosystème GCP.
*   Les besoins futurs en termes de scalabilité, de résilience et de maintenabilité sont souvent sous-estimés au début d'un projet.

**Il est recommandé d'opter pour Google Kubernetes Engine (GKE).**

**Justification :**
Bien que la courbe d'apprentissage initiale pour GKE soit plus élevée que pour une simple VM, les avantages à moyen et long terme sont significatifs :
*   **Scalabilité Supérieure :** GKE excelle dans l'adaptation automatique à la charge.
*   **Meilleure Maintenabilité :** Les mises à jour, les rollbacks et la gestion des versions des applications sont grandement simplifiés.
*   **Haute Disponibilité et Résilience :** GKE est conçu pour maintenir les services en fonctionnement même en cas de défaillance d'un nœud.
*   **Écosystème Riche :** Kubernetes est devenu un standard et bénéficie d'un vaste écosystème d'outils et de bonnes pratiques.
*   **Gestion Standardisée :** L'approche déclarative de Kubernetes pour définir l'état souhaité de votre infrastructure simplifie la gestion et l'automatisation.

## 3. Esquisse de l'Architecture de Déploiement (Option Recommandée : GKE)

Voici une ébauche de la manière dont les services seraient déployés sur GKE :

```mermaid
graph TD
    subgraph "Internet"
        LB_HTTP[GCLB HTTP(S) pour Backend]
        LB_TCP[GCLB TCP pour Icecast]
    end

    subgraph "Google Kubernetes Engine (GKE) Cluster"
        subgraph "Namespace: san2stic"
            GKE_Ingress[Ingress Controller] --> Svc_Backend
            Svc_Backend[Service Backend (LoadBalancer/ClusterIP)] --> Pod_Backend1[Pod: Backend App]
            Svc_Backend --> Pod_Backend2[Pod: Backend App]
            Pod_Backend1 --> ConfigMap_Backend[ConfigMap Backend Env]
            Pod_Backend1 --> Secret_Backend[Secret Backend (DB Pass, GCP Key)]
            Pod_Backend2 --> ConfigMap_Backend
            Pod_Backend2 --> Secret_Backend

            Svc_Icecast[Service Icecast (LoadBalancer/NodePort)] --> Pod_Icecast1[Pod: Icecast]
            Svc_Icecast --> Pod_Icecast2[Pod: Icecast]
            Pod_Icecast1 --> ConfigMap_Icecast_XML[ConfigMap icecast.xml]
            Pod_Icecast1 --> Secret_Icecast[Secret Icecast Passwords]
            Pod_Icecast2 --> ConfigMap_Icecast_XML
            Pod_Icecast2 --> Secret_Icecast

            Svc_PostgreSQL[Service PostgreSQL (ClusterIP)] --> STS_PostgreSQL[StatefulSet: PostgreSQL]
            STS_PostgreSQL -- Manages --> Pod_PostgreSQL[Pod: PostgreSQL]
            Pod_PostgreSQL --> Secret_PostgreSQL[Secret PostgreSQL (User/Pass)]
            Pod_PostgreSQL -- Stores data in --> PVC_PostgreSQL[PersistentVolumeClaim]
            PVC_PostgreSQL -- Bound to --> PV_PostgreSQL[PersistentVolume (GCP Persistent Disk)]

            Pod_Backend1 --> Svc_PostgreSQL
            Pod_Backend2 --> Svc_PostgreSQL
        end
    end

    LB_HTTP --> GKE_Ingress
    LB_TCP --> Svc_Icecast

    GCS[Google Cloud Storage (Audio Files)]
    Pod_Backend1 --> GCS
    Pod_Backend2 --> GCS
```

**Détails des composants GKE :**

*   **Backend Node.js/Express :**
    *   **Déploiement :** Un `Deployment` pour gérer les replicas du pod de l'application backend.
    *   **Service :** Un `Service` de type `LoadBalancer` (si exposé directement à Internet) ou `ClusterIP` (si exposé via une `Ingress`). L'Ingress est préférable pour la gestion HTTP(S), les certificats, etc.
    *   **Configuration :** Les variables d'environnement non sensibles via un `ConfigMap`. Les secrets (identifiants BDD, clé de service GCP pour GCS) via des `Secrets` Kubernetes, montés comme variables d'environnement ou fichiers. Le fichier [`gcp-keyfile.json`](docker-compose.yml:16) serait stocké dans un `Secret` et monté en tant que volume.
*   **Serveur Icecast :**
    *   **Déploiement :** Un `Deployment` pour les pods Icecast.
    *   **Service :** Un `Service` de type `LoadBalancer` (pour un accès TCP direct sur le port 8000) ou `NodePort` si une configuration réseau plus spécifique est nécessaire.
    *   **Configuration :** Le fichier [`icecast.xml`](infra/icecast.xml:0) géré via un `ConfigMap` et monté comme un volume dans les pods Icecast. Les mots de passe (source, admin, etc.) via des `Secrets` Kubernetes, injectés comme variables d'environnement si l'image Icecast le supporte, ou modifiés dans le `ConfigMap` [`icecast.xml`](infra/icecast.xml:0) (moins idéal pour les secrets, mais possible si l'image ne permet pas de les surcharger facilement via des variables d'env).
*   **Base de données PostgreSQL :**
    *   **Déploiement :** Un `StatefulSet` pour garantir une identité réseau stable (ex: `db-0.your-service`, `db-1.your-service`) et un stockage persistant ordonné pour chaque pod PostgreSQL. Ceci est crucial pour les bases de données.
    *   **Service :** Un `Service` de type `ClusterIP` pour exposer PostgreSQL uniquement à l'intérieur du cluster (accessible par l'application backend).
    *   **Persistance des données :** Un `PersistentVolumeClaim` (PVC) pour chaque pod du `StatefulSet`. Ces PVCs seront liés à des `PersistentVolumes` (PV) provisionnés dynamiquement par GCP (typiquement des disques persistants).
    *   **Configuration :** Les identifiants PostgreSQL (utilisateur, mot de passe) via des `Secrets` Kubernetes.
*   **Communication inter-services :**
    *   Le backend se connectera à PostgreSQL en utilisant le nom DNS interne du `Service` Kubernetes de PostgreSQL (par exemple, `postgresql.san2stic.svc.cluster.local`, où `san2stic` serait le namespace).

## 4. Considérations Clés pour GKE

*   **Sécurité :**
    *   **Network Policies :** Définir des politiques réseau pour contrôler strictement le trafic entre les pods (par exemple, seul le backend peut accéder à PostgreSQL).
    *   **RBAC (Role-Based Access Control) :** Configurer des rôles et des liaisons de rôles pour limiter les permissions d'accès à l'API Kubernetes.
    *   **Secrets Management :** Utiliser les `Secrets` Kubernetes pour toutes les données sensibles. Envisager une intégration avec Google Secret Manager pour une gestion centralisée des secrets si nécessaire.
    *   **Sécurité des images :** Scanner les images de conteneurs pour les vulnérabilités.
    *   **Google Cloud Armor :** Peut être utilisé avec Google Cloud Load Balancer (via Ingress) pour une protection WAF et DDoS.
*   **Monitoring et Logging :**
    *   GKE s'intègre nativement avec **Cloud Monitoring** et **Cloud Logging**. Vous obtiendrez des métriques pour le cluster, les nœuds, les pods, et les logs des conteneurs seront automatiquement collectés.
*   **Sauvegardes pour PostgreSQL :**
    *   **Option 1 (Dans GKE) :** Mettre en place des `CronJobs` Kubernetes qui exécutent `pg_dump` à l'intérieur du pod PostgreSQL et envoient les sauvegardes vers Google Cloud Storage.
    *   **Option 2 (Snapshots) :** Utiliser la fonctionnalité de snapshots des disques persistants GCP.
    *   **Option 3 (Cloud SQL) :** Pour simplifier la gestion de la base de données, y compris les sauvegardes, vous pourriez envisager d'utiliser Cloud SQL pour PostgreSQL au lieu de l'auto-héberger dans GKE. Cela déplace la responsabilité de la gestion de la BDD vers GCP.
*   **Gestion des noms de domaine et SSL/TLS :**
    *   Utiliser un `Ingress` GKE. Le contrôleur Ingress de GKE peut provisionner un Google Cloud Load Balancer.
    *   **Certificats SSL/TLS :**
        *   **Google-managed certificates :** Simples à configurer avec l'Ingress GKE.
        *   **cert-manager :** Peut être déployé dans le cluster pour obtenir et renouveler automatiquement des certificats Let's Encrypt.
*   **Gestion des coûts :**
    *   Choisir les types de machines appropriés pour les nœuds GKE.
    *   Utiliser l'autoscaling pour ajuster le nombre de nœuds et de pods en fonction de la demande.
    *   Mettre en place des budgets et des alertes de coût dans GCP.