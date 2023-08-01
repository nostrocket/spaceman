import {makeButton, makeH3, makeLinkWithOnclick, makeParagraph, spacer} from "../helpers/markdown.js";
import {makeElementRockets} from "../merits/requestMerits.js";
import {makeElementRocket, viewMeritRequests} from "../merits/viewMeritRequests.js";
import {createNewProduct} from "./createPayment.js";
import {replies} from "../problems/events.js";


export function viewProducts() {
    let d = document.createElement("div")
    d.appendChild(makeLinkWithOnclick("[Create New Product]", ()=>{
        d.replaceChildren(createNewProduct())
    }))
    d.appendChild(makeH3("View Products"))
    Object.values(window.spaceman.CurrentState.state.rockets).forEach(rocket => {
        let rocketBox = makeElementRocket(rocket.RocketName)
        let products = 0
        //console.log(rocket)
        if (rocket.Products) {
            rocket.Products.forEach(product => {
                products++
                rocketBox.appendChild(makeElementProduct(product))
            })
        }
        // let rocketBox = makeElementRocket(window.spaceman.CurrentState.state.rockets[RocketID].RocketName)
        // let products = 0
        // Object.values(window.spaceman.CurrentState.state.payments["Products"]).forEach(product => {
        //     console.log(product)
        //     if (product.RocketID === RocketID) {
        //         products++
        //         makeElementProduct(product)
        //     }
        // })
        if (products >0) {
            d.appendChild(rocketBox)
        }
    })
    return d
}

function makeElementProduct(product) {
    let d = document.createElement("div")
    d.className = "new_mirv"
    let info = replies.get(product.ProductInformation)
    if (info) {
        d.appendChild(makeParagraph(info.content))
    }
    d.appendChild(makeButton("Buy Now!", function () {
        alert("not yet implemented")
    }))
    return d
}