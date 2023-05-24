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

function getChainOfProblems(problemList) {
    let chain = []
    chain.push(problem)
    window.spaceman.CurrentState.state.problems[problem].Parent
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
            let edit = makeLinkWithOnclick("edit", ()=>{
                console.log("todo: implement editing")
            })
            let claim = makeLinkWithOnclick("claim", ()=>{
                console.log("todo: implement claim")
            })
            let close = makeLinkWithOnclick("close", ()=>{
                console.log("todo: implement close")
            })
            let comment = makeLinkWithOnclick("comment", ()=>{
                console.log("todo: implement comment")
            })
            let newProblem = makeLinkWithOnclick("create sub-problem", ()=>{
                d.appendChild(newProblemForm(problem.UID))
            })
            actionBox.append(edit, spacer("|"), claim, spacer("|"), close, spacer("|"), comment, spacer("|"), newProblem)
        }
        d.append(p, actionBox, c)
        return d
    }
    return null
}


function newProblemForm(parentAnchor, currentAnchor) {
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
                    let body = document.getElementById('description input').value
                    let title = document.getElementById('title input').value
                    let anchorEvent = makeAnchorEvent(parentAnchor, title)
                    anchorEvent.tags = addReplayProtection(user.hexpubkey(), anchorEvent.tags)
                    anchorEvent.publish().then(function () {
                        console.log(anchorEvent.rawEvent());
                        window.spaceman.CurrentState.state.replay[user.hexpubkey()] = anchorEvent.id
                        console.log(anchorEvent.id)
                        let contentEvent = create641802(anchorEvent.id, title, body)
                        contentEvent.tags = addReplayProtection(user.hexpubkey(), contentEvent.tags)
                        contentEvent.publish()
                        window.spaceman.CurrentState.state.problems[anchorEvent.id] = {}
                        window.spaceman.CurrentState.state.problems[anchorEvent.id].UID = anchorEvent.id
                        window.spaceman.CurrentState.state.problems[anchorEvent.id].Body = body
                        window.spaceman.CurrentState.state.problems[anchorEvent.id].Title = title
                        document.getElementById(parentAnchor+"_children").appendChild(createProblemDivFromAnchor(window.spaceman.CurrentState.state.problems[anchorEvent.id]))
                        div.style.display = "none"
                    })
                } else {

                }
            });
        },
        "publish"
    ))
    return div
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