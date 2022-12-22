import { gql } from "graphql-request";

export const getBlockNumberQuery = gql`
  query getBlockNumber {
    last_block_number {
      block_number
    }
  }
`;
