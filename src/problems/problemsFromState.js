import {waitForStateReady} from "../state/state.js";
import './problems.css'
import {createButton, makeLinkWithOnclick, spacer} from "../helpers/markdown.js";
import {makeTextField, makeTextInput} from "../helpers/forms.js";
import {ndk, nip07signer} from "../../main.ts";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {addReplayProtection} from "../helpers/tags.js";

export function createProblemsFromState() {
    let div = document.createElement("div")
    div.id = "problems"
    div.appendChild(createProblemPreview(window.spaceman.rootevents.ProblemRoot))
    waitForStateReady(()=>{
        Object.keys(window.spaceman.CurrentState.state.problems).forEach(problem => {
            recursiveRender(problem)
            // let parentNode = document.getElementById(window.spaceman.CurrentState.state.problems[problem].Parent+"_children")
            // let thisNode = document.getElementById(problem+"_problem_box")
            // if (parentNode && !thisNode) {
            //     console.log("rendering " + problem)
            //     parentNode.appendChild(createProblemPreview(problem))
            // } else {
            //     console.log(problem)
            // }
        })
    })
    return div
}

function recursiveRender(problem) {
        let thisProblem = window.spaceman.CurrentState.state.problems[problem]
        if (thisProblem) {
            let parentNode = document.getElementById(thisProblem.Parent+"_children")
            let thisNode = document.getElementById(problem+"_problem_box")
            if (thisNode) {
                return
            }
            if (parentNode && !thisNode) {
                console.log("rendering " + problem)
                parentNode.appendChild(createProblemPreview(problem))
                return true
            }
            if (!parentNode) {
                recursiveRender(window.spaceman.CurrentState.state.problems[problem].Parent)
            }
            recursiveRender(problem)
        }
}

function createProblemPreview(problemID) {
    return createProblemDivFromAnchor(window.spaceman.CurrentState.state.problems[problemID], true)
}

function createProblemFullView(problemID) {
    return createProblemDivFromAnchor(window.spaceman.CurrentState.state.problems[problemID], false)
}

function createProblemDivFromAnchor(problem, preview) {
    if (problem) {
        let d = document.createElement("div")
        d.id = problem.UID+"_problem_box"
        d.className = "problem_box"
        let p = document.createElement("div")
        p.id = problem.UID + "_problem"
        p.innerHTML = "<h3>" + problem.Title + "</h3>"
        p.innerHTML += "<p>" + problem.Body + "</p>"
        if (window.spaceman.CurrentState.state.identity[problem.CreatedBy]) {
            p.innerHTML += "<p>Logged By: " + window.spaceman.CurrentState.state.identity[problem.CreatedBy].Name + "</p>"
        }
        let c = document.createElement("div")
        c.id = problem.UID + "_children"
        p.className = "problem"
        c.className = "children_box"
        let actionBox = document.createElement("div")
        actionBox.className = actionBox
        actionBox.id = problem.UID+"_action_box"
        if (preview) {
            let readMore = makeLinkWithOnclick("more...", ()=>{
                let div = document.getElementById("problems")
                if (div) {
                    div.replaceChildren(createProblemFullView(problem.UID))
                }
            })
            actionBox.appendChild(readMore)
        } else {
            p.innerHTML += "<div class='id'>"+problem.UID+"</div>"

            //EDIT
            let edit = makeLinkWithOnclick("edit", ()=>{
                if (!document.getElementById(problem.UID + "_edit")) {
                    let div = document.createElement("div")
                    div.className = "problem_form"
                    div.innerText = "EDIT THIS PROBLEM"
                    let form = makeProblemForm(problem.Parent, problem.UID)
                    form.id = problem.UID + "_edit"
                    div.appendChild(form)
                    d.appendChild(div)
                }
            })

            //CLAIM
            let claim = makeLinkWithOnclick("claim", ()=>{
                console.log("todo: implement claim")
            })

            //CLOSE
            let close = makeLinkWithOnclick("close", ()=>{
                console.log("todo: implement close")
            })

            //COMMENT
            let comment = makeLinkWithOnclick("comment", ()=>{
                console.log("todo: implement comment")
            })

            //CREATE SUB-PROBLEM
            let newProblem = makeLinkWithOnclick("create sub-problem", ()=>{
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
            })
            actionBox.append(edit, spacer("|"), claim, spacer("|"), close, spacer("|"), comment, spacer("|"), newProblem)
        }
        d.append(p, actionBox, c)
        return d
    }
    return null
}


function makeProblemForm(parentAnchor, currentAnchor) {
    let div = document.createElement("div")
    let existingProblemTitle = "";
    let existingProblemBody = "";
    if (currentAnchor) {
        let currentProblem = window.spaceman.CurrentState.state.problems[currentAnchor]
        if (currentProblem) {
            existingProblemTitle = currentProblem.Title
            existingProblemBody = currentProblem.Body
        }
    }
    div.appendChild(makeTextInput("Title", "Problem: summarize the problem you face or have observed in less than 100 characters", "title input", 100, existingProblemTitle))
    if (!parentAnchor && !currentAnchor) {
        div.appendChild(makeTextInput("Parent ID", "ID of the parent problem", "parent input", 64, ""))
    }
    div.appendChild(makeTextField("Problem Description", "Explain the problem in as much detail as necessary", "description input", 0, existingProblemBody))
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
        document.getElementById(parentAnchor+"_children").appendChild(createProblemDivFromAnchor(window.spaceman.CurrentState.state.problems[anchorID]))
    }

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