const winston = require('winston')
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
  winston.format.json(),
  winston.format.timestamp()
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: 'log/error.log', level: 'error' }),
    new winston.transports.File({ filename: `log/${process.env.NODE_ENV || 'development'}.log` })
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

async function middleware (ctx, next) {
  let start = Date.now();
  try {
    logger.info(`Start ${ctx.method} "${ctx.originalUrl}" for ${ctx.request.ip}`)
    await next();
  } catch (err) {
    logger.error(`Error ${ctx.method} "${ctx.originalUrl}" for ${ctx.request.ip} ${err.status || 500} ${err.stack}`)
    throw err
  }
  let ms = Date.now() - start;
  logger.info(`Completed ${ctx.status || 404} OK in ${ms}ms ${ctx.response && ctx.response.length || '-'}`)
}

module.exports = { logger, middleware }