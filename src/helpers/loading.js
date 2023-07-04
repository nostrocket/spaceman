import {makeParagraph} from "./markdown.js";

export function loading() {
    let box = document.createElement("div")
    let image = document.createElement("img")
    image.src = 'loading.gif'
    let waiting = makeParagraph("Waiting for events... Be patient, this could take a while.")
    waiting.appendChild(makeParagraph("Spaceman! A Nostrocket client that works sometimes.\n\nIf something goes wrong, hold down the shift key and refresh the page."))
    box.appendChild(image)
    box.appendChild(waiting)
    return box
}
