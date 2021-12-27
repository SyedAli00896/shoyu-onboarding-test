import { ethers, Signer, Contract, utils } from 'ethers'

import { blockchainConfig } from '@src/env'
import contractABI from '@src/contract/IdentityManager.json'
import { appError } from '@src/graphql/error'

const providers: { [key: string]: ethers.providers.JsonRpcProvider } = {}

export const addressRegex = /^0x[a-fA-F0-9]{40}$/

export const createProviders = (): void => {
  blockchainConfig.networksURI.forEach((val: string, key: string) => {
    providers[key] = new ethers.providers.JsonRpcProvider(val)
  })
}

export const getSigner = (chainId: string): Signer => {
  const provider = providers[chainId]
  return new ethers.Wallet(blockchainConfig.contractAccountPK, provider)
}

export const getContract = (chainId: string): Contract => {
  const signer = getSigner(chainId)
  const contractAddress = blockchainConfig.contractIds.get(chainId)
  return new ethers.Contract(contractAddress, contractABI, signer)
}

export const toGasUnits = (val: string): ethers.BigNumber => utils.parseUnits(val, 'gwei')

type ContractOptions = {
  gasLimit: ethers.BigNumber
  gasPrice: ethers.BigNumber
}

export const getGasConf = (
  gasLimit = '0.01',
  gasPrice = '20.0',
): ContractOptions => ({
  gasLimit: toGasUnits(gasLimit),
  gasPrice: toGasUnits(gasPrice),
})


export const validateSignature = (value: string): string => {
  if (value.startsWith('0x') && value.length === 132) { //  Todo - last digit of signature is derived from chainId, it can also be validated in some way
    return value
  }
  throw appError.buildCustomError('Invalid Auth Signature')
}

