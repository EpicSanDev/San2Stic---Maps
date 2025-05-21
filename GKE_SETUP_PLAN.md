# Plan de Création et Configuration du Cluster GKE pour San2Stic

Ce plan vise à guider la mise en place d'un cluster Google Kubernetes Engine (GKE) optimisé pour héberger les services backend de San2Stic (Node.js, Icecast, PostgreSQL).

## 1. Prérequis GCP

Avant de créer le cluster, assurez-vous des points suivants dans votre projet Google Cloud :

*   **API GCP à Activer :**
    *   `Kubernetes Engine API` (compute.googleapis.com)
    *   `Artifact Registry API` (artifactregistry.googleapis.com) - *Probablement déjà actif si vous utilisez Artifact Registry pour vos images Docker.*
    *   `Cloud Resource Manager API` (cloudresourcemanager.googleapis.com) - *Souvent actif par défaut, nécessaire pour la gestion de projet.*
    *   `IAM Service Account Credentials API` (iamcredentials.googleapis.com) - *Nécessaire pour Workload Identity Federation.*
*   **Rôles IAM Recommandés (pour l'utilisateur/compte de service effectuant la création et la gestion) :**
    *   **Pour la création du cluster :**
        *   `Kubernetes Engine Admin` (`roles/container.admin`): Permissions complètes sur les clusters GKE.
        *   `Service Account User` (`roles/iam.serviceAccountUser`): Pour agir en tant que/utiliser des comptes de service lors de la création si nécessaire.
    *   **Pour le compte de service utilisé par le pipeline CI/CD (via Workload Identity Federation, ex: `san2stic-backend-sa@...`) :**
        *   `Kubernetes Engine Developer` (`roles/container.developer`): Pour déployer des applications dans le cluster.
        *   `Artifact Registry Reader` (`roles/artifactregistry.reader`): Pour tirer les images Docker depuis Artifact Registry.
        *   `Storage Object Admin` (`roles/storage.objectAdmin`) ou plus granulaire sur les buckets GCS spécifiques : Si le backend doit interagir avec Google Cloud Storage.
        *   Permissions spécifiques si d'autres services GCP sont utilisés.
    *   **Pour Workload Identity Federation (liaison KSA <=> GSA) :**
        *   Le compte de service GCP (GSA) doit avoir le rôle `Workload Identity User` (`roles/iam.workloadIdentityUser`) pour permettre aux comptes de service Kubernetes (KSA) de l'emprunter.

## 2. Spécifications Recommandées pour le Cluster GKE

*   **Type de Cluster :**
    *   **Recommandation : GKE Autopilot**
        *   *Avantages :* Simplicité de gestion, sécurité renforcée par défaut, coûts basés sur la consommation des pods. Idéal pour démarrer et pour des équipes souhaitant réduire la charge opérationnelle.
*   **Région/Zone :**
    *   **Recommandation :** `europe-west1` (Belgique).
        *   *Justification :* Proximité avec Artifact Registry configuré (`europe-west1-docker.pkg.dev`), faible latence, et bonne disponibilité des services. Autopilot crée un cluster régional par défaut pour la haute disponibilité.
*   **Version de Kubernetes :**
    *   **Recommandation :** Utiliser une version stable du **"Regular channel"**.
        *   *Exemple :* La version par défaut proposée par GKE dans ce canal au moment de la création (par exemple, `1.28.x` ou `1.29.x` - vérifier la documentation GCP).
*   **Pools de Nœuds (Node Pools) :**
    *   Avec **GKE Autopilot**, la gestion des pools de nœuds est automatisée par Google. Vous n'avez pas à les configurer manuellement. GKE optimise les nœuds en fonction des ressources demandées par vos pods.
*   **Réseau :**
    *   **VPC :** Utiliser le réseau VPC `default` pour commencer.
    *   **Plages d'adresses IP :** Gérées automatiquement par Autopilot.
    *   **Visibilité du Cluster :** Cluster public avec point de terminaison du plan de contrôle sécurisé par des **"authorized networks"**. Les nœuds Autopilot n'ont pas d'IP externes par défaut.

## 3. Étapes de Création du Cluster (via `gcloud` CLI)

*   **Exemple de Commande `gcloud` (Autopilot) :**
    ```bash
    gcloud container clusters create-auto CLUSTER_NAME \
        --project=GCP_PROJECT_ID \
        --region=europe-west1 \
        --release-channel=regular \
        --network=default \
        --subnetwork=default
    ```
*   **Options Clés à Remplacer/Vérifier :**
    *   `CLUSTER_NAME`: Nom de votre cluster (ex: `san2stic-cluster`).
    *   `GCP_PROJECT_ID`: ID de votre projet GCP.
    *   Workload Identity est activé par défaut sur les clusters Autopilot récents (`GCP_PROJECT_ID.svc.id.goog`).

## 4. Configuration Post-Création Initiale

*   **Connexion au Cluster avec `kubectl` :**
    ```bash
    gcloud container clusters get-credentials CLUSTER_NAME \
        --project=GCP_PROJECT_ID \
        --region=europe-west1
    kubectl get pods -n kube-system # Pour vérifier la connexion
    ```
*   **Création de Namespaces Spécifiques :**
    *   **Recommandation :** Créer un namespace pour isoler les ressources de San2Stic.
        ```bash
        kubectl create namespace san2stic
        ```
*   **Workload Identity Federation :**
    *   **Vérification :** S'assurer que le pool d'identités (`GCP_PROJECT_ID.svc.id.goog`) est configuré pour le cluster.
    *   **Pipeline CI/CD :** Le pipeline ([`.github/workflows/backend-ci-cd.yml`](./.github/workflows/backend-ci-cd.yml:0)) est déjà configuré pour utiliser Workload Identity. Le GSA utilisé par le pipeline doit avoir les permissions GKE nécessaires.
    *   **Applications dans GKE (ex: Backend accédant à GCS) :**
        1.  Créer un Compte de Service Kubernetes (KSA) dédié dans votre namespace (ex: `backend-ksa` dans `san2stic`).
            ```bash
            kubectl create serviceaccount backend-ksa -n san2stic
            ```
        2.  Lier ce KSA au Compte de Service GCP (GSA) approprié (ex: `san2stic-gcs-access@...`) en accordant au GSA le rôle `Workload Identity User` pour ce KSA spécifique :
            ```bash
            gcloud iam service-accounts add-iam-policy-binding \
                --role roles/iam.workloadIdentityUser \
                --member "serviceAccount:GCP_PROJECT_ID.svc.id.goog[san2stic/backend-ksa]" \
                GSA_EMAIL_FOR_GCS_ACCESS
            ```
        3.  Spécifier `serviceAccountName: backend-ksa` dans les manifestes de déploiement de votre application backend.
*   **Configuration des `StorageClass` :**
    *   Autopilot fournit des `StorageClass` par défaut (`standard-rwo`, `premium-rwo`).
    *   Pour PostgreSQL, envisager d'utiliser `premium-rwo` (disques SSD) pour de meilleures performances si le budget le permet. Spécifiez-le dans la section `volumeClaimTemplates` de votre `StatefulSet` PostgreSQL.
        ```bash
        kubectl get storageclass # Pour lister les StorageClass disponibles
        ```

## 5. Considérations de Sécurité Initiales pour le Cluster

*   **Principe de Moindre Privilège :**
    *   Utiliser **Workload Identity** pour accorder des permissions GCP granulaires aux applications s'exécutant dans GKE.
*   **Configuration du Réseau :**
    *   **Authorized Networks :** Restreindre l'accès au point de terminaison public du plan de contrôle GKE à des adresses IP spécifiques.
        ```bash
        gcloud container clusters update CLUSTER_NAME --enable-master-authorized-networks --master-authorized-networks=YOUR_IP_RANGES
        ```
    *   **Network Policies Kubernetes :** Mettre en œuvre des politiques réseau pour contrôler le trafic entre les pods. Commencer par une politique "deny-all" par défaut par namespace, puis autoriser explicitement les flux nécessaires (ex: backend vers base de données).
*   **RBAC Kubernetes :**
    *   Définir des `Roles` et `RoleBindings` (ou `ClusterRoles` et `ClusterRoleBindings`) pour limiter les permissions sur l'API Kubernetes.
*   **Gestion des Secrets :**
    *   Utiliser les `Secrets` Kubernetes pour toutes les données sensibles.
    *   Ne pas stocker de secrets en clair dans les manifestes ou les images.
*   **Sécurité des Images de Conteneurs :**
    *   Utiliser des images de base minimales et officielles.
    *   Scanner les images pour les vulnérabilités (ex: Artifact Analysis).