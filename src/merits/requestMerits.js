import {makeH3, makeLinkWithOnclick, makeParagraph, spacer} from "../helpers/markdown.js";
import {makeTextInput} from "../helpers/forms.js";
import {waitForStateReady} from "../state/state.js";
import {makeTags} from "../helpers/tags.js";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {ndk} from "../../main.ts";

export function newMeritRequest() {
    let d = document.createElement("div")
    d.appendChild(makeElementCalculateAmount())
    d.appendChild(makeElementMyProblems())
    d.appendChild(makeElementRockets())
    d.appendChild(makeElementNewMeritRequestForm())
    return d
}

function makeElementNewMeritRequestForm() {
    let div = document.createElement("div")
    div.style.maxWidth = "800px"
    let form = document.createElement("div")
    form.className = "new_mirv"
    form.appendChild(makeH3("Let's fkn go!"))
    form.appendChild(makeParagraph("Request Merits"))
    form.appendChild(makeTextInput("Rocket ID", "ID of Rocket", "rocket input", 64, ""))
    form.appendChild(makeTextInput("Problem ID", "ID of sovled Problem", "problem input", 64, ""))
    form.appendChild(makeTextInput("Amount", "Amount in Sats", "amount input", 0, ""))
    form.appendChild(document.createElement("br"))
    let b = document.createElement("button")
    b.innerText = "Do it!"
    b.onclick = function () {
        let problem = document.getElementById( 'problem input' ).value
        let rocket = document.getElementById( 'rocket input' ).value
        let amount = document.getElementById( 'amount input' ).value
        let existingProblem = window.spaceman.CurrentState.state.problems[problem]
        if (!existingProblem) {
            alert("invalid problem")
            return
        }
        let existingRocket = window.spaceman.CurrentState.state.rockets[rocket]
        if (!existingRocket) {
            alert("invalid rocket")
            return
        }

        if (!parseInt(amount, 10)) {
            alert("invalid amount")
            return
        }
        let newMeritEvent = eventNewMeritRequest(rocket, problem, amount)
        console.log(newMeritEvent)
        newMeritEvent.publish().then(x => {
                console.log(x)
            }
        )
    }
    form.appendChild(b)
    div.appendChild(form)
    return div
}

function makeElementRockets() {
    let problems = document.createElement("div")
    problems.appendChild(makeH3("Which Rocket do you want to ask to pay for this?"))
    let found = 0
    Object.values(window.spaceman.CurrentState.state.rockets).forEach(m => {
            found++
            problems.appendChild(makeLinkWithOnclick(m.RocketName, ()=>{
                document.getElementById("rocket input").value = m.RocketUID
            }))
            problems.appendChild(document.createElement("br"))
    })
    if (found === 0) {
        document.appendChild(makeParagraph("Could not find any rockets! Something is probably broken"))
    }
    return problems
}

function makeElementMyProblems() {
    let problems = document.createElement("div")
    problems.appendChild(makeH3("Please select a problem you have solved"))
    let found = 0
    Object.values(window.spaceman.CurrentState.state.problems).forEach(m => {
        if (m.ClaimedBy === window.spaceman.pubkey && m.Closed === true) {
            found++
            problems.appendChild(makeLinkWithOnclick(m.Title, ()=>{
                document.getElementById("problem input").value = m.UID
            }))
            problems.appendChild(document.createElement("br"))
        }
    })
    if (found === 0) {
        document.appendChild(makeParagraph("You do not appear to have solved any problems.\n\n* Claim a problem on the problem tracker\n*Solve the problem with a pull request\n*Ask whoever logged the problem to verify that the problem no longer exists, and close the problem. Any maintainer can also do this."))
    }
    return problems
}

function makeElementCalculateAmount() {
    let d = document.createElement("div")
    d.className = "new_mirv"
    d.appendChild(makeParagraph("### How many Merits to request\n\n" +
        "* Requesting merits is simply a way to tell others how much you think your work is worth compared to theirs.\n\n" +
        "* How many hours did you spend solving this problem? What would your hourly rate be for this on the open market?\n\n" +
        "* Denominate this amount in Sats.\n\n" +
        "### Rocket Founders\n\n" +
        "* Your Merits are worthless unless your rocket becomes a success.\n\n" +
        "* Claiming too many Merits makes your rocket a non-starter because no one else will contribute to your rocket.\n\n" +
        "* Anyone can fork your rocket at any time if they think the idea is good but you are not being fair or honest.\n\n" +
        "* The best approach to making a rocket successful is to claim **much less than you think you deserve** until your rocket has attracted a large number of contributors, and your votepower is diluted such that you no longer have a significant influence over merit approvals.\n\n"))
    return d
}

function eventNewMeritRequest(rocket, problem, amount) {
    let tags;
    tags = makeTags(window.spaceman.pubkey, "merits")
    tags.push(["e", problem, "", "reply"]);
    tags.push(["e", rocket, "", "reply"]);
    tags.push(["op", "nostrocket.merits.newrequest.rocket", rocket])
    tags.push(["op", "nostrocket.merits.newrequest.problem", problem])
    tags.push(["op", "nostrocket.merits.newrequest.amount", amount])
    let ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 1
    ndkEvent.content = "I'm requesting " + amount + " sats for resolving problem " + problem + " in rocket " + rocket
    ndkEvent.tags = tags
    return ndkEvent
}