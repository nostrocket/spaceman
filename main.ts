import "@fontsource/ubuntu"
import './style.css'
import renderIdentities from './src/identity/identity.js'

import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import {newRocket} from "./src/rockets/newRocket.js";
import {updateAccountDetails} from "./src/identity/updateProfile.js";
import {createProblemsFromState} from "./src/problems/problemsFromState.js"
import NDK, {NDKEvent, NDKNip07Signer, NDKFilter, NDKSubscription} from "@nostr-dev-kit/ndk";
import * as nt from 'nostr-tools';
import {generateKeyPair} from "crypto";
import {beginListeningForEvents} from "./src/helpers/events";
import "@fontsource/ubuntu/700.css";
import {loading} from "./src/helpers/loading";
import {waitForStateReadyPromise} from "./src/state/state";
console.log(14)
declare global {
    interface Window { spaceman: any; }
}
export {};

window.spaceman = {}
window.spaceman.Functions = {}
window.spaceman.Views = {}

window.spaceman.Views.identityTree = () => {
    waitForStateReadyPromise.then(()=>{
        document.getElementById("content").replaceChildren(renderIdentities())
    })
}

window.spaceman.Views.joinIdentityTree = () => {
    waitForStateReadyPromise.then(()=>{
        document.getElementById("content").replaceChildren(updateAccountDetails())
    })
}

window.spaceman.Views.createNewRocket = () => {
    waitForStateReadyPromise.then(()=>{
        document.getElementById("content").replaceChildren(newRocket())
    })
}

window.spaceman.Views.problemTracker = () => {
    waitForStateReadyPromise.then(()=>{
        document.getElementById("content").replaceChildren(createProblemsFromState())
    })
}

window.spaceman.ignition_account = "546b4d7f86fe2c1fcc7eb10bf96c2eaef1daa26c67dad348ff0e9c853ffe8882"


window.spaceman.rootevents = {}
window.spaceman.rootevents.IgnitionEvent = "1bf16cac62588cfd7e3c336b8548fa49a09627f03dbf06c7a4fee27bc01972c8"
window.spaceman.rootevents.IdentityRoot = "ae14dd661475351993f626f66df8052ed73166796e5cd893c09e4d333e170bb5"//"320c1d0a15bd0d84c3527862ad02d558df3893dfbbc488dcf7530abec25d23bb"
window.spaceman.rootevents.Merits = "9f7211ac022b500a7adeeacbe44bb84225d1bb1ee94169f8c5d8d1640a154cbc"
window.spaceman.rootevents.MirvsRoot = "0f56599b6530f1ed1c11745b76a0d0fc29934e9a90accce1521f4dfac7a78532"
window.spaceman.rootevents.ReplayRoot = "9ab11d92bdeffd28762374d5dfc5286e0f494d7cff5bc00b4fce177bf1115b94"//"e29992d4c7d272dfc274b8a68f735c76dd361a24cc08bdf2ed6fe8808485024c"
window.spaceman.rootevents.ProblemRoot = "6439b9ff8c19b537ba5cdb7a7809f2031eb34c033229117ecfe055f608ff8842"//"a554a881b232e37fc93f8cb64638e10748907432ac15832c82f67513ed4e76d4"//"339d1188c9076d4c44119fca7f29b9b4c32b775853290075e4519ecdfdea4f38"


window.spaceman.CurrentState = {}
window.spaceman.CurrentState.ready = false
window.spaceman.nt = nt


export var ndk : NDK | null = null
export var nip07signer :  NDKNip07Signer | null = null
async function initializeNDK() {

    //let events;
    try {
        console.log(52)
        nip07signer = await new NDKNip07Signer();
        console.log(54)
        ndk = new NDK({signer: nip07signer, explicitRelayUrls: ["wss://nostr.688.org", "wss://relay.damus.io"]});
        ndk.connect();
        // let filter: NDKFilter = {tags: [["#e", window.spaceman.rootevents.IgnitionEvent]]}
        // ndk.fetchEvents(filter).then((x) => {
        //     console.log(x)
        // });
        //console.log(events)
        // let sub= new NDKSubscription(ndk, filter)
        // sub.on()
        // sub.start()
        // sub.on()
        window.spaceman.ndk = ndk
        return ndk
    } catch (e) {
        console.log(e)
        return null
        // const nip07signer = null
    }
}

var calledGetPubkey: boolean = false
if (!calledGetPubkey) {
    calledGetPubkey = true
    getPubkey()
}

function getPubkey() {
    console.log(79)
    setTimeout(function(){
        if (!window.spaceman.pubkey) {
            initializeNDK().then(x=> {
                ndk = x
                nip07signer.user().then(y=>{
                    window.spaceman.pubkey = y.hexpubkey()
                    if (document.getElementById("pubkey")) {
                        document.getElementById("pubkey").innerText = y.npub.substring(0, 12)
                    }
                })
            })
        } else if (!window.spaceman.pubkey) {
            window.spaceman.pubkey = ""
            alert("You can look but you can't touch. Please install a NIP-07 nostr signing browser extension (such as GetAlby or Nos2x) if you want to interact with Nostrocket!")
        }
    },100)
}


// setTimeout(function(){
//     if (window.nostr) {
//         window.nostr.getPublicKey().then(x=>{
//             console.log("Current pubkey is: ", x);
//             window.spaceman.pubkey = x
//         })
//     } else {
//         window.spaceman.pubkey = ""
//         alert("You can look but you can't touch. Please install a NIP-07 nostr signing browser extension (such as GetAlby or Nos2x) if you want to interact with Nostrocket!")
//     }
// },100)

window.spaceman.Functions.fetchevent = (id) => {
    let filter = ""
    if (id) {
        filter = {ids: [[id]]}
    } else {
        filter = {"#e": window.spaceman.rootevents.IgnitionEvent}
        // {ids: [[window.spaceman.rootevents.ProblemRoot]]}
        //{kinds: [641800, 641802], "#e": window.spaceman.rootevents.IgnitionEvent};
    }

    let ndk_read = null
    if (ndk === null){
        ndk_read = new NDK({ explicitRelayUrls: ["wss://nostr.688.org", "wss://nos.lol"]});
        ndk_read.connect();

    } else {
        ndk_read = ndk;
    }
    ndk_read.fetchEvents(filter).then(e => {
        e.forEach(ei => {
            console.log(ei)
        }
        )
    })
}

window.spaceman.Functions.isValidated = (pubkey: string, type: string) :boolean => {
    if (window.spaceman.CurrentState.state && pubkey && type) {
        if (window.spaceman.CurrentState.state.identity) {
            if (window.spaceman.CurrentState.state.identity[pubkey]) {
                switch (type) {
                    case "ush":
                        if (window.spaceman.CurrentState.state.identity[pubkey].UniqueSovereignBy) {
                            if (window.spaceman.CurrentState.state.identity[pubkey].UniqueSovereignBy.length > 0) {
                                return true
                            }
                        }
                        break;
                    case "maintainer":
                        if (window.spaceman.CurrentState.state.identity[pubkey].MaintainerBy) {
                            if (window.spaceman.CurrentState.state.identity[pubkey].MaintainerBy.length > 0) {
                                return true
                            }
                        }
                        break;
                }
            }
        }
    }
    return false
}

window.spaceman.Functions.sendEvent = (e) => {
}

beginListeningForEvents()
document.getElementById("content").replaceChildren(loading())

