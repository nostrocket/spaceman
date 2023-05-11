import {identities} from "../state/state.js";

export function makeTextField(label, placeholder, id, maxlength, existing) {
    let input;
    input = document.createElement("textarea")
    input.className = "textarea"
    if (existing.length > 0) {
        input.value = existing
    }
    input.placeholder = placeholder
    input.id = id
    if (maxlength > 0) {
        input.maxLength = maxlength
    }
    return makeFormField(label, input)
}

export function makeTextInput(label, placeholder, id, maxlength, existing) {
    let d;
    d = document.createElement("div")
    let textInput;
    textInput = document.createElement("input")
    d.appendChild(textInput)
    textInput.className = "input"
    textInput.type = "text"
    if (existing.length > 0) {
        textInput.value = existing
    }
    textInput.placeholder = placeholder
    textInput.id = id
    textInput.maxLength = maxlength

    if (label === "Username") {
        var userameIsAlreadySet = false
        identities().forEach(function (v) {
            if (v.Account === window.spaceman.pubkey) {
                if (v.Name.length > 0) {
                    textInput.value = v.Name
                    textInput.readOnly = true
                    userameIsAlreadySet = true
                }
            }
        })
        if (!userameIsAlreadySet) {
            let warn;
            warn = document.createElement("p")
            warn.style.display = "none"
            identities().forEach(function (v) {
                if (v.Name === existing) {
                    warn.style.display = "block"
                }
            })
            warn.innerText = "username is taken!"
            if (existing.length < 1) {
                warn.innerText = "username is too short!"
            }
            warn.style.color = "#FF9900"

            textInput.onkeyup = function () {
                warn.style.display = "none"
                if (textInput.value.length < 1) {
                    warn.innerText = "username is too short!"
                    warn.style.display = "block"
                }
                identities().forEach(function (v) {
                    if ((v.Name === textInput.value)&&(textInput.value.length > 0)) {
                        warn.innerText = "username is taken!"
                        warn.style.display = "block"
                    }
                })
            }
            d.appendChild(warn)
        }
    }

    if (label === "Amount") {
        let warn;
        warn = document.createElement("p")
        warn.style.display = "none"
        textInput.type = "number"
        textInput.onkeyup = function () {
            warn.style.display = "none"
            let int;
            int = parseInt(textInput.value, 10)
            if (!int) {
                warn.style.color = "#FF9900"
                warn.innerText = "must be a number!"
                warn.style.display = "block"
            } else {
                if (USD) {
                    let usdAmount;
                    usdAmount = ((int/100000000)*USD).toFixed(2)
                    warn.innerText = "Approximate amount in Cuckbucks:  $" + usdAmount
                    warn.style.color = "#35be33"
                    warn.style.display = "block"
                } else {
                    console.log("could not get USD")
                }
            }
        }
        d.appendChild(warn)
    }
    return makeFormField(label, d)
}

function makeFormField(label, input) {
    if (label === "About") {
        //todo populate from existing data if exists
    }
    let field;
    field = document.createElement("div")
    field.className = "field"
    field.appendChild(makeLabel(label))
    let control;
    control = document.createElement("div")
    control.className = "control"
    control.appendChild(input)
    field.appendChild(control)
    return field
}

function makeLabel(name) {
    let label;
    label = document.createElement("label")
    label.className = "label"
    label.innerText = name
    return label
}
