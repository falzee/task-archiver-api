const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "No token found" });
    }   
    try {
        // const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

const requireRole = (...requiredRoles) => {
    return (req, res, next) => {

        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // ✅ admin always bypasses
        if (req.user.role.includes("admin")) {
            return next();
        }

        // ✅ no roles specified → admin-only route
        if (requiredRoles.length === 0) {
            return res.status(403).json({ message: "User unauthorized" });
        }

        // ✅ check allowed roles
        const hasRole = requiredRoles.some(role =>
            req.user.role.includes(role)
        );

        if (hasRole) {
            return next();
        }

        return res.status(403).json({ message: "User unauthorized" });
    };
};

module.exports = { 
    verifyToken,
    requireRole
};
