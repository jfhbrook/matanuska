import { createLogger } from 'kenny-loggins';

export const logger = new Proxy(
  {
    logger: createLogger(),
  },
  {
    get(target, prop, _receiver) {
      switch (prop) {
        case 'configure':
          return (options = {}) => {
            if (options.pretty) {
              target.logger = createLogger({ colors: true });
            } else {
              target.logger = createLogger();
            }
          };
        default:
          return Reflect.get(target.logger, prop);
      }
    },
  },
);
