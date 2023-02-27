const { constants } = require('../constants');

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.json({
        title: 'Validation Failed',
        message: err.message,
        stackTrace: err.stack
      });
      break;
    case constants.NOT_FOUND:
      res.json({
        title: 'Not Found',
        message: err.message,
        stackTrace: err.stack
      });
    case constants.UNAUTHORIZED:
      res.json({
        title: 'Unauthorized',
        message: err.message,
        stackTrace: err.stack
      });
    case constants.FORBIDDEN:
      res.json({
        title: 'Forbidden',
        message: err.message,
        stackTrace: err.stack
      });
    case constants.DUPLICATE:
    res.json({
        title: 'Duplicate Record',
        message: err.message,
        stackTrace: err.stack
    });
    case constants.SERVER_ERROR:
      res.json({
        title: 'Server Error',
        message: err.message,
        stackTrace: err.stack
      });
    default:
      res.json({
        title: 'Undefined',
        message: err.message,
        stackTrace: err.stack
      });
      break;
  }
};

// const errorHandler = (err, req, res, next) => {
//     const statusCode = res.statusCode ? res.statusCode : 500;
//     res.status(statusCode).json({
//         status_code: statusCode,
//         message: err.message,
//         stack: process.env.NODE_ENV === 'production' ? null: err.stack,
//     });
// }

module.exports = {
    errorHandler,
};