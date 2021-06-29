import * as cdk from '@aws-cdk/core';
import { Bucket, BlockPublicAccess, BucketEncryption } from '@aws-cdk/aws-s3';

export class ApiGwS3Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'S3Bucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.KMS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // bucketName: ""
    });
  }
}
