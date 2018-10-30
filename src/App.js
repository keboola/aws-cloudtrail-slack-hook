import _ from 'lodash';

export default class App {
  constructor(slack, s3Download, watchedEvents) {
    this.s3Download = s3Download;
    this.slack = slack;
    this.watchedEvents = watchedEvents;
  }

  async execute(event) {
    const logFiles = event.Records.map(e => ({ Bucket: e.s3.bucket.name, Key: e.s3.object.key }));
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

  getAndFilterLogFile(logFile) {
    return this.s3Download.retrieveAndUnGzipLog(logFile)
      .then((log) => {
        if (log.Records && _.isArray(log.Records)) {
          return Promise.resolve(_.filter(log.Records, event => this.shouldLogEvent(event)));
        }
        return Promise.resolve([]);
      });
  }

  shouldLogEvent(event) {
    return _.includes(this.watchedEvents, event.eventName);
  }
}
