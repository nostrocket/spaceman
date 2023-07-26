import {makeLinkWithOnclick, makeParagraph} from "../helpers/markdown.js";
import {createElementProblemFullView} from "./problemsFromState.js";

export function makeElementViewProblemBodyPreview(problem) {
    let bod = document.createElement("div")
    if (!problem.Closed) {
        bod = makeParagraph(problem.Body.substring(0, 280) + "...", true)
    }
    let readMore = makeLinkWithOnclick("read more...", ()=>{
        let div = document.getElementById("problems")
        if (div) {
            div.replaceChildren(createElementProblemFullView(problem.UID))
        }
    })
    bod.appendChild(readMore)
    return bod
}