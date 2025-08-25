import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

let secrets: Record<string, string>;

export const injectSecrets = async (secretArn: string): Promise<Record<string, string>> => {
  if (secrets) return secrets;

  const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
  const command = new GetSecretValueCommand({ SecretId: secretArn });

  const data = await client.send(command);
  if (!data?.SecretString) throw new Error('No secrets found in AWS Secrets Manager');

  const awsSecrets = JSON.parse(data.SecretString);
  process.env.GOOGLE_CLIENT_ID = awsSecrets.GOOGLE_CLIENT_ID;
  process.env.GOOGLE_CLIENT_SECRET = awsSecrets.GOOGLE_CLIENT_SECRET;
  process.env.SECRET_KEY = awsSecrets.SECRET_KEY;
  process.env.DATABASE_URL = awsSecrets.DATABASE_URL;

  secrets = awsSecrets;
  return secrets;
};
