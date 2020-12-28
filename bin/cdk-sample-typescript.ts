#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkSampleTypescriptStack } from '../lib/cdk-sample-typescript-stack';

const app = new cdk.App();
new CdkSampleTypescriptStack(app, 'CdkSampleTypescriptStack', {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT
}});
