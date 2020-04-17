import React from 'react';
import { NetworkRequest } from '../../models/request';

export const DisclosureRequestItem = (request: NetworkRequest) => {
    return (
        <li key={request.key}>{request.url}</li>
    )
}