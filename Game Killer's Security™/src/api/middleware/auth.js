function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No authorization token' });
    }
    
    try {
      // You can verify the token here if needed
      // For now, just pass through
      req.user = { token };
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
  
  module.exports = authMiddleware;