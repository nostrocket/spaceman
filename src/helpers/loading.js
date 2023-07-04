import {makeParagraph} from "./markdown.js";

export function loading() {
    let box = document.createElement("div")
    let image = document.createElement("img")
    image.src = 'loading.gif'
    let waiting = makeParagraph("Waiting for events...")
    box.appendChild(image)
    box.appendChild(waiting)
    return box
}
