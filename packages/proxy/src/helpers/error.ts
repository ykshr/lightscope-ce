export function redactError(err: unknown) {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
    };
  }
  return err;
}
