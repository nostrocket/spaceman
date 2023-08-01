import * as NostrTools from "nostr-tools";
import {enmapReply} from "../problems/events.js";
import {makeElementRocket} from "../merits/viewMeritRequests.js";

export function prefetchProductInfo() {
    let ids = []
    Object.values(window.spaceman.CurrentState.state.rockets).forEach(rocket => {
        if (rocket.Products) {
            rocket.Products.forEach(product => {
                if (product.ProductInformation) {
                    ids.push(product.ProductInformation)
                }
            })
        }
    })
    if (ids.length > 0) {
        beginListeningForComments(ids)
    }
}

var startedListening = false
function beginListeningForComments(ids) {
    if (!startedListening) {
        startedListening = true
        const pool = new NostrTools.SimplePool()
        let relays = []

        let sub = pool.sub(
            [...relays, 'wss://nostr.688.org', 'wss://nos.lol'],
            [
                {
                    //tags: [['#e', 'fd459ea06157e30cfb87f7062ee3014bc143ecda072dd92ee6ea4315a6d2df1c']]
                    //"#e": ids
                    //kinds: [10310]
                    // authors: [
                    //     "b4f36e2a63792324a92f3b7d973fcc33eaa7720aaeee71729ac74d7ba7677675"
                    //     //NostrTools.nip19.decode("npub1mygerccwqpzyh9pvp6pv44rskv40zutkfs38t0hqhkvnwlhagp6s3psn5p").data
                    // ]
                    ids: ids
                }
            ]
        )

        sub.on('event', event => {
            if (event.kind === 1) {
                enmapReply(event)
                console.log(event)
            }
        })
    }
}