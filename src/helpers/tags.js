import {getReplyByAccount, pubkeyInIdentity} from "../state/state.js";

export function makeTags(pubkey, type, r){
    let tags;
    tags = [["e", window.spaceman.rootevents.IgnitionEvent, "", "root"]]
    if (type === "identity") {tags.push(["e", window.spaceman.rootevents.IdentityRoot, "", "reply"])}
    if (type === "shares") {tags.push(["e", window.spaceman.rootevents.SharesRoot, "", "reply"])}
    if (type === "mirvs") {tags.push(["e", window.spaceman.rootevents.MirvsRoot, "", "reply"])}
    if (!r) {
        if (pubkeyInIdentity(pubkey)){
            tags.push(["r", getReplyByAccount(pubkey), "", "reply"])
        } else {
            tags.push(["r", window.spaceman.rootevents.ReplayRoot, "", "reply"])
        }
    }
    if (r) {
        tags.push(["r", r, "", "reply"])
    }
    return tags
}