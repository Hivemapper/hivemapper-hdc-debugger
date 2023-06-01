import {
    createPromiseClient
} from '@bufbuild/connect'
import {
    createConnectTransport,
} from '@bufbuild/connect-web'
import { EventService } from '../gen/proto/sf/events/v1/events_connect'

// Make the Event Service client
const client = createPromiseClient(
    EventService,
    createConnectTransport({
        baseUrl: 'http://192.168.0.10:9000',
    })
)