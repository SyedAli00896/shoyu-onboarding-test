import { ApolloServer } from 'apollo-server'
import { utils } from 'ethers'

import { typeDefs } from '@src/graphql/schema'
import { resolvers } from '@src/graphql/resolver'
import { ApolloCtx } from '@src/defs'
import { helper } from '@src/helper'
import { authMessage } from '@src/env'
import { blockchain } from '@src/blockchain'

const chainIdHeader = 'chain-id'
const authHeader = 'auth-signature'

const createContext = (ctx: any): ApolloCtx => {
  const { req, connection } = ctx
  const headers = connection && connection.context ? connection.context : req.headers

  const chainId = headers[chainIdHeader] || null
  const authSignature = headers[authHeader] || null
  let address: string = null
  let userId: string = null
  if (authSignature !== null) {
    blockchain.validateSignature(authSignature)
    address = utils.verifyMessage(authMessage, authSignature)
    userId = helper.toCompositeKey(chainId, address)
  }

  return {
    userId,
    address,
    chainId,
  }
}

let server: ApolloServer

export const start = async (port: number): Promise<void> => {
  if (server) {
    return
  }

  server = new ApolloServer({
    cors: true,
    resolvers,
    typeDefs,
    context: createContext,
  })
  const { url } = await server.listen(port)
  console.log(`🚀  Server ready at ${url}`)
}

export const stop = (): Promise<void> => {
  if (!server) {
    return
  }
  return server.stop()
}
