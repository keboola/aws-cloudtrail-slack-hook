import App from '../App';
import S3Download from '../lib/S3Download';
import Slack from '../lib/Slack';

jest.mock('../lib/S3Download');
jest.mock('../lib/Slack');

describe('App', () => {
  beforeEach(() => {
    S3Download.mockClear();
    Slack.mockClear();
  });

  it('shouldLogEvent', async () => {
    const app = new App(new Slack(), new S3Download(), ['ConsoleLogin', 'SwitchRole']);
    expect(app.shouldLogEvent({ eventName: 'ConsoleLogin' })).toBeTruthy();
    expect(app.shouldLogEvent({ eventName: 'AssumeRole' })).toBeFalsy();
  });

  it('getAndFilterLogFile', async () => {
    S3Download.mockImplementation(() => ({
      retrieveAndUnGzipLog: jest.fn().mockResolvedValue({
        Records: [
          {
            eventName: 'ConsoleLogin',
          },
          {
            eventName: 'AssumeRole',
          },
        ],
      }),
    }));

    const app = new App(new Slack(), new S3Download(), ['ConsoleLogin', 'SwitchRole']);
    await expect(app.getAndFilterLogFile('logFile')).resolves.toHaveLength(1);
  });

  it('collectAndFilterEvents', async () => {
    S3Download.mockImplementation(() => ({
      retrieveAndUnGzipLog: jest.fn().mockResolvedValue({
        Records: [
          {
            eventName: 'ConsoleLogin',
          },
          {
            eventName: 'AssumeRole',
          },
        ],
      }),
    }));

    const app = new App(new Slack(), new S3Download(), ['ConsoleLogin', 'SwitchRole']);
    await expect(app.collectAndFilterEvents(['logFile1', 'logFile2'])).resolves.toHaveLength(2);
  });

  it('execute', async () => {
    S3Download.mockImplementation(() => ({
      retrieveAndUnGzipLog: jest.fn().mockResolvedValue({
        Records: [
          {
            eventName: 'ConsoleLogin',
            eventTime: '2018-01-01 12:00:01',
            userIdentity: {
              userName: 'test1',
            },
            sourceIPAddress: '0.0.0.1',
          },
          {
            eventName: 'AssumeRole',
            eventTime: '2018-01-01 12:00:02',
            userIdentity: {
              userName: 'test2',
            },
            sourceIPAddress: '0.0.0.2',
          },
        ],
      }),
    }));

    const app = new App(new Slack(), new S3Download(), ['ConsoleLogin', 'SwitchRole']);
    await app.execute({
      Records: [
        {
          s3: {
            bucket: { name: 'b1' },
            object: { key: 'k1' },
          },
        },
        {
          s3: {
            bucket: { name: 'b2' },
            object: { key: 'k2' },
          },
        },
      ],
    });
    expect(Slack).toHaveBeenCalled();
  });
});
