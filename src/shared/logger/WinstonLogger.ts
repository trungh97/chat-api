import { injectable } from "inversify";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export interface ILogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
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
  info(message: string): void {
    this.logger.info(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }
}
