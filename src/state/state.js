let stateReady = false
let currentState


export function waitForStateReady(callback) {
    var interval = setInterval(function() {
        if (stateReady) {
            clearInterval(interval);
            callback();
        }
    }, 200);
}

export function enMapState(e) {
    console.log()
    let state;
    state = JSON.parse(e.content)
    currentState = state

    stateReady = true
}

export function identities() {
    let i = []
    if (stateReady) {
        let idents = Object.keys(currentState.identity);
        idents.forEach(account => {
            i.push(currentState.identity[account])
        })
    }
    return i
}

export function shares() {
    let s = []
    if (stateReady) {
        let  shares = Object.keys(currentState.shares);
        shares.forEach(subrocket => {
            // console.log(currentState.identity[account])
            i.push(currentState.identity[account])
        })
    }
    return i
}

export function pubkeyInIdentity(pubkey) {
    return currentState.identity.hasOwnProperty(pubkey);
}

export function getReplyByAccount(account) {
    return currentState.replay[account]
}

export function getIdentityByAccount(account) {
    return currentState.identity[account]
}





