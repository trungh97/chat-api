import { injectable } from "inversify";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export interface ILogger {
  info(object: string, message: string): void;
  warn(object: string, message: string): void;
  error(object: string, message: string): void;
}

@injectable()
export class WinstonLogger implements ILogger {
  static transport = new DailyRotateFile({
    filename: "logs/%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    zippedArchive: true,
    level: "info",
  });

  static formatMessage = (object: string, message: string) => {
    return `[${object}]: ${message}`;
  };

  private logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss", // Customize the timestamp format here
      }),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
      })
    ),
    transports: [WinstonLogger.transport],
  });
  info(object: string, message: string): void {
    this.logger.info(WinstonLogger.formatMessage(object, message));
  }

  warn(object: string, message: string): void {
    this.logger.warn(WinstonLogger.formatMessage(object, message));
  }

  error(object: string, message: string): void {
    this.logger.error(WinstonLogger.formatMessage(object, message));
  }
}
