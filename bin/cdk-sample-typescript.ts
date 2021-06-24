#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkSampleTypescriptStack } from '../lib/cdk-sample-typescript-stack';
import { VpcStack } from '../lib/vpc-stack';

const app = new cdk.App();

const env = app.node.tryGetContext('env');
const context = app.node.tryGetContext(env);

new CdkSampleTypescriptStack(app, 'CdkSampleTypescriptStack', {
  env: { account: context['aws_account'], region: context['region'] },
});
new VpcStack(app, 'VpcStack', {
  env: { account: context['aws_account'], region: context['region'] },
});
