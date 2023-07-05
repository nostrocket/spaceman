export function waitForStateReady(callback) {
    var interval = setInterval(function() {
        if (window.spaceman.CurrentState.ready) {
            clearInterval(interval);
            callback();
        }
    }, 200);
}

export const waitForStateReadyPromise = new Promise((resolve, reject) => {
    waitForStateReady(() => {
        resolve()
    })
})

export function enMapState(e) {
    console.log()
    let state;
    state = JSON.parse(e.content)
    window.spaceman.CurrentState.state = state
    window.spaceman.CurrentState.ready = true
}

export function identities() {
    let i = []
    if (window.spaceman.CurrentState.ready) {
        let idents = Object.keys(window.spaceman.CurrentState.state.identity);
        idents.forEach(account => {
            i.push(window.spaceman.CurrentState.state.identity[account])
        })
    }
    return i
}

export function shares() {
    let s = []
    if (window.spaceman.CurrentState.ready) {
        let  shares = Object.keys(window.spaceman.CurrentState.state.shares);
        shares.forEach(mirv => {
            // console.log(currentState.identity[account])
            s.push(window.spaceman.CurrentState.state.identity[account])
        })
    }
    return s
}



export function pubkeyInIdentity(pubkey) {
    return window.spaceman.CurrentState.state.identity.hasOwnProperty(pubkey);
}

export function getReplayForAccount(account) {
    if (window.spaceman.CurrentState.state.replay) {
        return window.spaceman.CurrentState.state.replay[account]
    }
    return null
}

export function getIdentityByAccount(account) {
    return window.spaceman.CurrentState.state.identity[account]
}





