import * as NostrTools from "nostr-tools";
import * as state from "../state/state.js";
import renderIdentityLayout from "../identity/identity.js";
import {enmapReply} from "../problems/events.js";


var startedListening = false

export function beginListeningForEvents() {
    if (!startedListening) {
        startedListening = true
        const pool = new NostrTools.SimplePool()
        let relays = []

        let sub = pool.sub(
            [...relays, 'wss://nostr.688.org'],
            [
                {
                    //tags: [['#e', 'fd459ea06157e30cfb87f7062ee3014bc143ecda072dd92ee6ea4315a6d2df1c']]
                    "#e": window.spaceman.rootevents.IgnitionEvent
                    //kinds: [10310]
                    // authors: [
                    //     "b4f36e2a63792324a92f3b7d973fcc33eaa7720aaeee71729ac74d7ba7677675"
                    //     //NostrTools.nip19.decode("npub1mygerccwqpzyh9pvp6pv44rskv40zutkfs38t0hqhkvnwlhagp6s3psn5p").data
                    // ]
                }
            ]
        )

        sub.on('event', event => {
            if (event.kind === 641804 || event.kind === 1) {
                enmapReply(event)
            }
            if (event.kind === 10310) {
                console.log(event)
                if (event.pubkey === window.spaceman.ignition_account || event.pubkey === window.spaceman.pubkey) {
                    //todo this should check for current pubkey || any pubkey with votepower > x
                    state.enMapState(event)
                    document.getElementById("content").replaceChildren()
                    document.getElementById("content").appendChild(renderIdentityLayout())
                    if (window.spaceman.CurrentState.state.identity[window.spaceman.pubkey]) {
                        if (window.spaceman.CurrentState.state.identity[window.spaceman.pubkey].Name) {
                            if (document.getElementById("pubkey")) {
                                document.getElementById("pubkey").innerText = window.spaceman.CurrentState.state.identity[window.spaceman.pubkey].Name
                            }
                        }

                    }
                }
            }
        })
    }

}

export async function signAsynchronously(event) {
    event.id = NostrTools.getEventHash(event)
    if (!window.nostr) {
        alert('Nostr extension not found.')
    } else if (window.nostr) {
        let signatureOrEvent = await window.nostr.signEvent(event)
        switch (typeof signatureOrEvent) {
            case 'string':
                event.sig = signatureOrEvent
                break
            case 'object':
                event.sig = signatureOrEvent.sig
                break
            default:
                throw new Error('Failed to sign with Nostr extension.')
        }
    }
    return event
}

export function makeUnsignedEvent(note, tags, kind, pubkey) {
    var now = Math.floor((new Date().getTime()) / 1000);
    let k;
    k = 1
    if (kind !== undefined) {
        k = kind
    }
    let event = {
        kind: kind,
        pubkey: pubkey,
        created_at: now,
        tags: tags,
        content: note
    }
    event.id = NostrTools.getEventHash(event)
    return event
}


export function publish(signed){
    let pubs = pool.publish([...relays, 'wss://nostr.688.org'], signed)
    pubs.on('ok', () => {
        console.log("published")
        // this may be called multiple times, once for every relay that accepts the event
        return 'ok!'
    })
    pubs.on('failed', relay => {
        console.log(`failed to publish event to: ${relay}`)
        return false
    })

}


