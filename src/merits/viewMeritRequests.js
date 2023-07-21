import {makeH3, makeH4, makeLinkWithOnclick, makeParagraph} from "../helpers/markdown.js";
import {makeTextInput} from "../helpers/forms.js";

export function viewMeritRequests() {
    let d = document.createElement("div")
    Object.keys(window.spaceman.CurrentState.state.merits).forEach(RocketID => {
        let rocketBox = makeElementRocket(window.spaceman.CurrentState.state.rockets[RocketID].RocketName)
        let profiles = 0
        Object.keys(window.spaceman.CurrentState.state.merits[RocketID]).forEach(pubkey => {
            let profileBox = makeElementProfile(window.spaceman.CurrentState.state.identity[pubkey].Name)
            let requests = 0
            if (window.spaceman.CurrentState.state.merits[RocketID][pubkey].Requests) {
                Object.values(window.spaceman.CurrentState.state.merits[RocketID][pubkey].Requests).forEach(request => {
                   profileBox.appendChild(makeElementMeritRequest(request.Amount, request.Problem, request.Blackballers, request.Ratifiers, request.Approved))
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

function makeElementRocket(name) {
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
    if (window.spaceman.CurrentState.state.problems[problem]) {
        d.appendChild(makeH3(window.spaceman.CurrentState.state.problems[problem].Title))
    }
    if (approved) {
        d.appendChild(makeParagraph("**This merit request has been approved**"))
    }
    let amt = makeParagraph("**Number of Merits being requested:** " + amount + " sats")
    if (window.spaceman.Bitcoin.price) {
        let usdAmount;
        usdAmount = ((amount/100000000)*window.spaceman.Bitcoin.price).toFixed(2)
        amt = makeParagraph("**Number of Merits being requested:** " + amount + " sats (about $"+usdAmount+" cuckbucks)")
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