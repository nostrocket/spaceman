import {makeH3, makeParagraph} from "../helpers/markdown.js";
import {makeTextInput} from "../helpers/forms.js";

export function voteOnMeritRequest() {
    let d = document.createElement("div")
    return d
}

function makeElementNewVoteOnMeritRequestForm() {
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