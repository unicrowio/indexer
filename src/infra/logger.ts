import pino from "pino";

const options: any = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
};

const logger = pino({
  timestamp: () =>
    `,"time":"${new Intl.DateTimeFormat("en-US", options).format(Date.now())}"`,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  debug: logger.debug.bind(logger),
};
