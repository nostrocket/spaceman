import {makeTextField, makeTextInput} from "../helpers/forms.js";
import {publish} from "../helpers/events.js";

import './problems.css'
import {spacer} from "../helpers/markdown.js";
import NDK, {NDKEvent, NDKNip07Signer} from "@nostr-dev-kit/ndk";
import {ndk,nip07signer} from "../../main.ts"
import {addReplayProtection} from "../helpers/tags.js";

// const nip07signer = new NDKNip07Signer();
// let ndk = new NDK({signer: nip07signer, explicitRelayUrls: ["wss://nostr.688.org"]});
// await ndk.connect();

const problemEventMap = new Map();

export function problems() {
    let div = document.createElement("div")
    div.id = "problems"
    let anc = createAnchor(window.spaceman.rootevents.ProblemRoot)

    //div.innerText = window.spaceman.rootevents.ProblemRoot
    //div.className = "problem"
    let filter = {kinds: [641800, 641802], "#e": window.spaceman.rootevents.IgnitionEvent};
    ndk.fetchEvents(filter).then(e => {
        e.forEach(ei => {
            if (!problemEventMap.has(ei.id)) {
                problemEventMap.set(ei.id, ei)
            }
        })
        let prob = createProblemDivFromAnchor(problemEventMap.get(window.spaceman.rootevents.ProblemRoot))
        anc.appendChild(prob)
        div.appendChild(anc)
        problemEventMap.forEach(e => {
            if (e.kind === 641800) {
                let parentAnchor = getTagContent(e, "reply", "e")
                if (document.getElementById(parentAnchor+"_children") && !document.getElementById(e.id+"_anchor")) {
                    //todo if parent doesn't exist in the DOM check in the map for it and create it then proceed
                    let anchorNode = createAnchor(e.id)
                    let problemContent = createProblemDivFromAnchor(e)
                    anchorNode.appendChild(problemContent)
                    document.getElementById(parentAnchor+"_children").append(anchorNode)
                }
            }
        })
        problemEventMap.forEach(e => {
            if (e.kind === 641802) {
                let anchor = getTagContent(e, "reply", "e")
                if (document.getElementById(anchor+"_problem") && !document.getElementById(e.id)) {
                    let d = createProblemContent(e)//createProblemDiv(problemMap.get(anchor), e)
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

function getTagContent(event, tagType, tagKey) {
    let tagContent = null
    event.tags.forEach(tag => {
        tag.forEach(tagInner => {
            if (tagInner === tagType) {
                if (tagKey) {
                    if (tag[0] === tagKey) {
                    tagContent = tag[1]
                }}
                if (!tagKey) {
                    tagContent = tag[1]
                }
            }
        })
    })
    return tagContent
}

function createProblemDivFromAnchor(e) {
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

            p.innerText = "Waiting for content"
            if (e.content.length > 0) {
                p.innerText = e.content;
            }
            p.innerText += "\n\n" + e.id


        p.className = "problem"
        c.className = "children_box"
        //p.appendChild()
        d.append(p, createInteractionsBox(e), c)
        return d
    }
    return null
}

function createProblemContent(e) {
    let p = document.createElement("div")
    p.id = e.id + "_problem"
        //p.id = contentEvent.id
        p.innerHTML = "<h3>" + getTagContent(e, "title"   ) + "</h3>"
        p.innerHTML += "<p>" + e.content + "</p>"
        p.innerHTML += e.id
    return p
}

function createInteractionsBox(e) {
    let d = document.createElement("div")
    d.className = "reply_problem"
    d.id = "replybutton_"+e.id
    d.appendChild(createLink("Log new sub-problem", () => {
        let p = createProblemDivFromAnchor(e)
        p.appendChild(newProblemForm(e.id))
        document.getElementById("problems").replaceChildren(p)
    }))
    d.appendChild(spacer("|"))
    d.appendChild(createLink("Read More", () => {
        console.log(getCurrentProblemStateFromAnchorID(e.id))
        document.getElementById("problems").replaceChildren(createProblemDetail(getCurrentProblemStateFromAnchorID(e.id)))
    }))
    return d
}

function getCurrentProblemStateFromAnchorID(id) {
    let events = []
    problemEventMap.forEach((e) => {
        if (e.kind === 641802) {
            let anchor = getTagContent(e, "reply")
            if (anchor === id) {
                events.push(e)
            }
        }
    })
    let sorted = events.sort((a, b) => {
        if (a.created_at < b.created_at) {
            return -1
        }
        if (a.created_at > b.created_at) {
            return 1
        }
        if (a.created_at === b.created_at) {
            return 0
        }
    })
    console.log("todo: verify that this sort order is correct")
    let title = ""
    let body = ""
    sorted.forEach((e) => {
        let t = getTagContent(e, "title")
        if (t) {
            title = t
        }
        if (e.content.length > 0) {
            body = e.content
        }
    })
    let fakeEvent = new NDKEvent(ndk);
    fakeEvent.content = body
    fakeEvent.tags = [["title", title]]
    fakeEvent.id = id
    return fakeEvent
}

function createProblemDetail(e) {
    console.log(e)
    problemEventMap.get()
    let p = createProblemContent(e)
    return p
}

function createLink(name, onclick, classname) {
    let b = document.createElement("a")
    if (name) {
        b.innerText = name
    }
    if (onclick) {
        b.onclick = onclick
    }
    b.className = "link"
    if (classname) {
        b.className = classname
    }
    return b
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
                    parentAnchor = document.getElementById('parent input').value;
                }
                if (parentAnchor && !currentAnchor) {
                    let anchorEvent = makeAnchorEvent(parentAnchor, document.getElementById('title input').value)
                    anchorEvent.publish().then(function () {
                        console.log(anchorEvent.rawEvent());
                        document.getElementById(parentAnchor+"_children").appendChild(createProblemDivFromAnchor(anchorEvent))
                        problemEventMap.set(anchorEvent.id, anchorEvent)
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
        document.getElementById(currentAnchor+"_problem").replaceChildren(createProblemDivFromAnchor(problemEventMap.get(currentAnchor)))
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
    ndkEvent.tags = addReplayProtection(ndkEvent.pubkey, ndkEvent.tags)
    return ndkEvent
}

function makeAnchorEvent(parentAnchor, content) {
    let ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 641800;
    ndkEvent.content = content
    ndkEvent.tags = [["e", window.spaceman.rootevents.IgnitionEvent, "", "root"]]
    if (parentAnchor) {
        if (parentAnchor.length === 64) {
            ndkEvent.tags.push(["e", parentAnchor, "", "reply"])
        }
    }
    ndkEvent.tags = addReplayProtection("", ndkEvent.tags)
    return ndkEvent
}