// lambdaWrapper.ts
import { injectSecrets } from './helpers/injectSecrets';
import type { Handler } from './types';
import { isWarmupEvent } from './utils/eventUtils';

export interface LambdaWrapperOptions {
  secretArnEnvVar?: string; // default: SECRET_ARN
  preload?: () => Promise<void>; // optional: preload logic
}

/**
 * Wraps a Lambda handler to inject secrets and handle warmup events.
 */
export function withEnvInjection<Func extends Handler<unknown, unknown>>(
  loadHandler: () => Promise<Func>,
  options: LambdaWrapperOptions = {},
): Func {
  let initialized = false;

  const wrappedHandler: Handler = async (event, context, callback) => {
    // 🔥 Handle warmup events
    if (isWarmupEvent(event)) {
      console.log('Lambda is warm!');
      return callback(null, { message: 'Lambda is warm!' });
    }

    try {
      // 🔑 Inject secrets once
      if (!initialized) {
        const secretArn = process.env[options.secretArnEnvVar || 'SECRET_ARN'];
        if (!secretArn) throw new Error('SECRET_ARN is not defined');

        await injectSecrets(secretArn);

        await options.preload?.();
        initialized = true;
      }

      const handler = await loadHandler();
      // 🚀 Run the actual handler
      return handler(event, context, callback);
    } catch (error) {
      console.error('Error in wrapped handler:', error);
      return callback(null, { message: 'API not available' });
    }
  };
  return wrappedHandler as Func;
}
