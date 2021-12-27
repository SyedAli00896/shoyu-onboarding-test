/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config()
import 'module-alias/register'
import { serverPort } from '@src/env'
import { server } from '@src/graphql'
import { blockchain } from '@src/blockchain'
import { db } from '@src/db'
import { job } from '@src/job'

const bootstrap = async (): Promise<void> => {
	blockchain.createProviders()
	await db.connect()
	await server.start(serverPort)
	await job.startAndListen()
}

const handleError = (err: Error): void => {
	console.error(err)
	throw err
}

const cleanExit = async (): Promise<void> => {
	await server.stop()
	await db.disconnect()
	await job.stopAndDisconnect()
  	console.log('Thanks for stopping by. . .')
}

process.on('SIGTERM', cleanExit)

bootstrap().catch(handleError)
