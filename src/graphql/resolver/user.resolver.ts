import { combineResolvers } from 'graphql-resolvers'

import { gqlTypes, ApolloCtx } from '@src/defs'
import { blockchain } from '@src/blockchain'
import { helper, joi } from '@src/helper'
import { userRepository } from '@src/db'
import { appError, userError } from '@src/graphql/error'

const toUser = (ctx: ApolloCtx, username: string, name: string, twitter: string): gqlTypes.User => {
	const { chainId, address, userId } = ctx
	return {
		id: userId,
		address,
		chainId: +chainId,
		username,
		name,
		twitter,
	}
}

const signup = async (
	_: any,
	{ input }: gqlTypes.MutationSignUpArgs,
	ctx: ApolloCtx
): Promise<gqlTypes.User> => {
	const { chainId, address, userId } = ctx
	const { username = '', name = '', twitter = '' } = input

	joi.validateSchema(joi.buildUserInputSchema(), input)

	const contract = blockchain.getContract(chainId)
	const chainUsername = helper.toCompositeKey(chainId, username)

	try {
		const [userExists, usernameExists] = await Promise.all([
			userRepository.doesExist({ _id: userId }),
			userRepository.doesExist({ chainUsername }),
		])
		if (userExists) throw userError.buildUserAlreadyExistsError()

		if (usernameExists) throw userError.buildUsernameAlreadyExistsError()

		await contract.createIdentity(address, username, name, twitter, blockchain.getGasConf())
		return toUser(ctx, username, name, twitter)
	} catch (error) {
		throw appError.buildCustomError(error.toString())
	}
}

const updateMe = async (
	_: any,
	{ input }: gqlTypes.MutationUpdateMeArgs,
	ctx: ApolloCtx
): Promise<gqlTypes.User> => {
	const { chainId, address, userId } = ctx
	console.log(`${address} wants to update his/her user info`)

	joi.validateSchema(joi.buildUserInputSchema(), input)

	const chainUsername = helper.toCompositeKey(chainId, input.username)
	const contract = blockchain.getContract(chainId)

	try {
		const userExists = await userRepository.doesExist({ chainUsername })
		if (userExists) throw userError.buildUsernameAlreadyExistsError()

		const user = await userRepository.findById(userId)
		if (!user) throw userError.buildUserNotFound()

		const { username = '', name = user.name, twitter = user.twitter } = input

		await contract.updateIdentity(address, username, name, twitter, blockchain.getGasConf())
		return toUser(ctx, username, name, twitter)
	} catch (error) {
		throw appError.buildCustomError(error.toString())
	}
}

export default {
	Mutation: {
		signUp: combineResolvers(helper.hasChainId, helper.isAuthenticated, signup),
		updateMe: combineResolvers(helper.hasChainId, helper.isAuthenticated, updateMe),
	},
}
