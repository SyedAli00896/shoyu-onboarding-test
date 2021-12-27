import mongoose from 'mongoose'

import { dbConfig } from '@src/env'

mongoose.set('returnOriginal', false)

let connection: mongoose.Connection
export const connect = async (): Promise<void> => {
  if (connection) {
    return
  }

  const uri = `mongodb://${dbConfig.host}:${dbConfig.port}`
  try {
    await mongoose.connect(uri, {
      autoCreate: true,
      autoIndex: true,
      dbName: dbConfig.database,
      user: dbConfig.username,
      pass: dbConfig.password,
    })
    connection = mongoose.connection
    console.log('Connected to database.!')
  } catch (e) {
    console.log('Error connecting to database.!')
  }
}

export const disconnect = async (): Promise<void> => {
  if (!connection) {
    return
  }
  return mongoose.disconnect()
}
