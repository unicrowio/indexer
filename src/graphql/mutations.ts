import { gql } from "graphql-request";

export const bulkInsertEventsMutation = gql`
  mutation createEvents($events: [events_insert_input!]!, $blockNumber: Int!) {
    allEvents: insert_events(objects: $events) {
      affected_rows
    }

    update_last_block_number_by_pk(
      pk_columns: { id: 1 }
      _set: { block_number: $blockNumber }
    ) {
      block_number
    }
  }
`;
