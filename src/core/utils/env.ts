import chalk from 'chalk';

export interface env {
  dev: boolean,
  prod: boolean,
  test: boolean
}

if (process.env.NODE_ENV === undefined) {
  // This piece of code is run before cliRender is initialized, so direct chalk invoke is used
  console.warn(chalk.black.bgYellowBright(' WARN ') + ' ' +
    'Environment variable NODE_ENV is not assigned, PRODUCTION is implicitly used');
  process.env.NODE_ENV = 'production';
}

export default {
  dev: process.env.NODE_ENV === 'development',
  prod: process.env.NODE_ENV === 'production',
  test: process.env.NODE_ENV === 'test'
};
