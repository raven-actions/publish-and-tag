import fs from 'fs';
export class Context {
    /**
     * Webhook payload object that triggered the workflow
     */
    payload;
    /**
     * Name of the event that triggered the workflow
     */
    event;
    sha;
    ref;
    workflow;
    action;
    actor;
    constructor() {
        this.payload = process.env.GITHUB_EVENT_PATH ? JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')) : {};
        this.event = process.env.GITHUB_EVENT_NAME;
        this.sha = process.env.GITHUB_SHA;
        this.ref = process.env.GITHUB_REF;
        this.workflow = process.env.GITHUB_WORKFLOW;
        this.action = process.env.GITHUB_ACTION;
        this.actor = process.env.GITHUB_ACTOR;
    }
    get issue() {
        const payload = this.payload;
        let issue_number;
        if (payload.issue) {
            // If it's an issue
            issue_number = payload.issue.number;
        }
        else if (payload.pull_request) {
            // If it's a PR
            issue_number = payload.pull_request.number;
        }
        else if (payload.number) {
            // Just sittin' there on the payload
            issue_number = payload.number;
        }
        else {
            throw new Error('tools.context.issue cannot be used with this event, there is no issue or pull_request object.');
        }
        return {
            ...this.repo,
            issue_number
        };
    }
    get pullRequest() {
        const payload = this.payload;
        let pull_number;
        if (payload.pull_request) {
            // If it's a PR, the API expects pull_number
            pull_number = payload.pull_request.number;
        }
        else {
            throw new Error('tools.context.pullRequest cannot be used with this event, there is no pull_request object.');
        }
        return {
            ...this.repo,
            pull_number
        };
    }
    get repo() {
        if (process.env.GITHUB_REPOSITORY) {
            const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
            return { owner, repo };
        }
        if (this.payload.repository) {
            return {
                owner: this.payload.repository.owner.login,
                repo: this.payload.repository.name
            };
        }
        throw new Error("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
    }
}
//# sourceMappingURL=context.js.map