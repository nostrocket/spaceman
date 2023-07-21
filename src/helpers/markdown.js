import showdown from "showdown"

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


export function makeParagraph(markdown) {
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

export function makeLink(url, text) {
    let a = document.createElement("a")
    a.href = url
    a.innerText = text
    return a
}

export function makeLinkWithOnclick(name, onclick, classname) {
    let b = document.createElement("a")
    if (name) {
        b.innerText = name
    }
    if (onclick) {
        b.onclick = onclick
    }
    b.className = "link"
    if (classname) {
        b.className = classname
    }
    return b
}

export function makeH3(title) {
    let h3 = document.createElement("h3")
    h3.className = "is-3"
    h3.innerText = title
    return h3
}

export function makeH4(title) {
    let h3 = document.createElement("h4")
    h3.className = "is-4"
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

export function spacer(deliminator) {
    let s = document.createElement("span")
    s.innerText = " "
    if (deliminator) {
        s.innerText = " " + deliminator + " ";
    }
    return s
}

export function makeButton(name, onclick, classname) {
    let b = document.createElement("button")
    if (name) {
        b.innerText = name
    }
    if (onclick) {
        b.onclick = onclick
    }
    if (classname) {
        b.className = classname
    }
    return b
}