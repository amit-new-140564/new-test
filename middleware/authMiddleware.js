const jwt = require("jsonwebtoken");
const JWT_SECRET = "mysimplesecret"; // Your JWT secret, should match the one used for token generation

const authMiddleware = (req, res, next) => {
  // Get the token from the request header
  const token = req.header("x-auth-token");

  // Check if token is missing
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Set the user from the decoded token to the request object
    req.user = decoded.user;

    // Continue with the next middleware
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleware;
