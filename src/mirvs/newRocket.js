import {makeTextInput} from "../helpers/forms.js";
import {makeUnsignedEvent, publish, signAsynchronously} from "../helpers/events.js";
import {waitForStateReady} from "../state/state.js";
import {makeH3, makeItem, makeParagraph, makeText} from "../helpers/markdown.js";
import {getIdentityByAccount} from "../state/state.js";
import {makeTags} from "../helpers/tags.js";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {ndk} from "../../main.ts";
import "./mirv.css"

export function newRocket() {
    let div = document.createElement("div")
    //div.appendChild(makeParagraph("A Mirv is an independently targetable rocket. This feature isn't ready yet."))
    let form = document.createElement("div")
    form.className = "new_mirv"
    form.appendChild(makeH3("Let's go"))
    form.appendChild(makeTextInput("Name", "Rocket Name", "name input", 20, ""))
    form.appendChild(makeTextInput("Problem ID", "ID of Problem", "problem input", 64, ""))
    form.appendChild(document.createElement("br"))
    let b = document.createElement("button")
    b.innerText = "Do it!"
    b.onclick = function () {
        alert("this feature isn't ready yet")
        // newMirvName(document.getElementById( 'name input' ).value, document.getElementById( 'problem input' ).value).then(x => {
        //     newMirvCapTable(document.getElementById( 'name input' ).value, x).then(() => {
        //         console.log()
        //     })
        // })

    }
    form.appendChild(b)
    waitForStateReady(()=>{
        Object.values(window.spaceman.CurrentState.state.mirvs).forEach(m => {
            console.log(m)
            form.appendChild(createElementMirv(m))
        })
        // Object.keys(window.spaceman.CurrentState.state.shares).forEach(s => {
        //     div.append(createElementMirv(s))
        // })
    })

    // let s = shares()
    // if (s) {
    //     let  shares = Object.keys(s);
    //     s.forEach(mirv => {
    //         // console.log(currentState.identity[account])
    //         // i.push(currentState.identity[account])
    //         div.appendChild(makeNewMirv(mirv))
    //     })
    // }
    div.appendChild(form)
    return div
}

function createElementMirv(mirv){
    let s = document.createElement("div")
    s.className = "mirv"
    s.id = mirv.RocketID
    let mirvInfoFromShares = window.spaceman.CurrentState.state.shares[mirv.RocketID]
    // console.log(mirvInfo)
    s.appendChild(makeH3(mirv.RocketID))
    s.appendChild(makeItem("Created By",getIdentityByAccount(mirv.CreatedBy).Name))

    if (mirvInfoFromShares) {
        for (let account in mirvInfoFromShares) {
            let cap = mirvInfoFromShares[account]
            s.appendChild(makeItem("Name",getIdentityByAccount(mirv.CreatedBy).Name))
            s.appendChild(makeItem("Last Lt Change", cap.LastLtChange))
            s.appendChild(makeItem("Lead Time", cap.LeadTime))
            s.appendChild(makeItem("Lead Time Locked Shares", cap.LeadTimeLockedShares))
            s.appendChild(makeItem("Lead Time Unlocked Shares", cap.LeadTimeUnlockedShares))
            s.appendChild(makeItem("OP Return Addresses", cap.OpReturnAddresses))
        }
    } else {
        s.appendChild(makeText("This MIRV does not yet have a cap table"))
    }

    return s
}

async function newMirvName(name, problem) {
    if (!window.spaceman.CurrentState.state.problems[problem]) {
        alert("invalid problem")
        return
    }

    if (name.length < 4) {
        alert("name too short")
        return
    }
        let content;
        content = JSON.stringify({rocket_id: name, problem_id: problem})
        let tags;
        tags = makeTags(window.spaceman.pubkey, "mirvs")
        let ndkEvent = new NDKEvent(ndk);
        ndkEvent.kind = 640600
        ndkEvent.content = content
        ndkEvent.tags = tags
        await ndkEvent.publish()
        return ndkEvent.id
}

async function newMirvCapTable(name, r) {
    if (name.length > 3) {
        let content;
        content = JSON.stringify({rocket_id: name})
        let tags;
        tags = makeTags(window.spaceman.pubkey, "shares", r)
        let ndkEvent = new NDKEvent(ndk);
        ndkEvent.kind = 640208
        ndkEvent.content = content
        ndkEvent.tags = tags
        await ndkEvent.publish()
        // let unsigned = makeUnsignedEvent(content, tags, 640208, window.spaceman.pubkey)
        // let signed = await signAsynchronously(unsigned)
        // return signed
        // await sendEventToRocket(content, tags, 640208, window.spaceman.pubkey).then(x =>{
        //     return x
        // })
    } else {
        console.log("name is too short")
    }
}