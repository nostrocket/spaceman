import * as state from '../state/state.js'
import {makeTags} from "../helpers/tags.js";
import {makeUnsignedEvent, publish, signAsynchronously} from "../helpers/events.js";




export default function renderIdentityLayout() {
    state.waitForStateReady(()=>{
        // if (storedPubkey === "" || !storedPubkey) {
        //     window.nostr.getPublicKey().then(x=>{
        //         storedPubkey = x
        //     })
        // }

        const rootNode = state.identities().find(node => node.UniqueSovereignBy === '1Humanityrvhus5mFWRRzuJjtAbjk2qwww');
        let USHIdentities = state.identities().filter(x => x.UniqueSovereignBy !== null && x.UniqueSovereignBy !== '')
        document.getElementById("left-column").innerHTML = renderTree(USHIdentities, rootNode)

        state.identities().forEach(i => {

            const sovereignBy = i.UniqueSovereignBy;
            if (sovereignBy === null || sovereignBy === '' && i.Name.length > 0 ) {
                document.getElementById("right-column").appendChild(makePerson(i));
            }
        })
    })
    return makeIdentityLayout()
}

function makeIdentityLayout(){
    let d = document.createElement("div")
    d.className = "columns-wrapper"
    let left = document.createElement("div")
    left.id = "left-column"
    left.innerHTML = '<h2>Identity Tree</h2>\
    <ul id="provedIdentities"></ul>'
    let right = document.createElement("div")
    right.id = "right-column"
    right.innerHTML = '<h2>Accounts waiting to be added</h2>\
    <ul id="unprovedIdentities"></ul>'
    d.appendChild(left)
    d.appendChild(right)
    return d
}

function createAddButton(identity,onclick) {
    // Create a button element
    const button = document.createElement("button");
    button.id = identity.Account+'_button'
    // Set some properties for the button
    button.textContent = "Add to Identity Tree";

    // Add an event listener to the button
    button.onclick = function () {
        if (state.pubkeyInIdentity(window.spaceman.pubkey)) {
            const USH = state.identities().find(x => x.Account === window.spaceman.pubkey).UniqueSovereignBy
            if (USH != null && USH !== '') {
                addToIdentityTree(identity.Account)
            } else {
                alert("You need to be at Identity Tree first to add others identity.")
            }
        } else {
            alert("You need to be at Identity Tree first to add others identity.")
        }

    }

    // Return the button object
    return button;
}

async function addToIdentityTree(account) {
    console.log(account)
    let content;
    content = JSON.stringify({target: account, maintainer: false, ush: true, character: false})
    let tags;
    tags = makeTags(window.spaceman.pubkey, "identity")
    let unsigned = makeUnsignedEvent(content, tags, 640402, window.spaceman.pubkey)
    signAsynchronously(unsigned).then(signed => {
        console.log(signed)
        publish(signed)
    })
}

function makePerson(identity) {
    let p = document.createElement("div")
    p.id = identity.Name
    p.appendChild(makeH3(identity.Name))
    p.appendChild(makeItem("About", identity.About))
    p.appendChild(makeItem("Account", identity.Account))
    p.appendChild(makeItem("Added By", identity.UniqueSovereignBy))
    p.appendChild(makeItem("Order", identity.Order))
    if (identity.UniqueSovereignBy === null || identity.UniqueSovereignBy === ''){
        p.appendChild(createAddButton(identity))
    }
    return p
}

function makeItem(key, value) {
    let d = document.createElement("div")
    d.appendChild(makeText(key + ": "))
    d.appendChild(makeText(value))
    return d
}

function makeText(text) {
    let s = document.createElement("span")
    s.innerText = text
    return s
}

function makeH3(title) {
    let h3;
    h3 = document.createElement("h3")
    h3.className = "is-3"
    h3.innerText = title
    return h3
}

function renderTree(data, root) {
    let result = '';
    if (root) {
        result += `<ul><li>${makePerson(root).innerHTML}`;
        const children = data.filter(child => child.UniqueSovereignBy === root.Account);
        if (children.length > 0) {
            result += '<ul>';
            children.forEach(child => {
                result += renderTree(data, child);
            });
            result += '</ul>';
        }
        result += '</li></ul>';
    }
    return result;
}
