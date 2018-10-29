## CloudTrail Events to Slack hook

[![Build Status](https://travis-ci.org/keboola/aws-cloudtrail-slack-hook.svg?branch=master)](https://travis-ci.org/keboola/aws-cloudtrail-slack-hook)

The app creates a trail of CloudTrail events to a S3 bucket and a lambda function triggered by addition of files to the bucket. The function parses incoming logs for events, filter the events we are interested in (specified in an env var) and sends a notification about each event to specified Slack channel via incoming webhook.

### Installation

1. Download git repository: `git clone git@github.com:keboola/aws-cloudtrail-slack-hook.git`
2. Create CloudFormation stack with all required resources from template [cf-stack.json](https://github.com/keboola/aws-cloudtrail-slack-hook/blob/master/cf-stack.json) and choose `SERVICE_NAME` parameter (e.g. `dev-aws-cloudtrail-slack-hook`), and `STAGE`
3. Create AWS IAM user for deployment (e.g. `dev-aws-cloudtrail-slack-hook-deploy`) and assign it to the deployment group created in step 2. Create AWS credentials.
4. Create AWS IAM user for testing (e.g. `dev-aws-cloudtrail-slack-hook`) and assign it to the testing group created in step 2. Create AWS credentials.
5. Create `.env` file with following variables:
  - `DEV_DEPLOY_AWS_ACCESS_KEY_ID` - AWS Access Key Id for the user created in step 3
  - `DEV_DEPLOY_AWS_SECRET_ACCESS_KEY` - AWS Secret Key for the user created in step 3
  - `DEV_PAPERTRAIL_PORT` - Papertrail port
  - `DEV_REGION` - AWS region
  - `DEV_SERVICE_NAME` - Service name, should be unique (e.g. `dev-aws-cloudtrail-slack-hook`)
  - `DEV_SLACK_URL` - Url of Slack incoming webhook
  - `DEV_TIME_ZONE` - Time zone for event times in Slack (e.g. `Europe/Prague`)
  - `DEV_WATCHED_EVENTS` Comma-separated list of events to watch (e.g. `ConsoleLogin,SwitchRole`)
6. Run `docker-compose run --rm deploy`


### Deployment

Deployment to production is run automatically on Travis after push to master branch.
