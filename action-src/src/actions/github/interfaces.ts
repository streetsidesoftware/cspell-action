// Copied from:
// https://github.com/actions/toolkit/blob/ecdfc18bf2ccf0651026d5a34ede173cf2c85e9d/packages/github/src/interfaces.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PayloadRepository {
    [key: string]: any;
    full_name?: string;
    name: string;
    owner: {
        [key: string]: any;
        login: string;
        name?: string;
    };
    html_url?: string;
}

export interface WebhookPayload {
    [key: string]: any;
    repository?: PayloadRepository;
    issue?: {
        [key: string]: any;
        number: number;
        html_url?: string;
        body?: string;
    };
    pull_request?: {
        [key: string]: any;
        number: number;
        html_url?: string;
        body?: string;
    };
    sender?: {
        [key: string]: any;
        type: string;
    };
    action?: string;
    installation?: {
        id: number;
        [key: string]: any;
    };
    comment?: {
        id: number;
        [key: string]: any;
    };
}
