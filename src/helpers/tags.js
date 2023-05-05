import {getReplyByAccount, pubkeyInIdentity} from "../state/state.js";

export function makeTags(pubkey, type, r){
    let tags;
    tags = [["e", window.missioncontrol.rootevents.IgnitionEvent, "", "root"]]
    if (type === "identity") {tags.push(["e", window.missioncontrol.rootevents.IdentityRoot, "", "reply"])}
    if (type === "shares") {tags.push(["e", window.missioncontrol.rootevents.SharesRoot, "", "reply"])}
    if (type === "subrockets") {tags.push(["e", window.missioncontrol.rootevents.SubrocketsRoot, "", "reply"])}
    if (!r) {
        if (pubkeyInIdentity(pubkey)){
            tags.push(["r", getReplyByAccount(pubkey), "", "reply"])
        } else {
            tags.push(["r", window.missioncontrol.rootevents.ReplayRoot, "", "reply"])
        }
    }
    if (r) {
        tags.push(["r", r, "", "reply"])
    }
    return tags
}