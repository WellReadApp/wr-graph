import { ApolloError, AuthenticationError, UserInputError } from 'apollo-server-express';

class OperationalError extends ApolloError {
  constructor(message:string, code:string) {
    super(message, code);
    this.operational = true;
    this.status = 400;
  }
}

class AuthorizationError extends AuthenticationError {
  constructor(message:string) {
    super(message);
    this.operational = true;
    this.status_code = 401;
  }
}

class ItemNotFoundError extends OperationalError {
  constructor(message:string) {
    super(message, 'NOT_FOUND');
    this.operational = true;
    this.status_code = 404;
  }
}

class BadRequestError extends OperationalError {
  constructor(message:string) {
    super(message, 'BAD_REQUEST');
    this.status = 400;
  }
}

class InputError extends UserInputError {
  constructor(message:string) {
    super(message);
    this.operational = true;
    this.status_code = 400;
  }
}

export {
  OperationalError,
  AuthorizationError,
  ItemNotFoundError,
  BadRequestError,
  InputError,
};
