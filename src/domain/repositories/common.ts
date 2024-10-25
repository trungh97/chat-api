export type Result<T, E> = {
  success: boolean;
  value: T;
  error?: E;
};
