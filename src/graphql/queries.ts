import { gql } from "graphql-request";

export const getBlockNumberQuery = gql`
  query getBlockNumber($chainId: String!) {
    last_block_number(where: { chain_id: { _eq: $chainId } }) {
      block_number
    }
  }
`;
