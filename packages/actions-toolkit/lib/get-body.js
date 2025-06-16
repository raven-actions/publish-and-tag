/**
 * Get the body of the relevant comment, review, issue or pull request
 * @param payload - Webhook payload
 */
export function getBody(payload) {
    if (payload.comment)
        return payload.comment.body;
    if (payload.review)
        return payload.review.body;
    // If neither of those comments are present, check the body
    if (payload.issue)
        return payload.issue.body;
    if (payload.pull_request)
        return payload.pull_request.body;
    return undefined;
}
//# sourceMappingURL=get-body.js.map