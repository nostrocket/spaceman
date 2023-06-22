import * as state from '../state/state.js'
import {makeTags} from "../helpers/tags.js";
import {makeUnsignedEvent, publish, signAsynchronously} from "../helpers/events.js";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {ndk} from "../../main.ts";
import './identity.css'
import {makeParagraph} from "../helpers/markdown.js";


export default function renderIdentityLayout() {
    state.waitForStateReady(()=>{
        let orderedIdentities = []

        state.identities().forEach(x => {
           orderedIdentities.push(x)
        })
        orderedIdentities.sort(compareOrder)
        orderedIdentities.forEach(i => {
            if (i.Name.length > 0) {
                if (i.UniqueSovereignBy === null || i.UniqueSovereignBy === '') {
                    document.getElementById("right-column").appendChild(makePerson(i));
                } else {
                    document.getElementById("left-column").appendChild(makePerson(i))
                }
            }
        })

        // const rootNode = state.identities().find(node => node.UniqueSovereignBy === '1Humanityrvhus5mFWRRzuJjtAbjk2qwww');
        // let USHIdentities = state.identities().filter(x => x.UniqueSovereignBy !== null && x.UniqueSovereignBy !== '')
        // document.getElementById("left-column").innerHTML = renderTree(USHIdentities, rootNode)

        // state.identities().forEach(i => {
        //
        //     const sovereignBy = i.UniqueSovereignBy;
        //     if (sovereignBy === null || sovereignBy === '' && i.Name.length > 0 ) {
        //         document.getElementById("right-column").appendChild(makePerson(i));
        //     }
        // })
    })
    return makeIdentityLayout()
}

function compareOrder(a, b) {
    return a.Order - b.Order;
}

function makeIdentityLayout(){
    let d = document.createElement("div")
    d.className = "columns-wrapper"
    let left = document.createElement("div")
    left.id = "left-column"
    d.appendChild(makeH3("Identity Tree"))
    let added = document.createElement("ul")
    added.id = "provedIdentities"
    left.appendChild(added)
    let right = document.createElement("div")
    right.id = "right-column"
    right.appendChild(makeH3("People waiting to be added"))
    let notAdded = document.createElement("ul")
    notAdded.id = "unprovedIdentities"
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
    let ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 640402
    ndkEvent.content = content
    ndkEvent.tags = tags
    await ndkEvent.publish()
}

function makePerson(identity) {
    let outer = document.createElement("div")
    let p = document.createElement("div")
    p.className = "person"
    p.id = identity.Name
    p.appendChild(makeH3(identity.Name + " [" + window.spaceman.nt.nip19.npubEncode(identity.Account).substring(0, 10) + "]"))

    let about = makeParagraph(identity.About)
    about.className = "about"
    p.appendChild(about)

    //p.appendChild(makeItem("Account", window.spaceman.nt.nip19.npubEncode(identity.Account).substring(0, 10)))
    let addedByAccount = ""
    if (window.spaceman.CurrentState.state.identity[identity.UniqueSovereignBy]) {
        addedByAccount = window.spaceman.CurrentState.state.identity[identity.UniqueSovereignBy].Name
    } else {
        addedByAccount =  identity.UniqueSovereignBy
    }
    if (addedByAccount) {
        let addedBy = makeItem("Added By", addedByAccount)
        addedBy.className = "added_by"
        p.appendChild(addedBy)
        let order = makeItem("Account Number", identity.Order)
        order.className = "order"
        p.appendChild(order)
    } else {
        if (identity.UniqueSovereignBy === null || identity.UniqueSovereignBy === ''){
            p.appendChild(createAddButton(identity))
        }
    }
    outer.appendChild(p)
    return outer
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
