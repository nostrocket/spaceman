import {makeButton, makeH3, makeLinkWithOnclick, makeParagraph, spacer} from "../helpers/markdown.js";
import {makeElementRockets} from "../merits/requestMerits.js";
import {makeElementRocket, viewMeritRequests} from "../merits/viewMeritRequests.js";
import {createNewProduct} from "./createPayment.js";
import {replies} from "../problems/events.js";
import {modifyProduct} from "./modifyProduct.js";
import {PayForProduct} from "./zaps.js";
//import {PayForProduct} from "./zaps.js";

export function viewProducts() {
    let d = document.createElement("div")
    d.appendChild(makeLinkWithOnclick("[Create New Product]", ()=>{
        d.replaceChildren(createNewProduct())
    }))
    d.appendChild(makeH3("View Products"))
    Object.values(window.spaceman.CurrentState.state.rockets).forEach(rocket => {
        let rocketBox = makeElementRocket(rocket.RocketName)
        let products = 0
        if (rocket.Products) {
            rocket.Products.forEach(product => {
                products++
                rocketBox.appendChild(makeElementProduct(product, d, rocket))
            })
        }
        if (products >0) {
            d.appendChild(rocketBox)
        }
    })
    return d
}

function makeElementProduct(product, renderDiv, rocket) {
    let d = document.createElement("div")
    d.className = "new_mirv"
    let info = replies.get(product.ProductInformation)
    if (info) {
        d.appendChild(makeParagraph(info.content))
    }
    d.append(
        makeButton("Buy Now for " + product.Amount + " sats", function () {
            console.log(product)
            let amount = parseInt(product.Amount, 10)
            PayForProduct(product.NextPayment.LUD06, product.NextPayment.Pubkey, amount, product.NextPayment.Callback, product.UID).then(x=>{
                console.log(x)
                if (typeof window.webln !== 'undefined') {
                    console.log('WebLN is available!');
                    window.webln.enable().then(()=>{
                        console.log("enabled")
                        webln.sendPayment(x["pr"]).then(response=>{
                            console.log(response)
                        }).catch(reason => {
                            console.log(reason)
                        })
                    })
                }
                // if (window.webln) {
                //     // zap in one go with WebLN (https://www.webln.guide) (easiest for web apps)
                //     const response = await ln.zap(zapArgs); // signs zap request event, generates invoice and pays it
                //     console.log(response.preimage); // print the preimage
                // }
                // else {
                //     // or manually (create an invoice and give it to the user to pay)
                //     const invoice = await ln.zapInvoice(zapArgs); // generates a zap invoice
                //     console.log(invoice.paymentRequest); // print the payment request
                //     await invoice.isPaid(); // check the payment status as descibed above
                // }
            })
        //alert("not yet implemented")
    }),
        spacer(),
        makeButton("Modify this product", ()=>{
            console.log(rocket)
            if (!rocket.Maintainers.includes(window.spaceman.pubkey)) {
                alert("you must be a maintainer of this rocket to modify the product")
                return
            }
            renderDiv.replaceChildren(modifyProduct(product))
        })
        )
    return d
}