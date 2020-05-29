#!/usr/bin/env bash
set -Eeuo pipefail

CLOUDTRAIL_SLACK_HOOK_NAME="cloudtrail-$KEBOOLA_STACK"

aws cloudformation deploy \
    --stack-name kbc-cloudtrail-slack-hook \
    --template-file ./cf-stack.json \
    --no-fail-on-empty-changeset \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
      ServiceName=$CLOUDTRAIL_SLACK_HOOK_NAME \
      Stage=prod

export CLOUDFORMATION_ROLE_ARN=`aws cloudformation describe-stacks \
  --stack-name kbc-cloudtrail-slack-hook \
  --query "Stacks[0].Outputs[?OutputKey=='ServerlessCloudFormationRole'].OutputValue" \
  --output text`

export LAMBDA_EXECUTION_ROLE_ARN=`aws cloudformation describe-stacks \
  --stack-name kbc-cloudtrail-slack-hook \
  --query "Stacks[0].Outputs[?OutputKey=='ServerlessLambdaExecutionRole'].OutputValue" \
  --output text`

export REGION=`aws cloudformation describe-stacks \
  --stack-name kbc-cloudtrail-slack-hook \
  --query "Stacks[0].Outputs[?OutputKey=='Region'].OutputValue" \
  --output text`

docker build --tag kbc-cloudtrail-slack-hook .
docker run --rm kbc-cloudtrail-slack-hook yarn test:lint
docker run --rm kbc-cloudtrail-slack-hook yarn test:unit

echo "Deploy start."
docker run --rm \
    -e AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY \
    -e AWS_SESSION_TOKEN \
    -e CLOUDFORMATION_ROLE_ARN \
    -e LAMBDA_EXECUTION_ROLE_ARN \
    -e REGION \
    -e "KEBOOLA_STACK=kbc-cloudtrail-slack-hook" \
    -e "SERVICE_NAME=${CLOUDTRAIL_SLACK_HOOK_NAME}" \
    -e "SLACK_URL=${CLOUDTRAIL_SLACK_HOOK_SLACK_URL}" \
    -e "STAGE=prod" \
    -e "TIME_ZONE=${CLOUDTRAIL_SLACK_HOOK_TIME_ZONE}" \
    -e "WATCHED_EVENTS=${CLOUDTRAIL_SLACK_HOOK__WATCHED_EVENTS}" \
    kbc-cloudtrail-slack-hook serverless deploy

