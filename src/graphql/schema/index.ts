import { gql } from 'apollo-server'

export const typeDefs = gql`
  type User {
    id: ID! # chainId:address
    chainId: Int!
    address: String!
    username: String
    name: String
    twitter: String
  }
  input UserInput {
    username: String
    name: String
    twitter: String
  }
  type Query {
    user(address: String!): User
    me: User
  }

  type Mutation {
    signUp(input: UserInput!): User
    updateMe(input: UserInput!): User
  }
`;
