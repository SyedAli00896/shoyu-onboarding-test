import { Job } from 'bull'

import { blockchain } from '@src/blockchain'
import { userRepository } from '@src/db'
import { helper } from '@src/helper'
import { blockchainConfig } from '@src/env'

export const getEthereumEvent = (job: Job): Promise<any> => {
  const { chainId } = job.data
  const network = blockchainConfig.networks.get(chainId)
  const contract = blockchain.getContract(chainId)

  const filter = { address: contract.address }
  return contract.queryFilter(filter)
    .then(events => {
      return events.map((evt) => {
        console.log(`Found event ${evt.event} on ${network} network`)
        const [addr, username, name, twitter] = evt.args
        const userId = helper.toCompositeKey(chainId, addr)
        const chainUsername = helper.toCompositeKey(chainId, username.hash)

        switch (evt.event) {
        case 'CreateIdentity':
          // TODO - using update with upsert because
          //  previously processed events are not skipped, may be need to track block numbers
          return userRepository.updateById(
            userId,
            {
              address: addr,
              chainId: +chainId,
              username: username.hash,
              chainUsername,
              name,
              twitter,
            },
            true,
          )
        case 'UpdateIdentity':
          return userRepository.updateById(userId, {
            username: username.hash,
            chainUsername,
            name,
            twitter,
          })
        case 'DeleteIdentity':
          return userRepository.deleteById(userId)
        default:
          return
        }
      })
    })
}
