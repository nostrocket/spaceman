import {getTagContent} from "../helpers/tags.js";
import {enmapReply, replies} from "./events.js";
import {makeItem} from "../helpers/markdown.js";
import * as NostrTools from "nostr-tools";
import * as state from "../state/state.js";
import renderIdentityLayout from "../identity/identity.js";

export function createElementAllComments(problemID) {
    let comments = []
    let commentDiv = document.createElement("div")
    commentDiv.id = problemID + "_comments"
    replies.forEach(reply => {
        if (shouldDisplayOnProblem(reply, problemID)) {
            comments.push(reply)
        }
        // let tc = getTagContent(reply, "reply", "e")
        // if (tc) {
        //     if (tc === problemID) {
        //        comments.push(reply)
        //     }
        // }
    })
    comments.forEach(comment => {
        commentDiv.appendChild(createElementComment(comment))
    })
    return commentDiv
}

function shouldDisplayOnProblem(event, problemID) {
    let hideIfIncludes = ["title", "description"]
    let r = false
    let hide = false
    event.tags.forEach(tag => {
        tag.forEach(tagInner => {
            if (tagInner === problemID) {
                if (tag.length === 4) {
                    r = true
                }
            }
            if (hideIfIncludes.includes(tagInner)) {
                hide = true
            }
        })
    })
    return (r && !hide)
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

var startedListening = false
export function beginListeningForComments(ids) {
    if (!startedListening) {
        startedListening = true
        const pool = new NostrTools.SimplePool()
        let relays = []

        let sub = pool.sub(
            [...relays, 'wss://nostr.688.org', 'wss://nos.lol'],
            [
                {
                    //tags: [['#e', 'fd459ea06157e30cfb87f7062ee3014bc143ecda072dd92ee6ea4315a6d2df1c']]
                    "#e": ids
                    //kinds: [10310]
                    // authors: [
                    //     "b4f36e2a63792324a92f3b7d973fcc33eaa7720aaeee71729ac74d7ba7677675"
                    //     //NostrTools.nip19.decode("npub1mygerccwqpzyh9pvp6pv44rskv40zutkfs38t0hqhkvnwlhagp6s3psn5p").data
                    // ]
                }
            ]
        )

        sub.on('event', event => {
            if (event.kind === 641804 || event.kind === 1) {
                enmapReply(event)
            }
        })
    }
}