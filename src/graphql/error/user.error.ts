import { ApolloError } from 'apollo-server'

enum ErrorType {
  AuthenticationRequired = 'AUTHENTICATION_REQUIRED',
  UsernameAlreadyExists = 'USERNAME_ALREADY_EXISTS',
  UserNotFound = 'USER_NOT_FOUND',
  UserAlreadyExists = 'USER_ALREADY_EXISTS',
}

export const buildAuthError = (): ApolloError => new ApolloError(
  'You must be signed in',
  ErrorType.AuthenticationRequired,
)

export const buildUserNotFound = (): ApolloError => new ApolloError(
  'User not found',
  ErrorType.UserNotFound,
)

export const buildUserAlreadyExistsError = (): ApolloError => new ApolloError(
  'User already exists',
  ErrorType.UserAlreadyExists,
)

export const buildUsernameAlreadyExistsError = (): ApolloError => new ApolloError(
  'Username already exists',
  ErrorType.UsernameAlreadyExists,
)
