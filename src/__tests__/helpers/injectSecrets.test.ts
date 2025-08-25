import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

jest.mock('@aws-sdk/client-secrets-manager');

describe('injectSecrets', () => {
  const mockSecretArn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:mysecret';
  const mockSecrets = {
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
    SECRET_KEY: 'test-secret-key',
    DATABASE_URL: 'test-database-url',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.SECRET_KEY;
    delete process.env.DATABASE_URL;
    // Reset module cache to clear singleton state
    jest.resetModules();
  });

  it('should fetch secrets and set process.env variables', async () => {
    // Mock send method
    (SecretsManagerClient as jest.Mock).mockImplementation(() => ({
      send: jest.fn().mockImplementation((command) => {
        if (command instanceof GetSecretValueCommand) {
          return Promise.resolve({ SecretString: JSON.stringify(mockSecrets) });
        }
        return Promise.reject(new Error('Unknown command'));
      }),
    }));

    const { injectSecrets: freshInjectSecrets } = await import('../../helpers/injectSecrets');
    const result = await freshInjectSecrets(mockSecretArn);

    expect(result).toEqual(mockSecrets);
    expect(process.env.GOOGLE_CLIENT_ID).toBe(mockSecrets.GOOGLE_CLIENT_ID);
    expect(process.env.GOOGLE_CLIENT_SECRET).toBe(mockSecrets.GOOGLE_CLIENT_SECRET);
    expect(process.env.SECRET_KEY).toBe(mockSecrets.SECRET_KEY);
    expect(process.env.DATABASE_URL).toBe(mockSecrets.DATABASE_URL);
  });

  it('should throw if SecretString is missing', async () => {
    (SecretsManagerClient as jest.Mock).mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({}),
    }));
    const { injectSecrets: freshInjectSecrets } = await import('../../helpers/injectSecrets');
    await expect(freshInjectSecrets(mockSecretArn)).rejects.toThrow('No secrets found in AWS Secrets Manager');
  });
});
