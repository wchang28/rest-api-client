export declare type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";
export declare type CredentialPlacement = ("query" | "header");
export interface BasicCredential {
    username: string;
    password: string;
}
export interface TokenCredential {
    tokenType?: string;
    token: string | BasicCredential;
}
export interface HeaderCredential {
    field?: string;
    value: string | TokenCredential;
}
export declare type QueryCredential = {
    [field: string]: string;
};
export declare type ApiCredential = HeaderCredential | QueryCredential;
export interface ApiAccess {
    baseUrl: string;
    credentialPlacement: CredentialPlacement;
    credential: ApiCredential;
}
export declare type ApiAccessSource = () => Promise<ApiAccess>;
export interface IError {
    status: number;
    body: any;
}
export interface Request {
    query(q: any): this;
    header(field: string, val: string): this;
    send(data?: any): this;
    get<T>(): Promise<T>;
    post<T>(): Promise<T>;
    put<T>(): Promise<T>;
    patch<T>(): Promise<T>;
    delete<T>(): Promise<T>;
}
export declare class Client {
    private __accessSource;
    private constructor();
    static init(accessSource?: ApiAccessSource): Client;
    api(path: string): Request;
}
