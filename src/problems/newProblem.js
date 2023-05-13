import {makeTextField, makeTextInput} from "../helpers/forms.js";
import {publish} from "../helpers/events.js";
import NDK, {NDKEvent, NDKNip07Signer} from "@nostr-dev-kit/ndk";
import './problems.css'

const nip07signer = new NDKNip07Signer();
let ndk = new NDK({signer: nip07signer, explicitRelayUrls: ["wss://nostr.688.org"]});
await ndk.connect();

const problemMap = new Map();

export function problems() {
    let div = document.createElement("div")
    div.id = "problems"
    let anc = createAnchor(window.spaceman.rootevents.ProblemRoot)

    //div.innerText = window.spaceman.rootevents.ProblemRoot
    //div.className = "problem"
    let filter = {kinds: [641800, 641802], "#e": window.spaceman.rootevents.IgnitionEvent};
    ndk.fetchEvents(filter).then(e => {
        e.forEach(ei => {
            if (!problemMap.has(ei.id)) {
                problemMap.set(ei.id, ei)
            }
        })
        let prob = createProblemDiv(problemMap.get(window.spaceman.rootevents.ProblemRoot))
        anc.appendChild(prob)
        div.appendChild(anc)
        problemMap.forEach(e => {
            if (e.kind === 641800) {
                let parentAnchor = getTagContent(e, "reply")
                if (document.getElementById(parentAnchor+"_children") && !document.getElementById(e.id+"_anchor")) {
                    console.log(28)
                    //todo if parent doesn't exist in the DOM check in the map for it and create it then proceed
                    let anchorNode = createAnchor(e.id)
                    let problemContent = createProblemDiv(e)
                    anchorNode.appendChild(problemContent)
                    document.getElementById(parentAnchor+"_children").append(anchorNode)

                }
            }
        })
        problemMap.forEach(e => {
            if (e.kind === 641802) {
                console.log(e)
                let anchor = getTagContent(e, "reply")
                if (document.getElementById(anchor+"_problem") && !document.getElementById(e.id)) {
                    let d = createProblemDiv(problemMap.get(anchor), e)
                    document.getElementById(anchor+"_problem").replaceWith(d)

                }
            }
        })
        div.appendChild(createButton("Advanced", function () {
            div.replaceChildren(newProblemForm())
        }))
    })
    return div
}

function getTagContent(event, tagName) {
    let parentID = null
    event.tags.forEach(tag => {
        tag.forEach(tagInner => {
            if (tagInner === tagName) {
                parentID = tag[1]
            }
        })
    })
    return parentID
}

function createProblemDiv(e, contentEvent) {
    if (e) {
        let d = document.createElement("div")
        d.id = e.id+"_problem_box"
        let p = document.createElement("div")
        p.id = e.id + "_problem"
        let c = document.createElement("div")
        c.id = e.id + "_children"
        // let r = document.createElement("div")
        // r.id = r.id + "_reply"
        // r.appendChild(createReplyDiv(e))
        // p.appendChild(r)
        if (!contentEvent) {
            p.innerText = "Waiting for content"
            if (e.content.length > 0) {
                p.innerText = e.content;
            }
            p.innerText += "\n\n" + e.id
        }
        if (contentEvent) {
            //p.id = contentEvent.id
            p.innerHTML = "<h3>" + getTagContent(contentEvent, "title") + "</h3>"
            p.innerHTML += "<p>" + contentEvent.content + "</p>"
            p.innerHTML += e.id
        }
        p.className = "problem"
        c.className = "children_box"
        p.appendChild(createReplyDiv(e))
        d.append(p, c)
        return d
    }
    return null
}

function createReplyDiv(e) {
    let d = document.createElement("div")
    d.className = "reply_problem"
    d.id = "replybutton_"+e.id
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
    div.className = "anchor"
    div.id = id+"_anchor"
    return div
}


export function newProblemForm(parentAnchor, currentAnchor) {
    let div = document.createElement("div")
    div.appendChild(makeTextInput("Title", "Problem: summarize the problem you face or have observed in less than 100 characters", "title input", 100, ""))
    if (!parentAnchor) {
        div.appendChild(makeTextInput("Parent ID", "ID of the parent problem", "parent input", 64, ""))
    }
    div.appendChild(makeTextField("Problem Description", "Explain the problem in as much detail as necessary", "description input", 0, ""))
    div.appendChild(createButton("Publish!",
        function () {
            //create anchor event
            nip07signer.user().then(async (user) => {
                if (!parentAnchor) {
                    parentAnchor = document.getElementById('title input').value;
                }
                if (parentAnchor && !currentAnchor) {
                    let anchorEvent = createAnchorEvent(parentAnchor, document.getElementById('title input').value)
                    anchorEvent.publish().then(function () {
                        console.log(anchorEvent.rawEvent());
                        document.getElementById(parentAnchor).appendChild(createProblemDiv(anchorEvent))
                        problemMap.set(anchorEvent.id, anchorEvent)
                        currentAnchor = anchorEvent.id
                        send641802(currentAnchor, document.getElementById('title input').value, document.getElementById('description input').value)
                    })
                } else {

                }
                //create 641802


                //await ndkEvent.publish();
            });
        },
        "publish"
    ))
    return div
}

function send641802(currentAnchor, title, content) {
    let contentEvent = create641802(currentAnchor, title, content)
    contentEvent.publish().then(() => {
        console.log(contentEvent.rawEvent())
        document.getElementById(currentAnchor).replaceChildren(createProblemDiv(problemMap.get(currentAnchor)))
    })
}

function create641802(anchorID, title, content) {
    let ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 641802
    ndkEvent.content = content
    ndkEvent.tags = [
        ["e", window.spaceman.rootevents.IgnitionEvent, "", "root"],
        ["e", anchorID, "", "reply"],
        ["title", title]
    ]
    return ndkEvent
}

function createAnchorEvent(parentAnchor, content) {
    let ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 641800;
    ndkEvent.content = content
    ndkEvent.tags = [["e", window.spaceman.rootevents.IgnitionEvent, "", "root"],
        ["e", parentAnchor, "", "reply"]]
    return ndkEvent
}