const { ethers } = require('ethers');

exports.verifySignature = (req, res, next) => {
  // Try to get signature and address from headers first, then body
  const signature = req.headers['x-signature'] || req.body.signature;
  const address = req.headers['x-address'] || req.body.address;
  const message = req.body.message || 'Sign to upload to IPFS';
  
  if (!address || !signature) {
    return res.status(400).json({ error: 'Missing authentication parameters' });
  }
  
  try {
    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() === address.toLowerCase()) {
      req.userAddress = recovered;
      next();
    } else {
      res.status(401).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Signature verification failed' });
  }
};