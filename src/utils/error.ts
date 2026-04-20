export function getErrorMessage(
  error: unknown,
  fallbackMessage = "予期しないエラーが発生しました",
): string {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function handleAppError(
  error: unknown,
  fallbackMessage?: string,
): void {
  window.alert(getErrorMessage(error, fallbackMessage));
}
