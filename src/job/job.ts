import Bull from 'bull'

import { redisConfig, blockchainConfig } from '@src/env'
import { getEthereumEvent } from '@src/job/handler'

const queuePrefix = 'queue'

const queues: { [key: string]: Bull.Queue } = {}

const createQueues = (): void => {
	blockchainConfig.networks.forEach((val: string, key: string) => {
		queues[key] = new Bull(val, {
			prefix: queuePrefix,
			redis: redisConfig,
		})
	})
}

const listenToJobs = (): Promise<void[]> => {
	const values = Object.values(queues)
	return Promise.all(
		values.map((queue) => {
			return queue.process(getEthereumEvent)
		})
	)
}

const publishJobs = (): Promise<Bull.Job[]> => {
	const chainIds = Object.keys(queues)
	return Promise.all(
		chainIds.map((chainId) => {
			return queues[chainId].add(
				{ chainId },
				{
					removeOnComplete: true,
					removeOnFail: true,
					repeat: { every: 60000 }, 	// repeat every minute
				}
			)
		})
	)
}

export const startAndListen = async (): Promise<void> => {
	createQueues()
	await publishJobs()
	await listenToJobs()
	console.log('Start listening for jobs :)!!')
}

export const stopAndDisconnect = (): Promise<any> => {
	const values = Object.values(queues)
	return Promise.all(
		values.map((queue) => {
			return queue.empty().then(() => queue.close(false))
		})
	)
}
