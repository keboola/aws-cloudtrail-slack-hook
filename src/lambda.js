import * as aws from 'aws-sdk';
import middy from 'middy';
import errorLogger from '@keboola/middy-error-logger';

import App from './App';
import Slack from './lib/Slack';
import S3Download from './lib/S3Download';

process.env.BLUEBIRD_LONG_STACK_TRACES = 1;
global.Promise = require('bluebird');

const handlerFunction = async (event) => {
  const app = new App(
    new Slack(process.env.SLACK_URL, process.env.SERVICE_NAME, process.env.TIME_ZONE),
    new S3Download(new aws.S3()),
    process.env.WATCHED_EVENTS.split(',')
  );
  const res = await app.execute(event);
  return Promise.resolve({ statusCode: 200, body: JSON.stringify(res) });
};

// eslint-disable-next-line
export const handler = middy(handlerFunction)
  .use(errorLogger());
