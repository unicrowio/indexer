import { gql } from "graphql-request";

export const getBlockNumberQuery = gql`
  query getBlockNumber($network: String!) {
    last_block_number(where: { network: { _eq: $network } }) {
      block_number
    }
  }
`;
