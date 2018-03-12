"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var api = require("../");
var request = require("superagent");
var salesforce_token_grant = process.env["SALESFORCE_TOKEN_GRANT_URL"];
if (!salesforce_token_grant) {
    console.error("!!! Error: env. var. 'SALESFORCE_TOKEN_GRANT_URL' is not set");
    process.exit(1);
}
var salesforce_client_id = process.env["SALESFORCE_CLIENT_ID"];
if (!salesforce_client_id) {
    console.error("!!! Error: env. var. 'SALESFORCE_CLIENT_ID' is not set");
    process.exit(1);
}
var salesforce_client_secret = process.env["SALESFORCE_CLIENT_SECRET"];
if (!salesforce_client_secret) {
    console.error("!!! Error: env. var. 'SALESFORCE_CLIENT_SECRET' is not set");
    process.exit(1);
}
var salesforce_username = process.env["SALESFORCE_USERNAME"];
if (!salesforce_username) {
    console.error("!!! Error: env. var. 'SALESFORCE_USERNAME' is not set");
    process.exit(1);
}
var salesforce_password = process.env["SALESFORCE_PASSWORD"];
if (!salesforce_password) {
    console.error("!!! Error: env. var. 'SALESFORCE_PASSWORD' is not set");
    process.exit(1);
}
console.log("salesforce_token_grant=" + salesforce_token_grant);
console.log("salesforce_client_id=" + salesforce_client_id);
console.log("salesforce_client_secret=" + salesforce_client_secret);
console.log("salesforce_username=" + salesforce_username);
console.log("salesforce_password=" + salesforce_password);
function SalesforceLogin() {
    return new Promise(function (resolve, reject) {
        request
            .post(salesforce_token_grant)
            .type('form')
            .send({ grant_type: 'password' })
            .send({ client_id: salesforce_client_id })
            .send({ client_secret: salesforce_client_secret })
            .send({ username: salesforce_username })
            .send({ password: salesforce_password })
            .end(function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                var body = (res.body ? res.body : JSON.parse(res.text ? res.text : "{}"));
                if (res.status !== 200)
                    reject(body);
                else
                    resolve(body);
            }
        });
    });
}
function getApiAccessForSalesforce(auth) {
    var apiAccess = {
        baseUrl: auth.instance_url,
        credentialPlacement: "header",
        credential: {
            value: {
                tokenType: auth.token_type,
                token: auth.access_token
            }
        }
    };
    return apiAccess;
}
var client = api.Client.init(function () { return SalesforceLogin().then(function (auth) { return getApiAccessForSalesforce(auth); }); });
client
    .api("/services/data/v41.0/chatter/users/me")
    .get()
    .then(function (value) {
    console.log("ret=\n" + JSON.stringify(value, null, 2));
}).catch(function (err) {
    console.error("!!! Error: " + JSON.stringify(err));
});
//# sourceMappingURL=testSF.js.map