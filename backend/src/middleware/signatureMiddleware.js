const { ethers } = require('ethers');

exports.verifySignature = (req, res, next) => {
  const { address, signature, message } = req.body;
  if (!address || !signature || !message) {
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