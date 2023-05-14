import './style.css'
import renderIdentities from './src/identity/identity.js'

import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import {newMirv} from "./src/mirvs/newMirv.js";
import {updateAccountDetails} from "./src/identity/updateProfile.js";
import {problems} from "./src/problems/newProblem.js";
import NDK, {NDKEvent, NDKNip07Signer} from "@nostr-dev-kit/ndk";
import { nip10 } from 'nostr-tools';

declare global {
    interface Window { spaceman: any; }
}
export {};

window.spaceman = {}
window.spaceman.renderIdentity = renderIdentities
window.spaceman.newMirv = newMirv
window.spaceman.updateAccountDetails = updateAccountDetails
window.spaceman.displayProblems = problems

window.spaceman.rootevents = {}
window.spaceman.rootevents.IdentityRoot = "0a73208becd0b1a9d294e6caef14352047ab44b848930e6979937fe09effaf71"
window.spaceman.rootevents.SharesRoot = "7fd9810bdb8bc635633cc4e3d0888e395420aedc7d28778c100793d1d3bc09a6"
window.spaceman.rootevents.MirvsRoot = "c7f87218e62f6d41fa2f5b2480210ed1d48b2609e03e9b4b500a3b64e3c08554"
window.spaceman.rootevents.IgnitionEvent = "fd459ea06157e30cfb87f7062ee3014bc143ecda072dd92ee6ea4315a6d2df1c"
window.spaceman.rootevents.ReplayRoot = "24c30ad7f036ed49379b5d1209836d1ff6795adb34da2d3e4cabc47dc9dfef21"
window.spaceman.rootevents.ProblemRoot = "77c3bf5382b62d16a70df8e2932a512e2fce72458ee47b73feaef8ae8b9bd62b"



export var ndk : NDK|null = null 
export var nip07signer :  NDKNip07Signer | null= null
async function initializeNDK() {
    
    try{
        nip07signer = await new NDKNip07Signer();
        ndk = new NDK({signer: nip07signer, explicitRelayUrls: ["wss://nostr.688.org"]});
        ndk.connect();
        return ndk
    } catch (e) {
        console.log(e)
        return null
        // const nip07signer = null
    }
}


setTimeout(function(){
    if (window.nostr) {
        initializeNDK().then(x=>{ndk=x}) 
    } else {
        window.spaceman.pubkey = ""
        alert("You can look but you can't touch. Please install a NIP-07 nostr signing browser extension (such as GetAlby or Nos2x) if you want to interact with Nostrocket!")
    }
},100)
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