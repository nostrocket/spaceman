import {ndk} from "../../main";
import {NDKEvent, NDKFilter} from "@nostr-dev-kit/ndk";
import {fetchJson} from "fetch-json";


export async function PayForProduct(lud06: string, pubkey: string, amount: number, callback: string, productID: string):Promise<string> {
    return new Promise((resolve) => {
        //get the LUD06 from the payments object
        let zapRequest = new NDKEvent(ndk);
        zapRequest.kind = 9734;
        zapRequest.content = "testing something"
        zapRequest.tags = [["relays", "wss://nostr.mutinywallet.com"],
            ["amount", (amount*1000).toString()],
            ["lnurl", lud06],
            ["p", pubkey],
            ["e", productID]]
        zapRequest.sign(ndk.signer).then(() => {
            fetchJson.get(`${callback}?amount=${amount*1000}&nostr=${JSON.stringify(zapRequest.rawEvent())}`).then(x=>{
                resolve(x)
            })
        })
    })
}

