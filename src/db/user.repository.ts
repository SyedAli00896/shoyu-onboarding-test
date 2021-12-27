import { FilterQuery } from 'mongoose'

import { UserDocument, UserModel } from './user.model'

export const create = async (newUser: Partial<UserDocument>): Promise<UserDocument> => {
	const user = new UserModel(newUser)
	await user.validate()
	return await user.save()
}

export const findById = async (id: string): Promise<UserDocument> => await UserModel.findById(id)

export const findBy = async (filter: FilterQuery<UserDocument>): Promise<UserDocument> =>
	await UserModel.findOne(filter)

export const doesExist = async (filter: FilterQuery<UserDocument>): Promise<boolean> =>
	await UserModel.exists(filter)

export const updateById = async (
	id: string,
	user: Partial<UserDocument>,
	upsert = false
): Promise<UserDocument> => await UserModel.findByIdAndUpdate(id, user, { upsert })

export const deleteById = async (id: string): Promise<boolean> => {
	await UserModel.findByIdAndDelete(id)
	return true
}
