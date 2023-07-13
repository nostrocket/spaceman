import {makeTextInput} from "../helpers/forms.js";
import {makeUnsignedEvent, publish, signAsynchronously} from "../helpers/events.js";
import {waitForStateReady} from "../state/state.js";
import {createButton, makeH3, makeItem, makeParagraph, makeText} from "../helpers/markdown.js";
import {getIdentityByAccount} from "../state/state.js";
import {makeTags} from "../helpers/tags.js";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {ndk} from "../../main.ts";
import "./rockets.css"

export function newRocket() {
    let div = document.createElement("div")
    div.style.maxWidth = "800px"
    let form = document.createElement("div")
    form.className = "new_mirv"
    form.appendChild(makeH3("Let's go"))
    form.appendChild(makeTextInput("Name", "Rocket Name", "name input", 20, ""))
    form.appendChild(makeTextInput("Problem ID", "ID of Problem", "problem input", 64, ""))
    form.appendChild(document.createElement("br"))
    let b = document.createElement("button")
    b.innerText = "Do it!"
    b.onclick = function () {
        let problem = document.getElementById( 'problem input' ).value
        let name = document.getElementById( 'name input' ).value
        let existingProblem = window.spaceman.CurrentState.state.problems[problem]
        if (!existingProblem) {
            alert("invalid problem")
            return
        }
        if (existingProblem.CreatedBy !== window.spaceman.pubkey) {
            alert("you must be the creator of this problem to create a new Rocket for it")
            return
        }

        if (name.length < 4) {
            alert("name too short")
            return
        }
        let newRocketEvent = eventNewRocketName(name, problem)
        console.log(newRocketEvent)
        newRocketEvent.publish().then(x => {
            console.log(x)
            }
        )
    }
    form.appendChild(b)
    waitForStateReady(()=>{
        if (window.spaceman.CurrentState.state.rockets) {
            Object.values(window.spaceman.CurrentState.state.rockets).forEach(m => {
                console.log(m)
                div.appendChild(createElementRocket(m))
            })
        }

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

function createElementRocket(rocket){
    let s = document.createElement("div")
    s.className = "new_mirv"
    s.id = rocket.RocketUID
    let rocketMerits;
    if (window.spaceman.CurrentState.state.merits) {
        rocketMerits = window.spaceman.CurrentState.state.merits[rocket.RocketUID]
    }
    let problem;
    if (window.spaceman.CurrentState.state.problems) {
        problem = window.spaceman.CurrentState.state.problems[rocket.ProblemID]
    }
    s.appendChild(makeH3(rocket.RocketName))
    let createdByElement = makeItem("Created By",getIdentityByAccount(rocket.CreatedBy).Name);
    createdByElement.className = "datapoint"
    s.appendChild(createdByElement)
    if (problem) {
        let problemElement = makeItem("Created in response to ", problem.Title);
        problemElement.className = "datapoint"
        s.appendChild(problemElement)
    }
    if (rocketMerits) {
        for (let account in rocketMerits) {
            let cap = rocketMerits[account]
            s.appendChild(makeItem("Name",getIdentityByAccount(rocket.CreatedBy).Name))
            s.appendChild(makeItem("Last Lt Change", cap.LastLtChange))
            s.appendChild(makeItem("Lead Time", cap.LeadTime))
            s.appendChild(makeItem("Lead Time Locked Merits", cap.LeadTimeLockedMerits))
            s.appendChild(makeItem("Lead Time Unlocked Merits", cap.LeadTimeUnlockedMerits))
            s.appendChild(makeItem("Votepower", cap.LeadTimeLockedMerits * cap.LeadTime))
            s.appendChild(makeItem("OP Return Addresses", cap.OpReturnAddresses))
        }
    } else {
        s.appendChild(makeText("No merits have been created under this rocket (yet)"))
        s.appendChild(createButton("Create Initial Merits", () => {
            let ndkEvent = eventCreateInitialMerits(rocket.RocketUID, rocket.RocketName)
            // console.log(rocket)
            // console.log(ndkEvent)
            ndkEvent.publish().then(()=>{
                console.log(ndkEvent.rawEvent())
            })
        }))
    }

    return s
}

function eventNewRocketName(name, problem) {
        let tags;
        tags = makeTags(window.spaceman.pubkey, "rockets")
        tags.push(["e", problem, "", "reply"]);
        tags.push(["op", "nostrocket.rockets.register", name])
        let ndkEvent = new NDKEvent(ndk);
        ndkEvent.kind = 1
        ndkEvent.content = "I'm launching a new Rocket to resolve problem " + problem + ". I'm calling this rocket: " + name + "!"
        ndkEvent.tags = tags
        return ndkEvent
}

function eventCreateInitialMerits(rocketID, rocketName) {
    let tags;
    tags = makeTags(window.spaceman.pubkey, "merits")
    tags.push(["op", "nostrocket.merits.register", rocketID])
    let ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 1
    ndkEvent.content = "I'm creating the initial Merits for rocket " + rocketName + "!"
    ndkEvent.tags = tags
    return ndkEvent
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