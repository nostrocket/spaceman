import {waitForStateReady} from "../state/state.js";
import './problems.css'
import {makeLinkWithOnclick, spacer} from "../helpers/markdown.js";

export function createProblemsFromState() {
    let div = document.createElement("div")
    div.id = "problems"
    div.appendChild(createProblemPreview(window.spaceman.rootevents.ProblemRoot))
    //div.appendChild(createAnchor(window.spaceman.rootevents.ProblemRoot).appendChild(createProblemDivFromAnchor(window.spaceman.CurrentState.state.problems[window.spaceman.rootevents.ProblemRoot])))
    waitForStateReady(()=>{
        Object.keys(window.spaceman.CurrentState.state.problems).forEach(s => {
            console.log(window.spaceman.CurrentState.state.problems[s])
        })
    })
    return div
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
        p.innerHTML += problem.UID
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
                console.log("todo: implement create sub-problem")
            })
            actionBox.append(edit, spacer("|"), claim, spacer("|"), close, spacer("|"), comment, spacer("|"), newProblem)
        }
        d.append(p, actionBox, c)
        return d
    }
    return null
}