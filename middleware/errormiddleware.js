const errorhandler = (err, req, res, next) => {
  console.error("error", err.message);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    statusCode,
    message: err.message || "Server error",
  });
};
module.exports = errorhandler;
