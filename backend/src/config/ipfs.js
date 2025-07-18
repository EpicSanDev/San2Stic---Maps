const { create } = require('ipfs-http-client');

let ipfsConfig = {
  host: process.env.IPFS_HOST || 'localhost',
  port: process.env.IPFS_PORT || 5001,
  protocol: process.env.IPFS_PROTOCOL || 'http'
};

if (process.env.IPFS_PROJECT_ID && process.env.IPFS_PROJECT_SECRET) {
  ipfsConfig.headers = {
    authorization: `Basic ${Buffer.from(
      `${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`
    ).toString('base64')}`
  };
  console.log('Using IPFS with Infura credentials.');
} else {
  console.log('Using local IPFS node.');
}

const ipfs = create(ipfsConfig);

const gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/';

async function uploadToIPFS(buffer, filename, metadata = {}) {
  try {
    const file = {
      path: filename,
      content: buffer
    };

    const result = await ipfs.add(file, {
      pin: true,
      wrapWithDirectory: false
    });

    console.log(`File uploaded to IPFS: ${result.cid.toString()}`);
    
    return {
      hash: result.cid.toString(),
      url: `${gatewayUrl}${result.cid.toString()}`,
      size: result.size
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
}

async function pinToIPFS(hash) {
  try {
    await ipfs.pin.add(hash);
    console.log(`Content pinned to IPFS: ${hash}`);
    return true;
  } catch (error) {
    console.error('IPFS pin error:', error);
    return false;
  }
}

async function getIPFSContent(hash) {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(hash)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('IPFS get content error:', error);
    throw new Error(`Failed to retrieve content from IPFS: ${error.message}`);
  }
}

async function checkIPFSHealth() {
  try {
    const version = await ipfs.version();
    console.log(`IPFS node version: ${version.version}`);
    return true;
  } catch (error) {
    console.error('IPFS health check failed:', error);
    return false;
  }
}

module.exports = {
  ipfs,
  uploadToIPFS,
  pinToIPFS,
  getIPFSContent,
  checkIPFSHealth,
  gatewayUrl
};
