import {makeTextField, makeTextInput} from "../helpers/forms.js";
import {publish} from "../helpers/events.js";
import NDK, { NDKNip07Signer, NDKEvent } from "@nostr-dev-kit/ndk";
import './problems.css'

const nip07signer = new NDKNip07Signer();
let ndk = new NDK({ signer: nip07signer, explicitRelayUrls: ["wss://nostr.688.org"] });
await ndk.connect();

const problemMap = new Map();

export function problems() {
    let div = createAnchor(window.missioncontrol.rootevents.ProblemRoot)
    div.innerText = window.missioncontrol.rootevents.ProblemRoot
    div.className = "problem"
    let filter = {kinds: [641800], "#e": window.missioncontrol.rootevents.IgnitionEvent };
    ndk.fetchEvents(filter).then(e => {e.forEach(ei => {
        // ei.tags.forEach(x => {
        //     x.forEach(y => {
        //         if (y === "reply") {
        //             console.log(x[1])
        //         }
        //     })
        // })
        if (!problemMap.has(ei.id)) {problemMap.set(ei.id, ei)}
    })
        problemMap.forEach(e => {
            console.log(e)
            e.tags.forEach(tag => {
                tag.forEach(tagInner => {
                    if (tagInner === "reply") {
                        if (document.getElementById(tag[1]) && !document.getElementById(e.id)) {
                            let d = createAnchor(e.id)
                            d.innerText = e.id
                            d.className = "problem"
                            document.getElementById(tag[1]).appendChild(d)
                        }
                    }
                })
            })
        })
        div.appendChild(newProblemForm())
    })
    return div
}

function createAnchor(id) {
    let div = document.createElement("div")
    div.id = id
    return div
}


export function newProblemForm() {
    let div = document.createElement("div")
    div.appendChild(makeTextInput("Title", "Problem: summarize the problem you face or have observed in less than 100 characters", "title input", 100, ""))
    div.appendChild(makeTextInput("Parent ID", "ID of the parent problem", "parent input", 64, ""))
    div.appendChild(makeTextField("Problem Description", "Explain the problem in as much detail as necessary", "description input", 0, ""))
    let b = document.createElement("button")
    b.innerText = "Publish!"
    b.onclick = function () {
        //create anchor event
        nip07signer.user().then(async (user) => {
            const ndkEvent = new NDKEvent(ndk);
            ndkEvent.kind = 641800;
            ndkEvent.content = document.getElementById( 'title input' ).value;
            ndkEvent.tags = [["e", window.missioncontrol.rootevents.IgnitionEvent, "", "root"],
                ["e", document.getElementById( 'parent input' ).value, "", "reply"]]
            //ndkEvent.sign().then(function (){console.log(ndkEvent.rawEvent())})
            ndkEvent.publish().then(function (){console.log(ndkEvent.rawEvent())})
            //await ndkEvent.publish();
        });
        //create 641802
    }
    div.appendChild(b)
    return div
}