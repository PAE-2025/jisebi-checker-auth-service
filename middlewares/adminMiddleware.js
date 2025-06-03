const { error } = require("../utils/response");

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return error(res, "Akses ditolak: Anda bukan admin.", null, 403);
  }
};

module.exports = adminMiddleware;
