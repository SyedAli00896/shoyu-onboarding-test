import { ApolloError } from 'apollo-server'

enum ErrorType {
  ChainIdRequired = 'CHAIN_ID_REQUIRED',
  InternalError = 'INTERNAL_ERROR',
  InvalidSchema = 'INVALID_SCHEMA',
}

export const buildCustomError = (message: string): ApolloError => new ApolloError(
  message,
  ErrorType.InternalError,
)

export const buildInvalidSchemaError = (message?: string): ApolloError => new ApolloError(
  message || 'Invalid schema provided',
  ErrorType.InvalidSchema,
)

export const buildMissingChainIdError = (): ApolloError => new ApolloError(
  'Chain id is missing',
  ErrorType.ChainIdRequired,
)
