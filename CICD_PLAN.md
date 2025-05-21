# Plan de Mise en Place des Pipelines CI/CD pour San2Stic

Ce document détaille la planification pour la mise en place des pipelines d'Intégration Continue et de Déploiement Continu (CI/CD) pour le projet San2Stic.

## 1. Choix de l'Outil CI/CD

Après évaluation, l'outil recommandé pour ce projet est **GitHub Actions**.

*   **Justification :**
    *   **Intégration SCM :** Si votre code est sur GitHub, l'intégration est native et fluide.
    *   **Écosystème et Communauté :** Vaste bibliothèque d'actions réutilisables (`google-github-actions/auth`, `google-github-actions/deploy-cloudrun`, etc.) et forte communauté.
    *   **Polyvalence :** Gère bien les déploiements sur GCP (via des actions dédiées et Workload Identity Federation) et peut facilement s'étendre à d'autres plateformes (Netlify/Vercel pour le frontend).
    *   **Facilité d'utilisation :** Les workflows YAML sont clairs et l'interface GitHub est conviviale pour la gestion des CI/CD.
    *   **Gestion des secrets :** Bonne intégration avec les secrets GitHub et support de Workload Identity Federation pour un accès sécurisé à GCP.
    *   **Coût :** Offre un quota généreux de minutes gratuites pour les dépôts publics et privés, ce qui est souvent suffisant pour les projets de taille petite à moyenne.

*Google Cloud Build* est une alternative solide, surtout si une intégration encore plus profonde avec l'écosystème GCP est privilégiée et que l'équipe y est déjà très habituée. Cependant, pour une flexibilité et une intégration directe avec le SCM GitHub, GitHub Actions est préféré ici.

## 2. Pipeline CI/CD pour le Backend (GitHub Actions)

Ce pipeline automatisera le build, le test (futur), la publication de l'image Docker et le déploiement sur Google Kubernetes Engine (GKE).

*   **Fichier de configuration :** `.github/workflows/backend-ci-cd.yml`
*   **Déclencheurs :**
    *   Push sur la branche `main`.
    *   (Optionnel) Pull request ciblant `main` (pour validation avant fusion).
    *   (Optionnel) Création de tags (ex: `v*.*.*`) pour les releases.

*   **Étapes du Pipeline :**

    ```mermaid
    graph TD
        A[Déclencheur: Push/PR sur main] --> B{Checkout Code};
        B --> C{Setup Node.js & Dépendances};
        C -- npm ci --prefix backend --> D((Exécuter Tests Unitaires/Intégration));
        D --> E{Authentification GCP via Workload Identity Federation};
        E -- google-github-actions/auth --> F{Configurer Docker pour Artifact Registry/GCR};
        F -- gcloud auth configure-docker --> G{Build Image Docker Backend avec tag (SHA du commit)};
        G -- Dockerfile backend/infra/Dockerfile.backend --> H{Push Image Docker vers Artifact Registry/GCR};
        H --> I{Mise à jour Manifestes Kubernetes};
        subgraph I [Mise à jour Manifestes Kubernetes]
            direction LR
            I1[Option A: Kustomize]
            I2[Option B: sed/replace]
        end
        I --> J{Déploiement sur GKE};
        subgraph J [Déploiement sur GKE]
            direction LR
            J1[kubectl apply -k (Kustomize)]
            J2[kubectl apply -f (fichiers)]
        end
    ```

    *   **`Checkout Code` :** Utilisation de `actions/checkout@v3` pour récupérer la dernière version du code.
    *   **`Setup Node.js & Dépendances` :** Utilisation de `actions/setup-node@v3` pour configurer l'environnement Node.js, puis `npm ci --prefix backend` pour installer les dépendances du backend.
    *   **`(Optionnel) Exécuter Tests Unitaires/Intégration` :** Commande pour lancer les tests (ex: `npm test --prefix backend`). Cette étape est cruciale pour assurer la qualité du code.
    *   **`Authentification GCP via Workload Identity Federation` :** Utilisation de `google-github-actions/auth@v1` pour s'authentifier auprès de GCP en utilisant Workload Identity Federation. Cela évite de stocker des clés de service JSON.
        *   Nécessite la configuration d'un Workload Identity Pool et Provider dans GCP IAM.
        *   Le compte de service GCP associé doit avoir les permissions nécessaires (ex: `roles/artifactregistry.writer`, `roles/container.developer`).
    *   **`Configurer Docker pour Artifact Registry/GCR` :** Utilisation de `gcloud auth configure-docker REGION-docker.pkg.dev` (pour Artifact Registry) ou `gcloud auth configure-docker gcr.io` (pour GCR).
    *   **`Build Image Docker Backend` :**
        *   Commande : `docker build -t REGION-docker.pkg.dev/PROJECT_ID/REPO_NAME/backend:${{ github.sha }} -t REGION-docker.pkg.dev/PROJECT_ID/REPO_NAME/backend:latest -f infra/Dockerfile.backend backend/`
        *   L'image est taguée avec le SHA du commit pour une traçabilité unique et avec `latest` pour une référence facile.
    *   **`Push Image Docker vers Artifact Registry/GCR` :**
        *   Commandes : `docker push REGION-docker.pkg.dev/PROJECT_ID/REPO_NAME/backend:${{ github.sha }}` et `docker push REGION-docker.pkg.dev/PROJECT_ID/REPO_NAME/backend:latest`.
    *   **`Mise à jour Manifestes Kubernetes` :**
        *   **Méthode recommandée : `kustomize`**.
            *   Installer `kustomize`.
            *   Naviguer vers le répertoire de l'overlay (ex: `kubernetes/overlays/production/`).
            *   Commande : `kustomize edit set image backend-image=REGION-docker.pkg.dev/PROJECT_ID/REPO_NAME/backend:${{ github.sha }}`.
            *   Cela met à jour le fichier `kustomization.yaml` ou un patch.
        *   Alternative (moins flexible) : Remplacement de placeholder avec `sed` dans le fichier [`kubernetes/backend-deployment.yaml`](kubernetes/backend-deployment.yaml:0).
            *   Ex: `sed -i 's|image: .*|image: REGION-docker.pkg.dev/PROJECT_ID/REPO_NAME/backend:${{ github.sha }}|g' kubernetes/backend-deployment.yaml`
    *   **`Déploiement sur GKE` :**
        *   Configurer `kubectl` pour se connecter au cluster GKE (via `gcloud container clusters get-credentials CLUSTER_NAME --zone CLUSTER_ZONE`).
        *   Avec Kustomize : `kubectl apply -k kubernetes/overlays/production/`
        *   Sans Kustomize : `kubectl apply -f kubernetes/backend-deployment.yaml` (et autres fichiers modifiés).

## 3. Pipeline CI/CD pour le Frontend (Esquisse avec GitHub Actions)

Ce pipeline automatisera le build et le déploiement de l'application frontend React.

*   **Fichier de configuration :** `.github/workflows/frontend-ci-cd.yml`
*   **Déclencheurs :** Similaires au backend (Push/PR sur `main` affectant le répertoire `frontend/`).

*   **Étapes du Pipeline :**

    ```mermaid
    graph TD
        FA[Déclencheur: Push/PR sur main (path: frontend/**)] --> FB{Checkout Code};
        FB --> FC{Setup Node.js & Dépendances};
        FC -- npm ci --prefix frontend --> FD((Exécuter Tests Frontend));
        FD -- npm test --prefix frontend --> FE{Build Application React};
        FE -- npm run build --prefix frontend --> FF{Déploiement};
        subgraph FF [Déploiement Frontend]
            direction LR
            FF1[Netlify]
            FF2[Vercel]
            FF3[GCP Static Hosting (GCS)]
        end
    ```
    *   **`Checkout Code` :** `actions/checkout@v3`.
    *   **`Setup Node.js & Dépendances` :** `actions/setup-node@v3`, puis `npm ci --prefix frontend`.
    *   **`(Optionnel) Exécuter Tests Frontend` :** `npm test --prefix frontend`.
    *   **`Build Application React` :** `npm run build --prefix frontend`. Le résultat sera typiquement dans `frontend/build/`.
    *   **`Déploiement` :**
        *   **Netlify :** Utiliser `netlify/actions/cli@master` ou une action communautaire comme `nwtgck/actions-netlify`. Nécessite `NETLIFY_AUTH_TOKEN` et `NETLIFY_SITE_ID` en secrets.
            *   Exemple : `netlify deploy --dir=frontend/build --prod`
        *   **Vercel :** Utiliser `vercel/action@v1`. Nécessite `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` en secrets.
        *   **GCP Static Hosting (Google Cloud Storage) :**
            *   Authentification GCP (comme pour le backend).
            *   Utiliser `google-github-actions/upload-cloud-storage@v1` pour copier le contenu de `frontend/build` vers un bucket GCS configuré pour l'hébergement statique.
            *   Exemple : `gsutil -m rsync -d -r frontend/build gs://YOUR_STATIC_SITE_BUCKET`

## 4. Gestion des Secrets et Configurations

*   **GitHub Actions Secrets :**
    *   Stocker tous les identifiants sensibles dans les "Encrypted Secrets" de GitHub (`Settings > Secrets and variables > Actions` au niveau du dépôt ou de l'organisation).
    *   Exemples :
        *   `GCP_PROJECT_ID`: L'ID de votre projet Google Cloud.
        *   `GCP_WORKLOAD_IDENTITY_PROVIDER`: Le nom du fournisseur d'identité de charge de travail GCP (ex: `projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider`).
        *   `GCP_SERVICE_ACCOUNT_EMAIL`: L'email du compte de service GCP que GitHub Actions va emprunter (ex: `github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com`).
        *   `NETLIFY_AUTH_TOKEN` (si Netlify est utilisé).
        *   `NETLIFY_SITE_ID` (si Netlify est utilisé).
        *   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (si Vercel est utilisé).
*   **Workload Identity Federation (pour GCP) :**
    *   **Fortement recommandé** pour éviter de gérer des clés de service JSON.
    *   Configurez un Workload Identity Pool dans GCP IAM.
    *   Créez un Workload Identity Provider lié à votre dépôt GitHub.
    *   Autorisez le compte de service GCP à être emprunté par les identités fédérées de GitHub Actions.
    *   Dans le workflow GitHub Actions, demandez un `id-token` avec les permissions `id-token: write`.
*   **Configurations non sensibles :**
    *   Peuvent être stockées directement dans les fichiers de workflow YAML (ex: nom de région GCP, nom du cluster GKE).
    *   Pour des configurations plus complexes, envisagez des fichiers de configuration dédiés dans le dépôt et lus par le pipeline.

## 5. Fichiers de Configuration du Pipeline (GitHub Actions)

Les fichiers de workflow seront placés dans le répertoire `.github/workflows/` à la racine de votre projet.

*   **`.github/workflows/backend-ci-cd.yml`:**
    *   **Rôle :** Définit le pipeline CI/CD pour l'application backend.
    *   **Structure Générale :**
        ```yaml
        name: Backend CI/CD

        on:
          push:
            branches: [ main ]
            paths:
              - 'backend/**'
              - 'infra/Dockerfile.backend'
              - '.github/workflows/backend-ci-cd.yml'
          pull_request:
            branches: [ main ]
            paths:
              - 'backend/**'
              - 'infra/Dockerfile.backend'
              - '.github/workflows/backend-ci-cd.yml'

        permissions:
          contents: read
          id-token: write # Nécessaire pour Workload Identity Federation

        jobs:
          build-and-deploy-backend:
            name: Build and Deploy Backend
            runs-on: ubuntu-latest
            # ... variables d'environnement (GCP_PROJECT_ID, REGION, etc.)
            steps:
              # - Checkout code
              # - Setup Node.js
              # - Install backend dependencies
              # - (Run tests)
              # - Authenticate to GCP
              # - Configure Docker
              # - Build and Push Docker image
              # - Setup Kustomize (if used)
              # - Update Kubernetes manifests
              # - Deploy to GKE
        ```

*   **`.github/workflows/frontend-ci-cd.yml`:**
    *   **Rôle :** Définit le pipeline CI/CD pour l'application frontend.
    *   **Structure Générale :**
        ```yaml
        name: Frontend CI/CD

        on:
          push:
            branches: [ main ]
            paths:
              - 'frontend/**'
              - '.github/workflows/frontend-ci-cd.yml'
          pull_request:
            branches: [ main ]
            paths:
              - 'frontend/**'
              - '.github/workflows/frontend-ci-cd.yml'

        permissions:
          contents: read
          # id-token: write # Si déploiement sur GCP Static Hosting avec WIF

        jobs:
          build-and-deploy-frontend:
            name: Build and Deploy Frontend
            runs-on: ubuntu-latest
            steps:
              # - Checkout code
              # - Setup Node.js
              # - Install frontend dependencies
              # - (Run tests)
              # - Build React app
              # - Deploy to Netlify/Vercel/GCS
        ```

Ce plan constitue une feuille de route pour l'implémentation des pipelines CI/CD. Les détails spécifiques des commandes et des configurations des actions GitHub devront être affinés lors de la mise en œuvre.