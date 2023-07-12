import {getReplayForAccount, pubkeyInIdentity} from "../state/state.js";

export function makeTags(pubkey, type, r){
    let tags = [];
    tags = [["e", window.spaceman.rootevents.IgnitionEvent, "", "root"]]
    if (type === "identity") {tags.push(["e", window.spaceman.rootevents.IdentityRoot, "", "reply"])}
    if (type === "shares") {tags.push(["e", window.spaceman.rootevents.SharesRoot, "", "reply"])}
    if (type === "mirvs") {tags.push(["e", window.spaceman.rootevents.MirvsRoot, "", "reply"])}
    tags = addReplayProtection(pubkey, tags, r)
    return tags
}

export function addReplayProtection(pubkey, tags, r) {
    if (!r) {
        if (!pubkey) {
            pubkey = window.spaceman.pubkey
        }
        if (pubkeyInIdentity(pubkey)){
            let replayTag = getReplayForAccount(pubkey)
            if (replayTag) {
                tags.push(["r", replayTag, "", "reply"])
                return tags
            }
        }
        tags.push(["r", window.spaceman.rootevents.ReplayRoot])//, "", "reply"])
    }
    if (r) {
        tags.push(["r", r, "", "reply"])
    }
    return tags
}

export function getTagContent(event, tagType, tagKey) {
    let tagContent = null
    event.tags.forEach(tag => {
        tag.forEach(tagInner => {
            if (tagInner === tagType) {
                if (tagKey) {
                    if (tag[0] === tagKey) {
                    tagContent = tag[1]
                }}
                if (!tagKey) {
                    tagContent = tag[1]
                }
            }
        })
    })
    return tagContent
}

export function isTaggedWith(event, tag) {
    event.tags.forEach(tag => {
        tag.forEach(tagInner => {
            if (tagInner === tag) {
                return true
            }
        })
    })
    return false
}