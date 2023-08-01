import {makeButton, makeH3, makeH4, makeLinkWithOnclick, makeParagraph, spacer} from "../helpers/markdown.js";
import {makeTextInput} from "../helpers/forms.js";
import {makeTags} from "../helpers/tags.js";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {ndk} from "../../main.ts";
import {problemTitle} from "../problems/problemsFromState.js";
import {newMeritRequest} from "./requestMerits.js";

export function viewMeritRequests() {
    let d = document.createElement("div")
    d.appendChild(makeLinkWithOnclick("[Log a New Merit Request]", ()=>{
        d.replaceChildren(newMeritRequest())
    }))
    Object.keys(window.spaceman.CurrentState.state.merits).forEach(RocketID => {
        let rocketBox = makeElementRocket(window.spaceman.CurrentState.state.rockets[RocketID].RocketName)
        let profiles = 0
        Object.keys(window.spaceman.CurrentState.state.merits[RocketID]).forEach(pubkey => {
            let profileBox = makeElementProfile(window.spaceman.CurrentState.state.identity[pubkey].Name)
            let requests = 0
            if (window.spaceman.CurrentState.state.merits[RocketID][pubkey].Requests) {
                Object.values(window.spaceman.CurrentState.state.merits[RocketID][pubkey].Requests).forEach(request => {
                    let requestBox = makeElementMeritRequest(request.Amount, request.Problem, request.Blackballers, request.Ratifiers, request.Approved)
                    requestBox.appendChild(makeButton("✔Ratify", () => {
                        ratifyEvent(RocketID, request)
                    }))
                    requestBox.appendChild(spacer())
                    requestBox.appendChild(makeButton("❌Blackball", () => {
                        blackballeEvent(RocketID, request.UID, pubkey, request.Problem, request.Amount)
                    }))
                   profileBox.appendChild(requestBox)
                    requests++
                })
            }
          if (requests > 0) {
              rocketBox.appendChild(profileBox)
              profiles++
          }
        })
        if (profiles >0) {
            d.appendChild(rocketBox)
        }
    })
    return d
}

function ratifyEvent(RocketID, request) {
 let e = eventVoteOnMeritRequest(RocketID, request, "ratify")
    e.publish().then(()=>{console.log(e)})
}

function blackballeEvent(rocket, requestID, targetPubkey, problemID) {
    let e = eventVoteOnMeritRequest(rocket, requestID, targetPubkey, "blackball", problemID)
    console.log(e)
}

export function makeElementRocket(name) {
    let d = document.createElement("div")
    d.className = "new_mirv"
    let rocketName = document.createElement("div")
    rocketName.className = "rocketName"
    rocketName.appendChild(makeH3("🚀"+name+"🚀"))
    d.appendChild(rocketName)
    return d
}

function makeElementProfile(name) {
    let d = document.createElement("div")
    d.className = "meritsbyaccount"
    d.appendChild(makeH3(name))
    return d
}

function makeElementMeritRequest(amount, problem, blackballers, ratifiers, approved) {
    let d = document.createElement("div")
    d.className = "meritsdiv"
    d.appendChild(makeH3(problemTitle(problem)))
    if (approved) {
        d.appendChild(makeParagraph("✔✔✔This merit request has been approved✔✔✔"))
    }
    let amt = makeParagraph("**Number of Merits being requested:** " + amount + " sats")
    if (window.spaceman.Bitcoin.price) {
        let usdAmount;
        usdAmount = ((amount/100000000)*window.spaceman.Bitcoin.price).toFixed(2)
        amt = makeParagraph("**Number of Merits requested:** " + amount + " sats (about $"+usdAmount+" cuckbucks)")
    }
    d.appendChild(amt)
    if (ratifiers) {
        d.appendChild(makeH3("Accounts that have Ratified this request"))
        Object.keys(ratifiers).forEach(account => {
            d.appendChild(makeH4(account))
        })
    }
    if (blackballers) {
        d.appendChild(makeH3("Accounts that have Blackballed this request"))
        Object.keys(blackballers).forEach(account => {
            d.appendChild(makeH4(account))
        })
    }
    return d
}

function eventVoteOnMeritRequest(rocket, request, direction) {
    let tags;
    tags = makeTags(window.spaceman.pubkey, "merits")
    tags.push(["e", request.Problem, "", "reply"]);
    tags.push(["e", rocket, "", "reply"]);
    tags.push(["e", request.UID, "", "reply"]);
    tags.push(["p", request.CreatedBy]);
    tags.push(["op", "nostrocket.merits.vote.rocket", rocket])
    tags.push(["op", "nostrocket.merits.vote.request", request.UID])
    tags.push(["op", "nostrocket.merits.vote.pubkey", request.CreatedBy])
    tags.push(["op", "nostrocket.merits.vote.direction", direction])
    let ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 1
    ndkEvent.content = "I'm voting to " + direction + " this request for " + request.Amount + " merits for solving [ " + problemTitle(request.Problem) + " ]"
    ndkEvent.tags = tags
    return ndkEvent
}