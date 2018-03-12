import * as api from "../";
import * as request from "superagent";

let salesforce_token_grant = process.env["SALESFORCE_TOKEN_GRANT_URL"];
if (!salesforce_token_grant) {
    console.error("!!! Error: env. var. 'SALESFORCE_TOKEN_GRANT_URL' is not set");
    process.exit(1);
}

let salesforce_client_id = process.env["SALESFORCE_CLIENT_ID"];
if (!salesforce_client_id) {
    console.error("!!! Error: env. var. 'SALESFORCE_CLIENT_ID' is not set");
    process.exit(1);
}

let salesforce_client_secret = process.env["SALESFORCE_CLIENT_SECRET"];
if (!salesforce_client_secret) {
    console.error("!!! Error: env. var. 'SALESFORCE_CLIENT_SECRET' is not set");
    process.exit(1);
}

let salesforce_username = process.env["SALESFORCE_USERNAME"];
if (!salesforce_username) {
    console.error("!!! Error: env. var. 'SALESFORCE_USERNAME' is not set");
    process.exit(1);
}

let salesforce_password = process.env["SALESFORCE_PASSWORD"];
if (!salesforce_password) {
    console.error("!!! Error: env. var. 'SALESFORCE_PASSWORD' is not set");
    process.exit(1);
}

console.log(`salesforce_token_grant=${salesforce_token_grant}`);
console.log(`salesforce_client_id=${salesforce_client_id}`);
console.log(`salesforce_client_secret=${salesforce_client_secret}`);
console.log(`salesforce_username=${salesforce_username}`);
console.log(`salesforce_password=${salesforce_password}`);

interface SalesforceAuthResult {
    instance_url: string;
    access_token: string;
    refresh_token?: string;
    id: string;
    token_type: string;
    issued_at: string;
    signature: string;
}

function SalesforceLogin() : Promise<SalesforceAuthResult> {
    return new Promise<SalesforceAuthResult>((resolve: (value: SalesforceAuthResult) => void, reject: (err: any) => void) => {
        request
        .post(salesforce_token_grant)
        .type('form')
        .send({grant_type: 'password'})
        .send({client_id: salesforce_client_id})
        .send({client_secret: salesforce_client_secret})
        .send({username: salesforce_username})
        .send({password: salesforce_password})
        .end((err: any, res: request.Response) => {
            if (err) {
                reject(err);
            } else {
                let body = (res.body ? res.body : JSON.parse(res.text ? res.text : "{}"));
                if (res.status !== 200)
                    reject(body);
                else
                    resolve(body);
            }
        });
    });
}

function getApiAccessForSalesforce(auth: SalesforceAuthResult): api.ApiAccess {
    let apiAccess: api.ApiAccess = {
        baseUrl: auth.instance_url
        ,credentialPlacement: "header"
        ,credential: {
            value: {
                tokenType: auth.token_type
                ,token: auth.access_token
            }
        }
    };
    return apiAccess;
}

let client = api.Client.init(() => SalesforceLogin().then((auth: SalesforceAuthResult) => getApiAccessForSalesforce(auth)));

client
.api("/services/data/v41.0/chatter/users/me")
.get()
.then((value: any) => {
    console.log(`ret=\n${JSON.stringify(value, null, 2)}`);
}).catch((err: api.IError) => {
    console.error(`!!! Error: ${JSON.stringify(err)}`);
});