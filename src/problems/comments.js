import {getTagContent} from "../helpers/tags.js";
import {replies} from "./events.js";
import {makeItem} from "../helpers/markdown.js";

export function createElementAllComments(problemID) {
    let comments = []
    let commentDiv = document.createElement("div")
    commentDiv.id = problemID + "_comments"
    replies.forEach(reply => {
        let tc = getTagContent(reply, "reply", "e")
        if (tc) {
            if (tc === problemID) {
               comments.push(reply)
            }
        }
    })
    comments.forEach(comment => {
        commentDiv.appendChild(createElementComment(comment))
    })
    return commentDiv
}

function createElementComment(commentEvent) {
    let commentDiv = document.createElement("div")
    commentDiv.className = "comment"
    commentDiv.innerText = commentEvent.content
    if (window.spaceman.CurrentState.state.identity[commentEvent.pubkey]) {
        let claim = makeItem("author", window.spaceman.CurrentState.state.identity[commentEvent.pubkey].Name)
        commentDiv.appendChild(claim)
    }
    return commentDiv
}