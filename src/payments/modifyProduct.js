import {makeH3, makeLinkWithOnclick, makeParagraph} from "../helpers/markdown.js";
import {viewProducts} from "./viewProducts.js";
import {makeElementRockets} from "../merits/requestMerits.js";
import {makeTextInput} from "../helpers/forms.js";
import {makeTags} from "../helpers/tags.js";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {ndk} from "../../main.ts";

export function modifyProduct(product) {
    let d = document.createElement("div")
    d.append(makeLinkWithOnclick("[View Products]", ()=>{
        d.replaceChildren(viewProducts())
    }))

    d.appendChild(makeH3("Modify Product"))
    d.appendChild(makeElementModifyProduct(product))
    return d
}

function makeElementModifyProduct(product) {
    let div = document.createElement("div")
    div.style.maxWidth = "800px"
    let form = document.createElement("div")
    form.className = "new_mirv"
    form.appendChild(makeH3("Let's fkn go!"))
    form.appendChild(makeParagraph("Modify Product"))
    form.appendChild(makeTextInput("Info ID", "Event ID of product info", "info input", 64, product.ProductInformation))
    let amount = parseInt(product.Amount, 10)
    form.appendChild(makeTextInput("Amount", "Amount in Sats", "amount input", 0, amount))
    console.log(product.Amount)
    form.appendChild(document.createElement("br"))
    let b = document.createElement("button")
    b.innerText = "Do it!"
    b.onclick = function() {
        let info = document.getElementById('info input').value
        if (info.length !== 64) {
            alert("invalid event ID for product info")
            return
        }
        let amount = document.getElementById('amount input').value
        if(!parseInt(amount, 10)) {
            alert("invalid amount")
            return
        }
        let newMeritEvent = newModifyProductEvent(product.UID, info, amount)
        newMeritEvent.publish().then(x => {
            console.log(newMeritEvent.rawEvent())
        })
    }
    form.appendChild(b)
    div.appendChild(form)
    return div
}

function newModifyProductEvent(target, info, amount) {
    let tags;
    tags = makeTags(window.spaceman.pubkey, "payments")
    tags.push(["e", target, "", "reply"]);
    tags.push(["op", "nostrocket.payments.product.modify.target", target])
    tags.push(["op", "nostrocket.payments.product.modify.info", info])
    tags.push(["op", "nostrocket.payments.product.modify.amount", amount])
    let ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 1
    ndkEvent.content = ""//"I'm creating a new product that costs " + amount + " sats. The product information is in event nostr:" +
        //window.spaceman.nt.nip19.noteEncode(info)
    ndkEvent.tags = tags
    return ndkEvent
}