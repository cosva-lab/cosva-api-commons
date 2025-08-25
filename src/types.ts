type Callback<TResult = unknown> = (error: Error | null, result?: TResult) => void;

export type Handler<TEvent = unknown, TResult = unknown> = (
  event: TEvent,
  context: unknown,
  callback: Callback<TResult>,
) => void | Promise<TResult>;
