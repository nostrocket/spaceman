import {identities} from "../state/state.js";
import {makeUnsignedEvent, publish, signAsynchronously} from "../helpers/events.js";
import {makeH3, makeLink, makeParagraph, spacer} from "../helpers/markdown.js";
import {makeTextField, makeTextInput} from "../helpers/forms.js";
import {makeTags} from "../helpers/tags.js";
import {waitForKind0Ready,getKind0Object,kind0Objects} from "./kind0.js";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {ndk} from "../../main.ts";


export function updateAccountDetails() {
    let form = document.createElement("div")
    form.appendChild(usernameAndBioForm())
    form.appendChild(bioButtons(function () {
        if (document.getElementById( 'name input' ).valueOf().readOnly) {
            setBio( document.getElementById( 'name input' ).value)
            //location.reload()
        } else {
            validateUnique(document.getElementById( 'name input' ).value).then(res => {
                if (res) {
                    setBio( document.getElementById( 'name input' ).value)
                    //location.reload()
                } else {
                    alert(document.getElementById( 'name input' ).value + " has been taken, please try another username")
                }
            })
        }

    }))
    return form
}

async function validateUnique(name) {
    let p = new Promise((resolve, reject) => {
        identities().forEach(function (v) {
            if (v.Name === name) {
                resolve(false)
            }
        })
        resolve(true)
    })
    return p
}

function bioButtons(onclick) {
    let submit = document.createElement("button")
    submit.onclick = onclick
    submit.className = "button is-link"
    submit.innerText = "Submit"
    let cancel = document.createElement("button")
    cancel.onclick = function () {
        document.getElementById('name input').value = '';
    }
    cancel.className = "button is-link is-light"
    cancel.innerText = "Clear"

    let buttons = document.createElement("div")
    buttons.className = "field is-grouped"

    let control = document.createElement("div")
    control.className = "control"

    control.appendChild(submit)
    control.appendChild(spacer())
    control.appendChild(spacer())
    control.appendChild(cancel)
    buttons.appendChild(control)
    return buttons
}
function createUsernameAndBioForm(haveExistingKind0,username){
    let div = document.createElement("div")
    div.id = window.spaceman.pubkey
    div.appendChild(makeH3("Create or modify your Nostrocket Permanym"))
    div.appendChild(makeParagraph("* The first step to joining the Identity Tree is to set your Permanym   " +
        "\n* You SHOULD use your existing Nostr pubkey so that existing Nostrocketers can see that you're not a spammer or bad actor   " +
        "\n* Nostrocket permanyms **cannot** be changed once set for your Pubkey   " +
        "\n* Nostrocket permanyms **must** be unique   " +
        "\n* Nostrocket will display your latest Nostr `Kind 0` data, but your Identity Tree permanym will be never change once it is set   " +
        "\n* Protocol: [Non-fungible Identity](superprotocolo://b66541b20c8a05260966393938e2af296c1a39ca5aba8e21bd86fcce2db72715)"))
    if (haveExistingKind0) {
        div.appendChild(makeParagraph("### Found a Kind 0 event for your pubkey: \nSubmit this form to claim *" + kind0Objects.get(window.spaceman.pubkey).name + "* now."))
    }
    div.appendChild(makeTextInput("Permanym", "Permanym", "name input", 20, username))
    div.appendChild(paidRelayNotice())
    return div
}

function paidRelayNotice() {
    let div = document.createElement("div")
    div.className = "notice"
    div.appendChild(makeParagraph("You MUST be a member of the Nostrocket paid relay `wss://nostr.688.org` to publish events here.   " +
        "\nThis is to prevent spam, and one day it might be enough sats to pay for relay upkeep.   " +
        "\nThe fee is currently 1000 sats for 2016 blocks."))
    div.appendChild(makeLink("https://nostr.688.org/join", "Click here to join the relay now"))
    div.appendChild(makeParagraph("Note: it's a bit buggy. After you pay the invoice, you need to send some events to the relay to trigger it to check for the payment. The easiest way to do this is add `wss://nostr.688.org` to one of your clients and rebroadcast some events."))
    return div
}

// function updateUsernameAndBioForm(div,haveExistingKind0,username,about){
//     div.innerHTML = ""
//     div.appendChild(makeH3("Create or modify your Nostrocket profile"))
//     div.appendChild(makeParagraph("* Nostrocket usernames **cannot** be changed once set for your Pubkey   \n* Nostrocket usernames **must** be unique   \n* Protocol: [Non-fungible Identity](superprotocolo://b66541b20c8a05260966393938e2af296c1a39ca5aba8e21bd86fcce2db72715)"))
//     if (haveExistingKind0) {
//         div.appendChild(makeParagraph("Submit this form to claim _**" + kind0Objects.get(window.spaceman.pubkey).name + "**_ now."))
//     }
//     div.appendChild(makeTextInput("Username", "Name or Pseudonym", "name input", 20, username))
//
//     div.appendChild(makeTextField("About Me", "Introduce yourself to the community", "about input", 560, about))
//     return div
// }
function usernameAndBioForm() {
    let username = ""
    let haveExistingKind0 = false
    let pubkeyId = identities().filter(item => item.Account === window.spaceman.pubkey)
    if (pubkeyId.length === 0) {
        // no existing identity, try to get kind0 from other relays
        getKind0Object(window.spaceman.pubkey,["wss://relay.damus.io"])
        waitForKind0Ready(function(){
            if (kind0Objects.get(window.spaceman.pubkey) !== undefined) {
                if (kind0Objects.get(window.spaceman.pubkey).name.length > 0) {
                    username = kind0Objects.get(window.spaceman.pubkey).name
                    haveExistingKind0 = true
                }
                // if (kind0Objects.get(window.spaceman.pubkey).about) {
                //     if (kind0Objects.get(window.spaceman.pubkey).about.length > 0) {
                //         about = kind0Objects.get(window.spaceman.pubkey).about
                //         haveExistingKind0 = true
                //     }
                // }

                document.getElementById(window.spaceman.pubkey).replaceChildren(createUsernameAndBioForm(haveExistingKind0,username))
            }
        })

    } else if (pubkeyId.length === 1){
        username = pubkeyId[0].Name
    } else {
        alert("Error: multiple identities found for this pubkey.")
    }
    return createUsernameAndBioForm(haveExistingKind0,username)
}



async function setBio(name) {
    if (name.length > 0) {
        let content = "I'm requesting to join the Nostrocket Identity Tree and claiming my permanym: " + name
        let tags = makeTags(window.spaceman.pubkey, "identity")
        let ndkEvent = new NDKEvent(ndk);
        ndkEvent.kind = 1
        ndkEvent.content = content
        tags.push(["op", "nostrocket.identity.permanym", name])
        ndkEvent.tags = tags
        await ndkEvent.publish().catch(x => {
            console.log(x)
        })
        console.log(ndkEvent.rawEvent())
    } else {
        console.log("permanym can't be empty")
    }
}