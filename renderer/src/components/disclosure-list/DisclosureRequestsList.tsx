import React from 'react';
import { DisclosureRequestItem } from './DisclosureRequestItem';
import { NetworkRequest } from '../../../../shared/models/request';

const DisclosureRequestsList = ({ requests }: { requests: NetworkRequest[] }) => {
  return (
    <>
      <ul>
        {requests.map(req => DisclosureRequestItem(req))}
      </ul>
    </>
  )
}

export default DisclosureRequestsList