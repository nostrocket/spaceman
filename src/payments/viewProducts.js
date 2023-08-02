import {makeButton, makeH3, makeLinkWithOnclick, makeParagraph, spacer} from "../helpers/markdown.js";
import {makeElementRockets} from "../merits/requestMerits.js";
import {makeElementRocket, viewMeritRequests} from "../merits/viewMeritRequests.js";
import {createNewProduct} from "./createPayment.js";
import {replies} from "../problems/events.js";
import {modifyProduct} from "./modifyProduct.js";

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
        alert("not yet implemented")
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