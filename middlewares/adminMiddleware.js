const { error } = require("../utils/response");
const User = require("../models/User");
const { ObjectId } = require("mongodb");


const adminMiddleware = async (req, res, next) => {
  const user = await User.findOne({ _id: ObjectId.createFromHexString(req.user.id)}).exec();
  console.log(user)
  // console.log(req);
  if (req.user && user.isAdmin) {
    next();
  } else {
    return error(res, "Akses ditolak: Anda bukan admin.", null, 403);
  }
};

module.exports = adminMiddleware;
