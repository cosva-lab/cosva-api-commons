jest.mock('@aws-sdk/client-secrets-manager');

describe('injectSecrets', () => {
  const mockSecretArn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:mysecret';
  const mockSecrets = {
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
    SECRET_KEY: 'test-secret-key',
    DATABASE_URL: 'test-database-url',
  };

  const sendMock = jest.fn();
  jest.mock('@aws-sdk/client-secrets-manager', () => {
    const originalModule = jest.requireActual('@aws-sdk/client-secrets-manager');
    return {
      ...originalModule,
      SecretsManagerClient: jest.fn(() => ({ send: sendMock })),
      GetSecretValueCommand: originalModule.GetSecretValueCommand,
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    sendMock.mockReset();
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.SECRET_KEY;
    delete process.env.DATABASE_URL;
    jest.resetModules();
  });

  it('should fetch secrets and set process.env variables', async () => {
    sendMock.mockReturnValue(Promise.resolve({ SecretString: JSON.stringify(mockSecrets) }));

    const { injectSecrets: freshInjectSecrets } = await import('../../helpers/injectSecrets');
    const result = await freshInjectSecrets(mockSecretArn);

    expect(result).toEqual(mockSecrets);
    expect(process.env.GOOGLE_CLIENT_ID).toBe(mockSecrets.GOOGLE_CLIENT_ID);
    expect(process.env.GOOGLE_CLIENT_SECRET).toBe(mockSecrets.GOOGLE_CLIENT_SECRET);
    expect(process.env.SECRET_KEY).toBe(mockSecrets.SECRET_KEY);
    expect(process.env.DATABASE_URL).toBe(mockSecrets.DATABASE_URL);
  });

  it('should throw if SecretString is missing', async () => {
    sendMock.mockResolvedValue({});
    const { injectSecrets: freshInjectSecrets } = await import('../../helpers/injectSecrets');
    await expect(freshInjectSecrets(mockSecretArn)).rejects.toThrow('No secrets found in AWS Secrets Manager');
  });
});
