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

const getUser = async (chainId: string, address: string): Promise<gqlTypes.User> => {
	const userId = helper.toCompositeKey(chainId, address)
	const user = await userRepository.findById(userId)
	if (!user) {
		throw userError.buildUserNotFound()
	}
	return {
		id: user.id,
		address: user.address,
		chainId: user.chainId,
		name: user.name,
		twitter: user.twitter,
		username: user.username,
	}
}

const getCurrentUser = (
	_: any,
	args: any,
	{ chainId, address }: ApolloCtx
): Promise<gqlTypes.User> => {
	return getUser(chainId, address)
}

const getOtherUser = (
	_: any,
	{ address }: gqlTypes.QueryUserArgs,
	{ chainId }: ApolloCtx
): Promise<gqlTypes.User> => {
	joi.validateSchema(joi.buildAddressInputSchema(), address)
	return getUser(chainId, address)
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
	Query: {
		me: combineResolvers(helper.hasChainId, helper.isAuthenticated, getCurrentUser),
		user: combineResolvers(helper.hasChainId, helper.isAuthenticated, getOtherUser),
	},
	Mutation: {
		signUp: combineResolvers(helper.hasChainId, helper.isAuthenticated, signup),
		updateMe: combineResolvers(helper.hasChainId, helper.isAuthenticated, updateMe),
	},
}
