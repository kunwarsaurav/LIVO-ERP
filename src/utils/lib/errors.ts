export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = "Invalid Credentials") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(item: string = "Item") {
    super(`${item} not found`);
    this.name = `${item}NotFoundError`;
  }
}

export class ValidationError extends Error {
  constructor(message: string = "Invalid Validation failed") {
    super(message);
    this.name = "ValidationError";
  }
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}