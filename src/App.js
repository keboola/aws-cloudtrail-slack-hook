/* eslint-disable no-console */
import _ from 'lodash';

export default class App {
  constructor(slack, s3Download, watchedEvents, requestId) {
    this.s3Download = s3Download;
    this.slack = slack;
    this.watchedEvents = watchedEvents;
    this.requestId = requestId;
  }

  log(event, files) {
    console.log(JSON.stringify({
      event,
      files,
      requestId: this.requestId,
    }));
  }

  async execute(event) {
    const logFiles = event.Records.map(e => ({ Bucket: e.s3.bucket.name, Key: e.s3.object.key }));
    this.log('Files to process', logFiles);
    const eventsToSend = await this.collectAndFilterEvents(logFiles);

    return Promise.all(_.map(eventsToSend, e => this.slack.send(
      e.eventName,
      e.eventTime,
      _.get(e, 'userIdentity.principalId', _.get(e, 'userIdentity.arn', e.userIdentity.userName)),
      e.sourceIPAddress
    )));
  }

  async collectAndFilterEvents(logFiles) {
    const promises = [];
    await _.each(logFiles, logFile => promises.push(this.getAndFilterLogFile(logFile)));
    const promisesResult = await Promise.all(promises);
    return _.flatten(promisesResult);
  }

  async getAndFilterLogFile(logFile) {
    this.log('Processing file', logFile);
    console.log(`Processing ${JSON.stringify(logFile)} ..`);
    const log = await this.s3Download.retrieveAndUnGzipLog(logFile);
    if (log.Records && _.isArray(log.Records)) {
      return new Promise(async (res) => {
        const filteredRecords = _.filter(log.Records, event => this.shouldLogEvent(event));
        this.log(`File processed with ${_.size(filteredRecords)} records`, logFile);
        res(filteredRecords);
      });
    }
    this.log('File processed with 0 records', logFile);
    return Promise.resolve([]);
  }

  shouldLogEvent(event) {
    return _.includes(this.watchedEvents, event.eventName);
  }
}
