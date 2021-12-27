/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config()
import 'module-alias/register';
import { serverPort } from '@src/env'
import { server } from '@src/graphql'
import { blockchain } from '@src/blockchain'
import { db } from './db'

const bootstrap = async (): Promise<void> => {
  blockchain.createProviders()
  await db.connect()
  await server.start(serverPort)
}

const handleError = (err: Error): void => {
  console.error(err)
  throw err
}

bootstrap().catch(handleError)
