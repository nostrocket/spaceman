import * as NostrTools from "nostr-tools";
export const kind0Objects = new Map();
export const kind0Relays = ["wss://relay.damus.io"];

let kind0Ready = false

export function waitForKind0Ready(callback) {
    var interval = setInterval(function() {

        if (kind0Ready) {
            clearInterval(interval);
            callback();
            
        }
    }, 400);
}

function enMapKind0Object(e) {
    let c = e//JSON.parse(e)
    if (c.kind === 0) {
        kind0Objects.set(c.pubkey, JSON.parse(c.content))
    }
}
export function getKind0Object(pubkey,relays = []) {
    const pool = new NostrTools.SimplePool()
    let sub = pool.sub(
    [...relays, kind0Relays],
        [
            {
                kinds: [0],
                authors: [
                    pubkey
           ]
            }
        ]
    )


    sub.on('event', event => {
        // let j = JSON.parse(event.content)
        enMapKind0Object(event)
        kind0Ready = true
        return kind0Objects
    })

   
}