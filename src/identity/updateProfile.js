import {identities} from "../state/state.js";
import {makeUnsignedEvent, publish, signAsynchronously} from "../helpers/events.js";
import {makeH3, makeParagraph, spacer} from "../helpers/markdown.js";
import {makeTextField, makeTextInput} from "../helpers/forms.js";
import {makeTags} from "../helpers/tags.js";
import {waitForKind0Ready,getKind0Object,kind0Objects} from "./kind0.js";
export function updateAccountDetails() {
    let form = document.createElement("div")
    form.appendChild(usernameAndBioForm())
    form.appendChild(bioButtons(function () {
        if (document.getElementById( 'name input' ).valueOf().readOnly) {
            setBio( document.getElementById( 'name input' ).value, document.getElementById( 'about input' ).value )
            //location.reload()
        } else {
            validateUnique(document.getElementById( 'name input' ).value).then(res => {
                if (res) {
                    setBio( document.getElementById( 'name input' ).value, document.getElementById( 'about input' ).value )
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
        document.getElementById('name input').value = '';document.getElementById('about input').value = '';
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
function createUsernameAndBioForm(div,haveExistingKind0,username,about){

    div.appendChild(makeH3("Create or modify your Nostrocket profile"))
    div.appendChild(makeParagraph("* Nostrocket usernames **cannot** be changed once set for your Pubkey   \n* Nostrocket usernames **must** be unique   \n* Protocol: [Non-fungible Identity](superprotocolo://b66541b20c8a05260966393938e2af296c1a39ca5aba8e21bd86fcce2db72715)"))
    if (haveExistingKind0) {
        div.appendChild(makeParagraph("Submit this form to claim _**" + kind0Objects.get(window.spaceman.pubkey).name + "**_ now."))
    }
    div.appendChild(makeTextInput("Username", "Name or Pseudonym", "name input", 20, username))

    div.appendChild(makeTextField("About Me", "Introduce yourself to the community", "about input", 560, about))
    return div
}
function updateUsernameAndBioForm(div,haveExistingKind0,username,about){
    div.innerHTML = ""
    div.appendChild(makeH3("Create or modify your Nostrocket profile"))
    div.appendChild(makeParagraph("* Nostrocket usernames **cannot** be changed once set for your Pubkey   \n* Nostrocket usernames **must** be unique   \n* Protocol: [Non-fungible Identity](superprotocolo://b66541b20c8a05260966393938e2af296c1a39ca5aba8e21bd86fcce2db72715)"))
    if (haveExistingKind0) {
        div.appendChild(makeParagraph("Submit this form to claim _**" + kind0Objects.get(window.spaceman.pubkey).name + "**_ now."))
    }
    div.appendChild(makeTextInput("Username", "Name or Pseudonym", "name input", 20, username))

    div.appendChild(makeTextField("About Me", "Introduce yourself to the community", "about input", 560, about))
    return div
}
function usernameAndBioForm() {
    let div = document.createElement("div")
    let username = ""
    let about = ""
    let haveExistingIdentity = false
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
                if (kind0Objects.get(window.spaceman.pubkey).about.length > 0) {
                    about = kind0Objects.get(window.spaceman.pubkey).about
                    haveExistingKind0 = true
                }
                updateUsernameAndBioForm(div,haveExistingKind0,username,about)
            }
        })

    } else if (pubkeyId.length === 1){
        haveExistingIdentity = true
        about = pubkeyId[0].About
        username = pubkeyId[0].Name
    } else {
        alert("Error: multiple identities found for this pubkey.")
    }




    return createUsernameAndBioForm(div,false,username,about)
}



async function setBio(name, about) {
    if ((name.length > 0) || (about.length > 0)) {
        let content = JSON.stringify({name: name, about: about})
        let tags = makeTags(window.spaceman.pubkey, "identity")
        signAsynchronously(makeUnsignedEvent(content, tags, 640400, window.spaceman.pubkey)).then(signed => {
            publish(signed)
        })
    } else {
        console.log("username and bio can't both be empty")
    }
}