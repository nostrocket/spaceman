
const classMap = {
    h1: 'title is-1',
    h2: 'title is-2',
    h3: 'title is-3',
    h4: 'title is-4',
    h6: 'subtitle'
}

const bindings = Object.keys(classMap)
    .map(key => ({
        type: 'output',
        regex: new RegExp(`<${key}(.*)>`, 'g'),
        replace: `<${key} class="${classMap[key]}" $1>`
    }));


function makeParagraph(markdown) {
    let d;
    d = document.createElement("div")
    let md;
    md = new showdown.Converter({
        extensions: [...bindings]
    })
    let ht = md.makeHtml(markdown)
    let mdht = document.createElement("div")
    mdht.innerHTML = ht
    d.appendChild(mdht)
    d.appendChild(document.createElement("br"))
    return d
}

function makeLink(url, text) {
    let a = document.createElement("a")
    a.href = url
    a.innerText = text
    return a
}

function makeH3(title) {
    let h3 = document.createElement("h3")
    h3.className = "is-3"
    h3.innerText = title
    return h3
}


export function makeItem(key, value) {
    let d = document.createElement("div")
    d.appendChild(makeText(key + ": "))
    d.appendChild(makeText(value))
    return d
}

export function makeText(text) {
    let s = document.createElement("span")
    s.innerText = text
    return s
}