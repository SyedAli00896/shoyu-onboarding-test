import Joi from 'joi'
import { appError } from '@src/graphql/error'
import { blockchain } from '@src/blockchain'

export const validateSchema = (schema: Joi.Schema, input: unknown): void => {
	const { error } = schema.validate(input, { abortEarly: true })
	if (error) {
		throw appError.buildInvalidSchemaError(error.toString())
	}
}

export const buildUserInputSchema = (): Joi.ObjectSchema =>
	Joi.object().keys({
		username: Joi.string().required(),
		name: Joi.string(),
		twitter: Joi.string(),
	})

export const buildAddressInputSchema = (): Joi.StringSchema =>
	Joi.string().regex(blockchain.addressRegex).message('Invalid Ethereum Address').required()
