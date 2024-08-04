interface ErrResponse {
  status: number;
  type: string;
  errorMsgs: { [key: string]: string } | string;
}

class HTTPError extends Error {
  constructor(
    readonly statusCode: number,
    readonly type: string,
    readonly errorMsgs: { [key: string]: string } | string
  ) {
    super(type);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    this.errorMsgs = errorMsgs;
  }
}

export class BadRequestError extends HTTPError {}

export class ResourceNotFoundError extends HTTPError {}

export class UnauthorizedError extends HTTPError {}

export class ConflictError extends HTTPError {}

export class ExceedRequestsError extends HTTPError {}

export default async function createHTTPError(res: Response) {
  const error: ErrResponse = await res.json();

  if (res.status === 400) {
    throw new BadRequestError(error.status, error.type, error.errorMsgs);
  }

  if (res.status === 401) {
    throw new UnauthorizedError(error.status, error.type, error.errorMsgs);
  }

  if (res.status === 404) {
    throw new ResourceNotFoundError(error.status, error.type, error.errorMsgs);
  }

  if (res.status === 409) {
    throw new ConflictError(error.status, error.type, error.errorMsgs);
  }

  if (res.status === 429) {
    throw new ExceedRequestsError(error.status, error.type, error.errorMsgs);
  }

  // 500 status code
  throw new Error('Internal Server Error');
}
