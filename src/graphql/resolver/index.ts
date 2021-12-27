import { mergeResolvers } from '@graphql-tools/merge'

import userResolvers from './user.resolver'

export const resolvers = mergeResolvers([
  userResolvers
])
