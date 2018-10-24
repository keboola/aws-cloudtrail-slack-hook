import Slack from '../Slack';

describe('Slack', () => {
  it('send', async () => {
    const slack = new Slack(process.env.SLACK_URL, 'aws-cloudtrail-slack-hook-test');
    await expect(slack.send('event', '2018-10-01 12:00:00', 'user', '0.0.0.0')).resolves.not.toThrow();
  });
});
