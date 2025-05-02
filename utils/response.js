exports.success = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({ status: "success", message, data });
};

exports.error = (res, message, err = null, statusCode = 500) => {
  return res.status(statusCode).json({ status: "error", message, error: err });
};
