/// <reference types="node" />
import * as http from "http";
import * as https from "https";
import * as net from "net";
import * as querystring from "querystring";
import { Readable } from "stream";
export declare type Cookies = {
    [key: string]: string[] | undefined;
};
export declare type PostData = {
    [key: string]: string | string[] | undefined;
};
interface AuthPayload extends Cookies {
    key?: string[];
}
export declare enum AuthType {
    Password = "password",
    None = "none"
}
export declare type Query = {
    [key: string]: string | string[] | undefined;
};
export interface HttpResponse<T = string | Buffer | object> {
    cache?: boolean;
    /**
     * If the code cannot be determined automatically set it here. The
     * defaults are 302 for redirects and 200 for successful requests. For errors
     * you should throw an HttpError and include the code there. If you
     * use Error it will default to 404 for ENOENT and EISDIR and 500 otherwise.
     */
    code?: number;
    /**
     * Content to write in the response. Mutually exclusive with stream.
     */
    content?: T;
    /**
     * Cookie to write with the response.
     * NOTE: Cookie paths must be absolute. The default is /.
     */
    cookie?: {
        key: string;
        value: string;
        path?: string;
    };
    /**
     * Used to automatically determine the appropriate mime type.
     */
    filePath?: string;
    /**
     * Additional headers to include.
     */
    headers?: http.OutgoingHttpHeaders;
    /**
     * If the mime type cannot be determined automatically set it here.
     */
    mime?: string;
    /**
     * Redirect to this path. Will rewrite against the base path but NOT the
     * provider endpoint so you must include it. This allows redirecting outside
     * of your endpoint.
     */
    redirect?: string;
    /**
     * Stream this to the response. Mutually exclusive with content.
     */
    stream?: Readable;
    /**
     * Query variables to add in addition to current ones when redirecting. Use
     * `undefined` to remove a query variable.
     */
    query?: Query;
}
/**
 * Use when you need to run search and replace on a file's content before
 * sending it.
 */
export interface HttpStringFileResponse extends HttpResponse {
    content: string;
    filePath: string;
}
export interface RedirectResponse extends HttpResponse {
    redirect: string;
}
export interface HttpServerOptions {
    readonly auth?: AuthType;
    readonly cert?: string;
    readonly certKey?: string;
    readonly commit?: string;
    readonly host?: string;
    readonly password?: string;
    readonly port?: number;
    readonly socket?: string;
}
export interface Route {
    base: string;
    requestPath: string;
    query: querystring.ParsedUrlQuery;
    fullPath: string;
    originalPath: string;
}
export interface HttpProviderOptions {
    readonly auth: AuthType;
    readonly base: string;
    readonly commit: string;
    readonly password?: string;
}
/**
 * Provides HTTP responses. This abstract class provides some helpers for
 * interpreting, creating, and authenticating responses.
 */
export declare abstract class HttpProvider {
    protected readonly options: HttpProviderOptions;
    protected readonly rootPath: string;
    constructor(options: HttpProviderOptions);
    dispose(): void;
    /**
     * Handle web sockets on the registered endpoint.
     */
    handleWebSocket(_route: Route, _request: http.IncomingMessage, _socket: net.Socket, _head: Buffer): Promise<true | undefined>;
    /**
     * Handle requests to the registered endpoint.
     */
    abstract handleRequest(route: Route, request: http.IncomingMessage): Promise<HttpResponse | undefined>;
    /**
     * Get the base relative to the provided route. For each slash we need to go
     * up a directory. For example:
     * / => ./
     * /foo => ./
     * /foo/ => ./../
     * /foo/bar => ./../
     * /foo/bar/ => ./../../
     */
    base(route: Route): string;
    /**
     * Get error response.
     */
    getErrorRoot(route: Route, title: string, header: string, body: string): Promise<HttpResponse>;
    /**
     * Replace common templates strings.
     */
    protected replaceTemplates(route: Route, response: HttpStringFileResponse, sessionId?: string): HttpStringFileResponse;
    protected get isDev(): boolean;
    /**
     * Get a file resource.
     * TODO: Would a stream be faster, at least for large files?
     */
    protected getResource(...parts: string[]): Promise<HttpResponse>;
    /**
     * Get a file resource as a string.
     */
    protected getUtf8Resource(...parts: string[]): Promise<HttpStringFileResponse>;
    /**
     * Tar up and stream a directory.
     */
    protected getTarredResource(request: http.IncomingMessage, ...parts: string[]): Promise<HttpResponse>;
    /**
     * Helper to error on invalid methods (default GET).
     */
    protected ensureMethod(request: http.IncomingMessage, method?: string | string[]): void;
    /**
     * Helper to error if not authorized.
     */
    protected ensureAuthenticated(request: http.IncomingMessage): void;
    /**
     * Use the first query value or the default if there isn't one.
     */
    protected queryOrDefault(value: string | string[] | undefined, def: string): string;
    /**
     * Return the provided password value if the payload contains the right
     * password otherwise return false. If no payload is specified use cookies.
     */
    protected authenticated(request: http.IncomingMessage, payload?: AuthPayload): string | boolean;
    /**
     * Parse POST data.
     */
    protected getData(request: http.IncomingMessage): Promise<string | undefined>;
    /**
     * Parse cookies.
     */
    protected parseCookies<T extends Cookies>(request: http.IncomingMessage): T;
}
/**
 * Provides a heartbeat using a local file to indicate activity.
 */
export declare class Heart {
    private readonly heartbeatPath;
    private readonly isActive;
    private heartbeatTimer?;
    private heartbeatInterval;
    private lastHeartbeat;
    constructor(heartbeatPath: string, isActive: () => Promise<boolean>);
    /**
     * Write to the heartbeat file if we haven't already done so within the
     * timeout and start or reset a timer that keeps running as long as there is
     * activity. Failures are logged as warnings.
     */
    beat(): void;
}
export interface HttpProvider0<T> {
    new (options: HttpProviderOptions): T;
}
export interface HttpProvider1<A1, T> {
    new (options: HttpProviderOptions, a1: A1): T;
}
export interface HttpProvider2<A1, A2, T> {
    new (options: HttpProviderOptions, a1: A1, a2: A2): T;
}
export interface HttpProvider3<A1, A2, A3, T> {
    new (options: HttpProviderOptions, a1: A1, a2: A2, a3: A3): T;
}
/**
 * An HTTP server. Its main role is to route incoming HTTP requests to the
 * appropriate provider for that endpoint then write out the response. It also
 * covers some common use cases like redirects and caching.
 */
export declare class HttpServer {
    private readonly options;
    protected readonly server: http.Server | https.Server;
    private listenPromise;
    readonly protocol: "http" | "https";
    private readonly providers;
    private readonly heart;
    private readonly socketProvider;
    constructor(options: HttpServerOptions);
    dispose(): void;
    getConnections(): Promise<number>;
    /**
     * Register a provider for a top-level endpoint.
     */
    registerHttpProvider<T extends HttpProvider>(endpoint: string, provider: HttpProvider0<T>): T;
    registerHttpProvider<A1, T extends HttpProvider>(endpoint: string, provider: HttpProvider1<A1, T>, a1: A1): T;
    registerHttpProvider<A1, A2, T extends HttpProvider>(endpoint: string, provider: HttpProvider2<A1, A2, T>, a1: A1, a2: A2): T;
    registerHttpProvider<A1, A2, A3, T extends HttpProvider>(endpoint: string, provider: HttpProvider3<A1, A2, A3, T>, a1: A1, a2: A2, a3: A3): T;
    /**
     * Start listening on the specified port.
     */
    listen(): Promise<string | null>;
    /**
     * The *local* address of the server.
     */
    address(): string | null;
    private onRequest;
    /**
     * Return any necessary redirection before delegating to a provider.
     */
    private maybeRedirect;
    /**
     * Given a path that goes from the base, construct a relative redirect URL
     * that will get you there considering that the app may be served from an
     * unknown base path. If handling TLS, also ensure HTTPS.
     */
    private constructRedirect;
    private onUpgrade;
    /**
     * Parse a request URL so we can route it.
     */
    private parseUrl;
}
export {};
