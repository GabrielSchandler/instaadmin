type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

function log(level: LogLevel, message: string, data?: unknown): void {
  const entry: LogEntry = {
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    const colors = { info: "\x1b[36m", warn: "\x1b[33m", error: "\x1b[31m", debug: "\x1b[35m" };
    console[level === "debug" ? "log" : level](
      `${colors[level]}[${entry.timestamp}] [${level.toUpperCase()}]\x1b[0m ${message}`,
      data ?? ""
    );
  } else {
    console[level === "debug" ? "log" : level](JSON.stringify(entry));
  }
}

export const logger = {
  info:  (msg: string, data?: unknown) => log("info", msg, data),
  warn:  (msg: string, data?: unknown) => log("warn", msg, data),
  error: (msg: string, data?: unknown) => log("error", msg, data),
  debug: (msg: string, data?: unknown) => log("debug", msg, data),
};
