window.missioncontrol.pubkey = ""

setTimeout(function(){
    if (window.nostr) {
        window.nostr.getPublicKey().then(x=>{
            console.log("Current pubkey is: ", x);
            window.missioncontrol.pubkey = x
        })
    } else {
        alert("You can look but you can't touch. Please install a NIP-07 nostr signing browser extension (such as GetAlby or Nos2x) if you want to interact with Nostrocket!")
    }
},100)