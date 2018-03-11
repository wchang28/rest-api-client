import * as request from "superagent";
import * as base64 from "js-base64";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";

export type CredentialPlacement = ("query" | "header");

export interface BasicCredential {
    username: string;
    password: string;
};

export interface TokenCredential {
    tokenType?: string;
    token: string | BasicCredential;
};

export interface HeaderCredential {
    field?: string;
    value: string | TokenCredential;
}

export type QueryCredential = {[field: string]: string};

export type ApiCredential = HeaderCredential | QueryCredential;

export interface ApiAccess {
    baseUrl: string;
    credentialPlacement: CredentialPlacement;
    credential: ApiCredential;
}

export type ApiAccessSource = () => Promise<ApiAccess>;

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

class RequestClass implements Request {
    private __queries: any[];
    private __headers: {[field: string]: string};
    private __data: any[];
    private static methodMap: {[method: string]: (url: string, callback?: (err: any, res: request.Response) => void) => request.SuperAgentRequest } = null;
   
    constructor(private __apiAccessSource: ApiAccessSource, private __path: string) {
        this.__queries = [];
        this.__headers = {};
        this.__data = [];
        if (!RequestClass.methodMap) {
            RequestClass.methodMap = {};
            RequestClass.methodMap["GET"] = request.get;
            RequestClass.methodMap["POST"] = request.post;
            RequestClass.methodMap["PUT"] = request.put;
            RequestClass.methodMap["DELETE"] = request.delete;
            RequestClass.methodMap["PATCH"] = request.patch;
            RequestClass.methodMap["OPTIONS"] = request.options;
        }
    }
    private get apiAccessSource(): ApiAccessSource {return this.__apiAccessSource;}
    public query(q: any): this {
        this.__queries.push(q);
        return this;
    };
    public header(field: string, val: string): this {
        this.__headers[field.toLocaleLowerCase()] = val;
        return this;
    }
    public send(data?: any): this {
        if (data) {
            this.__data.push(data);
        }
        return this;
    }
    private fullPath(baseUrl: string): string {
        return `${baseUrl}${this.__path}`;
    }

    private placeCredentialInRequest(req: request.SuperAgentRequest, access: ApiAccess): request.SuperAgentRequest {
        if (access && access.credentialPlacement === "query" && access.credential) {
            let cred = access.credential as QueryCredential;
            req = req.query(cred);
        } else if (access && access.credentialPlacement === "header" && access.credential) {
            let cred = access.credential as HeaderCredential;
            let field = (cred.field ? cred.field : "Authorization");
            let value: string = null;
            if (typeof cred.value === "string") {
                value = cred.value;
            } else {
                let tc = cred.value as TokenCredential;
                let tokenType = (tc.tokenType ? tc.tokenType : "Basic");
                let token: string = null;
                if (typeof tc.token === "string")
                    token = tc.token;
                else if (tokenType === "Basic") {
                    let bc = tc.token as BasicCredential;
                    token = base64.Base64.encode(`${bc.username}:${bc.password}`);
                }
                if (token) {
                    value = `${tokenType} ${token}`;
                }
            }
            if (value) {
                req = req.set(field, value);
            }
        }
        return req;   
    }

    private request(method: HttpMethod, access: ApiAccess): request.SuperAgentRequest {
        let methodFunction = RequestClass.methodMap[method.toString()];
        let req: request.SuperAgentRequest = methodFunction.call(request, this.fullPath(access.baseUrl));
        req = this.placeCredentialInRequest(req, access);
        if (this.__queries && this.__queries.length > 0) {
            for (let q of this.__queries)
                req = req.query(q);
        }
        if (this.__data && this.__data.length > 0) {
            for (let data of this.__data)
                req = req.send(data);            
        }
        if (this.__headers) {
            for (let field in this.__headers)
                req = req.set(field, this.__headers[field]);
        }
        return req;
    }

    private goodHTTPStatus(statusCode: number): boolean {
        return ((statusCode >= 200 && statusCode < 300) || (statusCode === 304)); 
    }

    private parseResponse<T>(res: request.Response): Promise<T> {
        let body: any = {};
        if (res.body) {
            body = res.body;
        } else if (res.text) {
            try {
                body = JSON.parse(res.text);
            } catch(e) {
                body = {msg: res.text};
            }
        }
        return (this.goodHTTPStatus(res.status) ? Promise.resolve<T>(body): Promise.reject({status: res.status, body}));     
    }
    public get<T>(): Promise<T> {
        return this.apiAccessSource()
        .then((access: ApiAccess) => {
            return this.request("GET", access);
        }).then((res: request.Response) => {
            return this.parseResponse<T>(res);
        });
    }
    public post<T>(): Promise<T> {
        return this.apiAccessSource()
        .then((access: ApiAccess) => {
            return this.request("POST", access);
        }).then((res: request.Response) => {
            return this.parseResponse<T>(res);
        });
    }
    public put<T>(): Promise<T> {
        return this.apiAccessSource()
        .then((access: ApiAccess) => {
            return this.request("PUT", access);
        }).then((res: request.Response) => {
            return this.parseResponse<T>(res);
        });
    }
    public patch<T>(): Promise<T> {
        return this.apiAccessSource()
        .then((access: ApiAccess) => {
            return this.request("PATCH", access);
        }).then((res: request.Response) => {
            return this.parseResponse<T>(res);
        });
    }
    public delete<T>(): Promise<T> {
        return this.apiAccessSource()
        .then((access: ApiAccess) => {
            return this.request("DELETE", access);
        }).then((res: request.Response) => {
            return this.parseResponse<T>(res);
        });
    }
    public options<T>(): Promise<T> {
        return this.apiAccessSource()
        .then((access: ApiAccess) => {
            return this.request("OPTIONS", access);
        }).then((res: request.Response) => {
            return this.parseResponse<T>(res);
        });
    }
}

export class Client {
    private __accessSource: ApiAccessSource;
    private constructor(accessSource?: ApiAccessSource) {
        this.__accessSource = (accessSource ? accessSource : () => Promise.resolve<ApiAccess>(null));
    }
    public static init(accessSource?: ApiAccessSource): Client {
        return new Client(accessSource);
    }
    api(path: string): Request {
        return new RequestClass(this.__accessSource, path);
    }
}
