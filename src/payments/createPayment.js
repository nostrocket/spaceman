import { LightningAddress } from "alby-tools";
import {waitForStateReady} from "../state/state.js";
import {makeH3, makeLinkWithOnclick, makeParagraph} from "../helpers/markdown.js";
import {makeTextInput} from "../helpers/forms.js";
import {makeElementRockets} from "../merits/requestMerits.js";
import {ndk} from "../../main.ts";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {makeTags} from "../helpers/tags.js";
import {viewMeritRequests} from "../merits/viewMeritRequests.js";
import {viewProducts} from "./viewProducts.js";

export function createNewProduct() {
    let d = document.createElement("div")
    d.appendChild(makeLinkWithOnclick("[View Products]", ()=>{
        d.replaceChildren(viewProducts())
    }))
    d.appendChild(makeH3("Create New Product"))
    d.append(makeH3("Which Rocket should this product belong to?"), makeElementRockets())
    d.appendChild(makeElementNewProduct())
    return d
}

    function makeElementNewProduct() {
        let div = document.createElement("div")
        div.style.maxWidth = "800px"
        let form = document.createElement("div")
        form.className = "new_mirv"
        form.appendChild(makeH3("Let's fkn go!"))
        form.appendChild(makeParagraph("Make New Product"))
        form.appendChild(makeTextInput("Rocket ID", "ID of Rocket", "rocket input", 64, ""))
        form.appendChild(makeTextInput("Info ID", "Event ID of product info", "info input", 64, ""))
        form.appendChild(makeTextInput("Amount", "Amount in Sats", "amount input", 0, ""))
        form.appendChild(document.createElement("br"))
        let b = document.createElement("button")
        b.innerText = "Do it!"
        b.onclick = function() {
            let info = document.getElementById('info input').value
            let rocket = document.getElementById('rocket input').value
            let amount = document.getElementById('amount input').value
            let existingRocket = window.spaceman.CurrentState.state.rockets[rocket]
            if(!existingRocket) {
                alert("invalid rocket")
                return
            }

            if(!parseInt(amount, 10)) {
                alert("invalid amount")
                return
            }
            let newMeritEvent = newProductEvent(rocket, info, amount)
            console.log(newMeritEvent)
            newMeritEvent.publish().then(x => {
                console.log(newMeritEvent)
            })
        }
        form.appendChild(b)
        div.appendChild(form)
        return div
    }

    function newProductEvent(rocket, info, amount) {
        let tags;
        tags = makeTags(window.spaceman.pubkey, "payments")
        tags.push(["e", rocket, "", "reply"]);
        tags.push(["op", "nostrocket.payments.product.new.rocket", rocket])
        tags.push(["op", "nostrocket.payments.product.new.info", info])
        tags.push(["op", "nostrocket.payments.product.new.amount", amount])
        let ndkEvent = new NDKEvent(ndk);
        ndkEvent.kind = 1
        ndkEvent.content = "I'm creating a new product that costs " + amount + " sats. The product information is in event nostr:" +
            window.spaceman.nt.nip19.noteEncode(info)
        ndkEvent.tags = tags
        return ndkEvent
    }