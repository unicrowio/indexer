import { gql } from "graphql-request";

export const bulkInsertEventsMutation = gql`
  mutation createEvents($network: String!, $blockNumber: Int!, $events: [events_insert_input!]!) {
    allEvents: insert_events(objects: $events) {
      affected_rows
    }

    updateBlockNumber: insert_last_block_number(
      objects: { network: $network, block_number: $blockNumber }
      on_conflict: {
        constraint: last_block_number_pkey
        update_columns: [block_number]
      }
    ) {
      affected_rows
    }
  }
`;
