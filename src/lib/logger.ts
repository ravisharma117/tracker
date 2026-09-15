/**
 * A thin wrapper around `console` so the rest of the code has one place to
 * change if we ever swap in a real logger or send errors to a remote sink.
 * `debug` and `info` are silenced in production builds; `warn` and `error`
 * always go through — production is exactly when we want to see them.
 */

const isDev = import.meta.env.DEV;

type LogArgs = Parameters<typeof console.log>;

export const logger = {
  debug: (...args: LogArgs) => {
    if (isDev) console.debug(...args);
  },
  info: (...args: LogArgs) => {
    if (isDev) console.info(...args);
  },
  log: (...args: LogArgs) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: LogArgs) => {
    console.warn(...args);
  },
  error: (...args: LogArgs) => {
    console.error(...args);
  },
};
