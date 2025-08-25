import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

type Secrets = Record<string, string>;
let secrets: Secrets | null = null;
let lastFetchedAt: number | null = null;

export const injectSecrets = async (
  secretArn: string,
  cacheTtlMs: number = 5 * 60 * 1000, // default 5 minutes
): Promise<Secrets> => {
  const now = Date.now();

  // ✅ Return cached secrets if still valid
  if (secrets && lastFetchedAt && now - lastFetchedAt < cacheTtlMs) return secrets;

  // 🔑 Fetch secrets again from AWS
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
  const command = new GetSecretValueCommand({ SecretId: secretArn });
  const data = await client.send(command);

  if (!data?.SecretString) throw new Error('No secrets found in AWS Secrets Manager');

  const awsSecrets = JSON.parse(data.SecretString) as Secrets;

  // 🧩 Inject into process.env
  process.env.GOOGLE_CLIENT_ID = awsSecrets.GOOGLE_CLIENT_ID;
  process.env.GOOGLE_CLIENT_SECRET = awsSecrets.GOOGLE_CLIENT_SECRET;
  process.env.SECRET_KEY = awsSecrets.SECRET_KEY;
  process.env.DATABASE_URL = awsSecrets.DATABASE_URL;

  // 🗄️ Cache result with timestamp
  secrets = awsSecrets;
  lastFetchedAt = now;

  return secrets;
};
