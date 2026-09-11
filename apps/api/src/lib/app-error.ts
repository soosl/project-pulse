export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: unknown | undefined;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(code: string, message: string, details?: unknown) {
    return new AppError(400, code, message, details);
  }

  static unauthorized(message = "Требуется авторизация") {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static notFound(message = "Ресурс не найден") {
    return new AppError(404, "NOT_FOUND", message);
  }

  static conflict(code: string, message: string) {
    return new AppError(409, code, message);
  }

  static tooManyRequests() {
    return new AppError(
      429,
      "TOO_MANY_REQUESTS",
      "Слишком много запросов, повторите попытку позже",
    );
  }
}
