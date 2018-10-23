import _ from 'lodash';
import * as awsSdk from 'aws-sdk';
import * as zlib from 'zlib';

export default class App {
  constructor(slack, watchedEvents) {
    this.s3 = new awsSdk.S3();
    this.slack = slack;
    this.watchedEvents = watchedEvents;
  }

  async execute(event) {
    const logFiles = event.Records.map(e => ({ Bucket: e.s3.bucket.name, Key: e.s3.object.key }));
    return this.collectAndFilterEventsForAPICall(logFiles);
  }

  async collectAndFilterEventsForAPICall(logFiles) {
    let eventsToSend = [];
    _.each(logFiles, async (logFile) => {
      const log = await this.retrieveAndUnGzipLog(logFile);
      if (log.Records && Array.isArray(log.Records)) {
        eventsToSend = eventsToSend.concat(log.Records.filter(event => this.shouldLogEvent(event)));
      }
    });

    return Promise.all(_.map(eventsToSend, e => this.slack.send(
      e.eventName,
      e.eventTime,
      e.userIdentity.userName,
      e.sourceIPAddress
    )));
  }

  shouldLogEvent(event) {
    return _.includes(this.watchedEvents, event.eventName);
  }

  async retrieveAndUnGzipLog(logFile) {
    const gzippedContentFile = await this.s3.getObject(logFile).promise();
    return App.unGzipContent(gzippedContentFile.Body);
  }

  static unGzipContent(zippedContent) {
    return new Promise((resolve, reject) => {
      zlib.gunzip(zippedContent, (err, result) => {
        if (err) {
          reject(err);
        } else {
          const unzippedLog = result.toString() ? JSON.parse(result.toString()) : { Records: [] };
          resolve(unzippedLog);
        }
      });
    });
  }
}
