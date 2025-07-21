// IPFS Storage Configuration - Replacing Google Cloud Storage for decentralized storage
const ipfsConfig = {
  host: process.env.IPFS_HOST || 'ipfs',
  port: process.env.IPFS_PORT || 5001,
  protocol: process.env.IPFS_PROTOCOL || 'http',
  timeout: 30000
};

// IPFS Gateway URL for accessing stored files
const ipfsGatewayUrl = process.env.IPFS_GATEWAY_URL || `${ipfsConfig.protocol}://${ipfsConfig.host}:8080/ipfs/`;

// Initialize IPFS client (will be done in services that need it)
console.log('IPFS storage configuration loaded:', {
  host: ipfsConfig.host,
  port: ipfsConfig.port,
  protocol: ipfsConfig.protocol,
  gatewayUrl: ipfsGatewayUrl
});

module.exports = { 
  ipfsConfig, 
  ipfsGatewayUrl,
  // Backwards compatibility - marking as deprecated
  storage: null,
  bucket: null,
  bucketName: null
};