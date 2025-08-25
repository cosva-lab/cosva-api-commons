type Callback<TResult = unknown> = (error?: Error | string | null, result?: TResult) => void;

export type Handler<TEvent = unknown, TResult = unknown> = (
  event: TEvent,
  // eslint-disable-next-line
  context: any,
  callback: Callback<TResult>,
) => void | Promise<TResult>;
