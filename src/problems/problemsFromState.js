import {waitForStateReady} from "../state/state.js";
import './problems.css'
import {createButton, makeH3, makeItem, makeLinkWithOnclick, makeParagraph, spacer} from "../helpers/markdown.js";
import {makeTextField, makeTextInput} from "../helpers/forms.js";
import {ndk, nip07signer} from "../../main.ts";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {addReplayProtection} from "../helpers/tags.js";
import {beginListeningForComments, createElementAllComments} from "./comments.js";
import {enmapReply} from "./events.js";

export function createProblemsFromState() {
    let div = document.createElement("div")
    div.id = "problems"
    div.appendChild(createElementProblemPreview(window.spaceman.rootevents.ProblemRoot))
    waitForStateReady(()=>{
        let ids = []
        Object.keys(window.spaceman.CurrentState.state.problems).forEach(problem => {
            ids.push(problem)
            recursiveRenderProblemPreview(problem)
        })
        beginListeningForComments(ids)
    })
    return div
}

function recursiveRenderProblemPreview(problem) {
        let thisProblem = window.spaceman.CurrentState.state.problems[problem]
        if (thisProblem) {
            let parentNode = document.getElementById(thisProblem.Parent+"_children")
            let thisNode = document.getElementById(problem+"_problem_box")
            if (thisNode) {
                return
            }
            if (parentNode && !thisNode) {
                parentNode.appendChild(createElementProblemPreview(problem))
                return true
            }
            if (!parentNode) {
                recursiveRenderProblemPreview(window.spaceman.CurrentState.state.problems[problem].Parent)
            }
            recursiveRenderProblemPreview(problem)
        }
}

function createElementProblemPreview(problemID) {
    return createElementProblemAnchor(window.spaceman.CurrentState.state.problems[problemID], true)
}

function createElementProblemFullView(problemID) {
    return createElementProblemAnchor(window.spaceman.CurrentState.state.problems[problemID], false)
}

function createElementProblemAnchor(problem, preview) {
    if (problem) {
        let d = document.createElement("div")
        d.id = problem.UID+"_problem_box"
        d.className = "problem_box"
        if (problem.Closed) {
            d.className += " closed"
        }
        if (problem.ClaimedBy && !problem.Closed) {
            d.className += " claimed"
        }
        if (
            !hasOpenChildren(problem.UID)
            && !problem.ClaimedBy
            && !problem.Closed
        ) {
            d.className += " available"
        }
        let p = document.createElement("div")
        p.id = problem.UID + "_problem"
        p.appendChild(makeH3(problem.Title))
        let bod = document.createElement("div")
        if (preview) {
            if (!problem.Closed) {
                bod = makeParagraph(problem.Body.substring(0, 280) + "...")
            }

            let readMore = makeLinkWithOnclick("read more...", ()=>{
                let div = document.getElementById("problems")
                if (div) {
                    div.replaceChildren(createElementProblemFullView(problem.UID))
                }
            })
            bod.appendChild(readMore)
            p.appendChild(bod)
        } else {
            p.appendChild(makeParagraph(problem.Body))
        }
        let problemIsClosedAndThisIsAPreview = (preview && problem.Closed)
        if (window.spaceman.CurrentState.state.identity[problem.CreatedBy] && !problemIsClosedAndThisIsAPreview) {
            p.appendChild(makeParagraph("Logged by: " + "[" + window.spaceman.CurrentState.state.identity[problem.CreatedBy].Name + "](" + "https://snort.social/p/"+problem.CreatedBy+")"))
        }
        if (window.spaceman.CurrentState.state.identity[problem.ClaimedBy] && !problemIsClosedAndThisIsAPreview) {
            let claimedBy = makeItem("Currently being worked on by", window.spaceman.CurrentState.state.identity[problem.ClaimedBy].Name)
            p.appendChild(claimedBy)
        }
        let c = document.createElement("div")
        c.id = problem.UID + "_children"
        p.className = "problem"
        c.className = "children_box"
        let actionBox = document.createElement("div")
        actionBox.className = actionBox
        actionBox.id = problem.UID+"_action_box"
        if (!preview) {
            p.appendChild(makeParagraph("ID: " + problem.UID))
            //p.innerHTML += "<div class='id'>"+problem.UID+"</div>"

            //EDIT
            actionBox.appendChild(makeLinkWithOnclick("edit", ()=>{
                if (!window.spaceman.Functions.isValidated(window.spaceman.pubkey, "maintainer") && (window.spaceman.pubkey !== problem.CreatedBy)) {
                    alert("You must be the problem's author or a project maintainer to edit this problem")
                }
                if (!document.getElementById(problem.UID + "_edit")) {
                    let div = document.createElement("div")
                    div.className = "problem_form"
                    div.innerText = "EDIT THIS PROBLEM"
                    let form = makeProblemForm(problem.Parent, problem.UID)
                    form.id = problem.UID + "_edit"
                    div.appendChild(form)
                    d.appendChild(div)
                }
            }))
            actionBox.appendChild(spacer("|"))

            //CLAIM
            if (problem.ClaimedBy === "" && !problem.Closed) {
                actionBox.appendChild(makeLinkWithOnclick("claim", ()=>{
                    if (!window.spaceman.Functions.isValidated(window.spaceman.pubkey, "ush")) {
                        alert("You must be in the identity tree to claim a problem")
                    } else {
                        if (!problem.Closed && problem.ClaimedBy === "") {
                                if (hasOpenChildren(problem.UID)) {
                                    alert("this problem has open children, it cannot be claimed")
                                    return
                                }
                            let e = create641804(problem.UID, "claim")
                            e.tags = addReplayProtection("", e.tags)
                            e.publish()
                            console.log(e)
                        }
                    }
                }))
                actionBox.appendChild(spacer("|"))
            }

            //DEPOSE
            if (
                problem.ClaimedBy
                && window.spaceman.Functions.isValidated(window.spaceman.pubkey, "maintainer")
                && problem.ClaimedBy !== window.spaceman.pubkey
            ) {
                actionBox.append(makeLinkWithOnclick("force unclaim", ()=>{
                    sendMetadataUpdate(problem.UID, "abandon")
                }), spacer("|"))
            }


            //ABANDON
            if (problem.ClaimedBy === window.spaceman.pubkey) {
                actionBox.appendChild(makeLinkWithOnclick("abandon", ()=>{
                    sendMetadataUpdate(problem.UID, "abandon")
                }))
                actionBox.appendChild(spacer("|"))
            }

            //CLOSE
            if (!problem.Closed) {
                actionBox.appendChild(
                    makeLinkWithOnclick("close", ()=>{
                        if (hasOpenChildren(problem.UID)) {
                            alert("this problem has open children, it cannot be closed")
                            return
                        }
                        if (
                            problem.CreatedBy !== window.spaceman.pubkey
                            && !window.spaceman.Functions.isValidated(window.spaceman.pubkey, "maintainer")
                        ) {
                            alert("you must be the problem's creator or a maintainer to close it")
                            return
                        }
                        sendMetadataUpdate(problem.UID, "close")
                    })
                )
                actionBox.appendChild(spacer("|"))
            }

            //OPEN
            if (problem.Closed) {
                actionBox.appendChild(
                    makeLinkWithOnclick("re-open", ()=>{
                        sendMetadataUpdate(problem.UID, "open")
                    })
                )
                actionBox.appendChild(spacer("|"))
            }

            //COMMENT
            actionBox.appendChild(makeLinkWithOnclick("comment", ()=>{
                if (!document.getElementById(problem.UID + "_comment")) {
                    let div = document.createElement("div")
                    div.className = "comment_form"
                    div.innerText = "COMMENT"
                    let form = makeCommentForm(problem.UID)//makeProblemForm(problem.Parent, problem.UID)
                    form.id = problem.UID + "_comment"
                    div.appendChild(form)
                    d.appendChild(div)
                }
            }))
            actionBox.appendChild(spacer("|"))

            //CREATE SUB-PROBLEM
            if (!problem.Closed && !problem.ClaimedBy) {
                actionBox.appendChild(makeLinkWithOnclick("create sub-problem", ()=>{
                    if (!window.spaceman.Functions.isValidated(window.spaceman.pubkey, "ush")) {
                        alert("Hello there, you filthy pleb. We have standards here! You must be in the identity tree to log new problems.")
                    }
                    if (!document.getElementById(problem.UID + "_create_sub_problem")) {
                        let div = document.createElement("div")
                        div.className = "problem_form"
                        div.innerText = "CREATE A NEW PROBLEM NESTED UNDER THIS ONE"
                        let form = makeProblemForm(problem.UID)
                        form.id = problem.UID + "_create_sub_problem"
                        div.appendChild(form)
                        d.appendChild(div)
                    } else {
                        console.log("form appears to exist in DOM already")
                    }
                }))
                actionBox.appendChild(spacer("|"))
            }

            //PRINT TO CONSOLE
            actionBox.appendChild(makeLinkWithOnclick("print", ()=>{
                console.log(problem)
            }))
            //actionBox.append(edit, spacer("|"), claim, spacer("|"), close, spacer("|"), comment, spacer("|"), newProblem, spacer("|"), printToConsole)
        }
        d.append(p, actionBox, c)
        if (!preview) {
            upsertCommentDiv(d, problem.UID)
        }
        return d
    }
    return null
}

function upsertCommentDiv(parentDiv, problemID) {
    let commentDiv = document.getElementById(problemID+"_comments")
    if (!commentDiv) {
        parentDiv.appendChild(createElementAllComments(problemID))
    } else {
        commentDiv.remove()
        parentDiv.appendChild(createElementAllComments(problemID))
    }
}

function makeCommentForm(problemID, commentID) {
    let box = document.createElement("div")
    box.className = "comment_box"
    box.appendChild(makeTextField("Your Comment", "", "comment input", 0, "Markdown **is** supported."))
    box.appendChild(createButton("Submit", () => {
        if (document.getElementById("comment input").value) {
            let ndkEvent = new NDKEvent(ndk);
            ndkEvent.kind = 1
            ndkEvent.content = document.getElementById("comment input").value
            ndkEvent.tags = []
            if (commentID) {
                ndkEvent.tags.push(["e", commentID, "", "reply"], ["e", problemID, "", "root"])
            } else {
                ndkEvent.tags.push(["e", problemID, "", "reply"])
            }
            ndkEvent.publish().then(() => {
                console.log(ndkEvent.rawEvent())
                box.remove()
                enmapReply(ndkEvent.rawEvent())
                upsertCommentDiv(document.getElementById(problemID+"_problem_box"), problemID)
            })
        }

        console.log(document.getElementById("comment input").value)
        console.log(problemID)
    }, "submit"))
    return box
}

function hasOpenChildren(UID) {
    for (let val in window.spaceman.CurrentState.state.problems) {
        if (window.spaceman.CurrentState.state.problems[val].Parent === UID && !window.spaceman.CurrentState.state.problems[val].Closed) {
            return true
        }
    }
    return false
}

function sendMetadataUpdate(UID, operation) {
    let e;
    switch (operation) {
        case "abandon":
            e = create641804(UID, "abandon")
            break;
        case "close":
            e = create641804(UID, "close")
            break;
        case "open":
            e = create641804(UID, "open")
            break;
    }
    e.tags = addReplayProtection("", e.tags)
    e.publish()
    console.log(e)
}

const defaultProblemTitle = "Problem: describe the problem you face or have observed in less than 100 characters"

const defaultProblemDescription = "" +
    "Explain the problem as clearly as possible. Markdown **is supported**.\n\n" +
    "#### Solution: If you have an idea of what the solution might be, include it."

function makeProblemForm(parentAnchor, currentAnchor) {
    let div = document.createElement("div")
    let prefilledProblemTitle = defaultProblemTitle;
    let prefilledProblemBody = defaultProblemDescription;
    if (currentAnchor) {
        let currentProblem = window.spaceman.CurrentState.state.problems[currentAnchor]
        if (currentProblem) {
            prefilledProblemTitle = currentProblem.Title
            prefilledProblemBody = currentProblem.Body
        }
    }
    div.appendChild(makeTextInput("Title", "Problem: summarize the problem you face or have observed in less than 100 characters", "title input", 100, prefilledProblemTitle))
    if (!parentAnchor && !currentAnchor) {
        div.appendChild(makeTextInput("Parent ID", "ID of the parent problem", "parent input", 64, ""))
    }
    div.appendChild(makeTextField("Problem Description", "Explain the problem in as much detail as necessary", "description input", 0, prefilledProblemBody))
    div.appendChild(createButton("Publish!",
        function () {
            //create anchor event
            nip07signer.user().then(async (user) => {
                if (!parentAnchor) {
                    let userAnchorInput = document.getElementById('parent input').value
                    if (userAnchorInput) {
                        if (userAnchorInput.length === 64) {
                            parentAnchor = document.getElementById('parent input').value;
                        }
                    }
                }
                    let body = document.getElementById('description input').value
                    let title = document.getElementById('title input').value
                if (!currentAnchor) {
                    let anchorEvent = makeAnchorEvent(parentAnchor, title)
                    anchorEvent.tags = addReplayProtection(user.hexpubkey(), anchorEvent.tags)
                    anchorEvent.publish().then(function () {
                        console.log(anchorEvent.rawEvent());
                        window.spaceman.CurrentState.state.replay[user.hexpubkey()] = anchorEvent.id
                        console.log(anchorEvent.id)
                        publish641802(user.hexpubkey(), anchorEvent.id, title, body, parentAnchor)
                        div.style.display = "none"
                    })
                }
                if (currentAnchor) {
                    publish641802(user.hexpubkey(), currentAnchor, title, body, null)
                    div.style.display = "none"
                }
            });
        },
        "publish"
    ))
    return div
}

function publish641802(pubkey, anchorID, title, body, parentAnchor) {
    let contentEvent = create641802(anchorID, title, body)
    contentEvent.tags = addReplayProtection(pubkey, contentEvent.tags)
    contentEvent.publish()
    console.log(contentEvent)
    window.spaceman.CurrentState.state.problems[anchorID] = {}
    window.spaceman.CurrentState.state.problems[anchorID].UID = anchorID
    window.spaceman.CurrentState.state.problems[anchorID].Body = body
    window.spaceman.CurrentState.state.problems[anchorID].Title = title
    if (parentAnchor) {
        document.getElementById(parentAnchor+"_children").appendChild(createElementProblemAnchor(window.spaceman.CurrentState.state.problems[anchorID]))
    }

}

function create641804(problemID, operation) {
    let ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 641804
    ndkEvent.content = operation
    ndkEvent.tags = [
        ["e", window.spaceman.rootevents.IgnitionEvent, "", "root"],
        ["e", problemID, "", "reply"]
    ]
    switch (operation) {
        case "claim":
            ndkEvent.tags.push(["claim", "claim"])
            break;
        case "abandon":
            ndkEvent.tags.push(["claim", "abandon"])
            break;
        case "close":
            ndkEvent.tags.push(["close", "close"])
            break;
        case "open":
            ndkEvent.tags.push(["close", "open"])
            break;
    }
    return ndkEvent
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
    return ndkEvent
}