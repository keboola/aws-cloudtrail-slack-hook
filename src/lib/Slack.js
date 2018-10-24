import _ from 'lodash';
import axios from 'axios';
import moment from 'moment-timezone';

export default class Slack {
  constructor(url, username, timezone = 'UTC') {
    this.url = url;
    this.username = username;
    this.timezone = timezone;
  }

  async send(event, time, userName, ip) {
    // eslint-disable-next-line no-console
    console.log('send', JSON.stringify({
      event,
      time,
      userName,
      ip,
    }));
    if (!this.url) {
      return Promise.resolve();
    }
    const opts = {
      username: this.username,
      icon_url: 'http://aux.iconspalace.com/uploads/aws-icon-256.png',
      attachments: [
        {
          color: 'warning',
          fields: [
            {
              title: 'Event Name',
              value: event,
              short: true,
            },
            {
              title: 'User',
              value: userName,
              short: true,
            },
            {
              title: 'Event Time',
              value: moment(time).tz(this.timezone).format('YYYY-MM-DD HH:mm:ss'),
              short: true,
            },
            {
              title: 'IP Address',
              value: ip,
              short: true,
            },
          ],
        },
      ],
    };

    await axios.request({
      method: 'post',
      url: this.url,
      data: opts,
    }).catch((err) => {
      if (_.has(err, 'response.status') && _.has(err, 'response.data')) {
        throw new Error(JSON.stringify({ status: err.response.status, data: err.response.data }));
      }
      throw err;
    });
    return Promise.resolve();
  }
}
