import {makeTextInput} from "../helpers/forms.js";
import {makeUnsignedEvent, publish, signAsynchronously} from "../helpers/events.js";
import * as currentState from "../state/state.js";
import {makeItem} from "../helpers/markdown.js";
import {getIdentityByAccount} from "../state/state.js";
import {makeTags} from "../helpers/tags.js";

export function newsubrocket() {
    let div = document.createElement("div")
    div.appendChild(makeTextInput("Name", "Subrocket Name", "name input", 20, ""))
    div.appendChild(makeTextInput("Problem ID", "ID of Problem", "problem input", 64, "e624297b5a66775ee21a2565c023764bf6dc73cbbb0a1579fa5ff40ff50d59cd"))
    let b = document.createElement("button")
    b.innerText = "Do it!"
    b.onclick = function () {
        newSubrocketName(document.getElementById( 'name input' ).value, document.getElementById( 'problem input' ).value).then(x => {
            publish(x)
            newSubrocketCapTable(document.getElementById( 'name input' ).value, x.id).then(y => {
                publish(y)
            })
        })

    }
    div.appendChild(b)
    if (currentState.shares) {
        let  shares = Object.keys(currentState.shares);
        shares.forEach(subrocket => {
            // console.log(currentState.identity[account])
            // i.push(currentState.identity[account])
            div.appendChild(makeSubRocket(subrocket))
        })
    }
    return div
}
function makeSubRocket(subrocketName){
    let s = document.createElement("div")
    s.className = "subrocket"
    s.id = subrocketName
    let subrocketInfo = currentState.shares[subrocketName]
    // console.log(subrocketInfo)
    s.appendChild(makeH3(subrocketName))

    for (let account in subrocketInfo) {
        let cap = subrocketInfo[account]
        s.appendChild(makeItem("Name",getIdentityByAccount(account).Name))
        s.appendChild(makeItem("Last Lt Change", cap.LastLtChange))
        s.appendChild(makeItem("Lead Time", cap.LeadTime))
        s.appendChild(makeItem("Lead Time Locked Shares", cap.LeadTimeLockedShares))
        s.appendChild(makeItem("Lead Time Unlocked Shares", cap.LeadTimeUnlockedShares))
        s.appendChild(makeItem("OP Return Addresses", cap.OpReturnAddresses))
    }

    return s
}

async function newSubrocketName(name, problem) {
    if (name.length > 3) {
        let content;
        content = JSON.stringify({rocket_id: name, problem_id: problem})
        let tags;
        tags = makeTags(window.missioncontrol.pubkey, "subrockets")
        let unsigned = makeUnsignedEvent(content, tags, 640600, window.missioncontrol.pubkey)
        let signed = await signAsynchronously(unsigned)
        return signed
        // await sendEventToRocket(content, tags, 640600, window.missioncontrol.pubkey).then(x =>{
        //     return x
        // })
    } else {
        console.log("name is too short")
    }
}

async function newSubrocketCapTable(name, r) {
    if (name.length > 3) {
        let content;
        content = JSON.stringify({rocket_id: name})
        let tags;
        tags = makeTags(window.missioncontrol.pubkey, "shares", r)
        let unsigned = makeUnsignedEvent(content, tags, 640208, window.missioncontrol.pubkey)
        let signed = await signAsynchronously(unsigned)
        return signed
        // await sendEventToRocket(content, tags, 640208, window.missioncontrol.pubkey).then(x =>{
        //     return x
        // })
    } else {
        console.log("name is too short")
    }
}