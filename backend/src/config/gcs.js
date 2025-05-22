const { Storage } = require('@google-cloud/storage');

let storageConfig = {
  projectId: process.env.GCS_PROJECT_ID,
};

if (process.env.GCP_CREDENTIALS_JSON) {
  try {
    const credentials = JSON.parse(process.env.GCP_CREDENTIALS_JSON);
    storageConfig.credentials = credentials;
    console.log('Using GCS credentials from GCP_CREDENTIALS_JSON.');
  } catch (error) {
    console.error('Failed to parse GCP_CREDENTIALS_JSON:', error);
    // Si le JSON est malformé, on essaie le fallback si GCP_KEYFILE_PATH est défini
    if (process.env.GCP_KEYFILE_PATH) {
      console.log('Falling back to GCP_KEYFILE_PATH for GCS credentials.');
      storageConfig.keyFilename = process.env.GCP_KEYFILE_PATH;
    } else {
      console.error('GCP_KEYFILE_PATH is not defined. GCS client might not be authenticated.');
    }
  }
} else if (process.env.GCP_KEYFILE_PATH) {
  console.log('Using GCS credentials from GCP_KEYFILE_PATH.');
  storageConfig.keyFilename = process.env.GCP_KEYFILE_PATH;
} else {
  console.warn('Neither GCP_CREDENTIALS_JSON nor GCP_KEYFILE_PATH are defined. GCS client might not be authenticated.');
  // Dans ce cas, le client Storage sera initialisé sans credentials explicites,
  // et tentera de s'authentifier via les Application Default Credentials si configurées dans l'environnement.
}

const storage = new Storage(storageConfig);

const bucketName = process.env.GCS_BUCKET_NAME;

// Vérifier si bucketName est défini avant de tenter de créer une référence au bucket
let bucket;
if (bucketName) {
  bucket = storage.bucket(bucketName);
} else {
  console.warn('GCS_BUCKET_NAME is not defined. Bucket operations will not be available.');
  // Initialiser bucket à null ou undefined pour indiquer qu'il n'est pas configuré
  bucket = null;
}

module.exports = { storage, bucket, bucketName };