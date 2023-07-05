import {makeParagraph} from "./markdown.js";

export function loading(small, content) {
    let box = document.createElement("div")
    box.className = "notice"
    box.style.width = "50%"
    let image = document.createElement("img")
    image.src = 'loading.gif'
    if (small) {
        image.style.height = "128px"
        image.style.width = "auto"
    }
    box.appendChild(image)
    let c = document.createElement("div")
    c.appendChild(makeParagraph("### Spaceman! A Nostrocket client that works sometimes." +
        "\n\nIf something goes wrong, hold down the shift key and refresh the page." +
        "\n\nWaiting for events... Be patient, this could take a while."))
    if (content) {
        c.replaceChildren(content)
    }
    box.appendChild(c)
    return box
}
