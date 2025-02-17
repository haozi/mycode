export interface Application {
    readonly categories?: string[];
    readonly comment?: string;
    readonly directory?: string;
    readonly exec?: string;
    readonly genericName?: string;
    readonly icon?: string;
    readonly installed?: boolean;
    readonly name: string;
    readonly path?: string;
    readonly sessionId?: string;
    readonly version?: string;
}
export interface ApplicationsResponse {
    readonly applications: ReadonlyArray<Application>;
}
export declare enum SessionError {
    NotFound = 4000,
    FailedToStart = 4001,
    Starting = 4002,
    InvalidState = 4003,
    Unknown = 4004
}
export interface SessionResponse {
    /**
     * Whether the session was created or an existing one was returned.
     */
    created: boolean;
    sessionId: string;
}
export interface RecentResponse {
    readonly paths: string[];
    readonly workspaces: string[];
}
export interface RunningResponse {
    readonly applications: ReadonlyArray<Application>;
}
export interface HealthRequest {
    readonly event: "health";
}
export declare type ClientMessage = HealthRequest;
export interface HealthResponse {
    readonly event: "health";
    readonly connections: number;
}
export declare type ServerMessage = HealthResponse;
export interface ReadyMessage {
    protocol: string;
}
