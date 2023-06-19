export const replies = new Map;

export function enmapReply(event) {
    replies.set(event.id, event)
}