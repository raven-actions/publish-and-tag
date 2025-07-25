import { WebhookPayloadWithRepository } from './context.js';
/**
 * Get the body of the relevant comment, review, issue or pull request
 * @param payload - Webhook payload
 */
export declare function getBody(payload: WebhookPayloadWithRepository): string | undefined;
