import "@fontsource/ubuntu"
import './style.css'
import renderIdentities from './src/identity/identity.js'

import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import {newMirv} from "./src/mirvs/newMirv.js";
import {updateAccountDetails} from "./src/identity/updateProfile.js";
import {createProblemsFromState} from "./src/problems/problemsFromState.js"
import NDK, {NDKEvent, NDKNip07Signer, NDKFilter, NDKSubscription} from "@nostr-dev-kit/ndk";
import * as nt from 'nostr-tools';
import {generateKeyPair} from "crypto";
import {beginListeningForEvents} from "./src/helpers/events";
console.log(14)
declare global {
    interface Window { spaceman: any; }
}
export {};

beginListeningForEvents()

window.spaceman = {}

window.spaceman.Functions = {}
window.spaceman.Functions.problemsFromState = createProblemsFromState
window.spaceman.renderIdentity = renderIdentities
window.spaceman.newMirv = newMirv
window.spaceman.updateAccountDetails = updateAccountDetails


window.spaceman.rootevents = {}
window.spaceman.rootevents.IdentityRoot = "0a73208becd0b1a9d294e6caef14352047ab44b848930e6979937fe09effaf71"
window.spaceman.rootevents.SharesRoot = "7fd9810bdb8bc635633cc4e3d0888e395420aedc7d28778c100793d1d3bc09a6"
window.spaceman.rootevents.MirvsRoot = "c7f87218e62f6d41fa2f5b2480210ed1d48b2609e03e9b4b500a3b64e3c08554"
window.spaceman.rootevents.IgnitionEvent = "fd459ea06157e30cfb87f7062ee3014bc143ecda072dd92ee6ea4315a6d2df1c"
window.spaceman.rootevents.ReplayRoot = "24c30ad7f036ed49379b5d1209836d1ff6795adb34da2d3e4cabc47dc9dfef21"
window.spaceman.rootevents.ProblemRoot = "7227dabb075105b1af089d49f20896ce8809f386b9263aa78224e00b630c9622"


window.spaceman.CurrentState = {}
window.spaceman.CurrentState.ready = false
window.spaceman.nt = nt


export var ndk : NDK|null = null 
export var nip07signer :  NDKNip07Signer | null= null
async function initializeNDK() {

    //let events;
    try {
        nip07signer = await new NDKNip07Signer();
        ndk = new NDK({signer: nip07signer, explicitRelayUrls: ["wss://nostr.688.org"]});
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
        filter = {"#e": "3fd2242a22d2c84c02196013ffa62c37ef7edeea421ba09e79c199b8d3a9fd55"}
        // {ids: [[window.spaceman.rootevents.ProblemRoot]]}
        //{kinds: [641800, 641802], "#e": window.spaceman.rootevents.IgnitionEvent};
    }

    let ndk_read = null
    if (ndk === null){
        ndk_read = new NDK({ explicitRelayUrls: ["wss://nostr.688.org"]});
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