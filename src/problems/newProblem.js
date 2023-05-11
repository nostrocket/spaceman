import {makeTextField, makeTextInput} from "../helpers/forms.js";
import {publish} from "../helpers/events.js";
import NDK, { NDKNip07Signer, NDKEvent } from "@nostr-dev-kit/ndk";
import './problems.css'

const nip07signer = new NDKNip07Signer();
let ndk = new NDK({ signer: nip07signer, explicitRelayUrls: ["wss://nostr.688.org"] });
await ndk.connect();

const problemMap = new Map();

export function problems() {
    let div = createAnchor("problems")
    //div.innerText = window.spaceman.rootevents.ProblemRoot
    //div.className = "problem"
    let filter = {kinds: [641800], "#e": window.spaceman.rootevents.IgnitionEvent };
    ndk.fetchEvents(filter).then(e => {e.forEach(ei => {
        if (!problemMap.has(ei.id)) {problemMap.set(ei.id, ei)}
    })
        div.appendChild(createProblemDiv(problemMap.get(window.spaceman.rootevents.ProblemRoot)))
        problemMap.forEach(e => {
            console.log(e)
            e.tags.forEach(tag => {
                tag.forEach(tagInner => {
                    if (tagInner === "reply") {
                        if (document.getElementById(tag[1]) && !document.getElementById(e.id)) {
                            let d = createProblemDiv(e)
                            d.appendChild(createReplyDiv(e))
                            document.getElementById(tag[1]).appendChild(d)
                        }
                    }
                })
            })
        })
        div.appendChild(createButton("Advanced", function () {
            div.replaceChildren(newProblemForm())
        }))
    })
    return div
}

function createProblemDiv(e) {
    let d = createAnchor(e.id)
    d.innerText = "Waiting for content"
    if (e.content.length > 0) {
        d.innerText = e.content;
    }
    d.innerText += "\n\n"+e.id
    d.className = "problem"
    return d
}

function createReplyDiv(e) {
    let d = document.createElement("div")
    d.className = "reply_problem"
    d.appendChild(createButton("Log new problem", function () {
        let p = createProblemDiv(e)
        p.appendChild(newProblemForm(e.id))
        document.getElementById("problems").replaceChildren(p)
    }))
    return d
}

function createButton(name, onclick, classname) {
    let b = document.createElement("button")
    if (name) {
        b.innerText = name
    }
    if (onclick) {
        b.onclick = onclick
    }
    if (classname) {
        b.className = classname
    }
    return b
}

function createAnchor(id) {
    let div = document.createElement("div")
    div.id = id
    return div
}


export function newProblemForm(parent) {
    let div = document.createElement("div")
    div.appendChild(makeTextInput("Title", "Problem: summarize the problem you face or have observed in less than 100 characters", "title input", 100, ""))
    if (!parent) {
        div.appendChild(makeTextInput("Parent ID", "ID of the parent problem", "parent input", 64, ""))
    }
    div.appendChild(makeTextField("Problem Description", "Explain the problem in as much detail as necessary", "description input", 0, ""))
    div.appendChild(createButton("Publish!",
        function () {
        //create anchor event
        nip07signer.user().then(async (user) => {
            if (!parent) {
                parent = document.getElementById( 'title input' ).value;
            }
            const ndkEvent = new NDKEvent(ndk);
            ndkEvent.kind = 641800;
            ndkEvent.content = document.getElementById( 'title input' ).value;
            ndkEvent.tags = [["e", window.spaceman.rootevents.IgnitionEvent, "", "root"],
                ["e", parent, "", "reply"]]
            //ndkEvent.sign().then(function (){console.log(ndkEvent.rawEvent())})
            ndkEvent.publish().then(function (){
                console.log(ndkEvent.rawEvent());
                document.getElementById(parent).appendChild(createProblemDiv(ndkEvent))
            })
            //await ndkEvent.publish();
        });
        //create 641802
    },
        "publish"
    ))
    return div
}