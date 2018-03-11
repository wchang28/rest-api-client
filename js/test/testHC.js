"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var api = require("../");
var hc_base_url = process.env["HC_BASE_URL"];
if (!hc_base_url) {
    console.error("!!! Error: env. var. 'HC_BASE_URL' is not set");
    process.exit(1);
}
var hc_api_key = process.env["HC_API_KEY"];
if (!hc_api_key) {
    console.error("!!! Error: env. var. 'HC_API_KEY' is not set");
    process.exit(1);
}
var hc_api_secret = process.env["HC_API_SECRET"];
if (!hc_api_secret) {
    console.error("!!! Error: env. var. 'HC_API_SECRET' is not set");
    process.exit(1);
}
console.log("hc_base_url=" + hc_base_url);
console.log("hc_api_key=" + hc_api_key);
console.log("hc_api_secret=" + hc_api_secret);
function getApiAccessForHC(hcAccess) {
    var apiAccess = {
        baseUrl: hcAccess.baseUrl,
        credentialPlacement: "header",
        credential: {
            value: {
                tokenType: "Basic",
                token: {
                    username: hcAccess.apiKey,
                    password: hcAccess.apiSecret
                }
            }
        }
    };
    return apiAccess;
}
var client = api.Client.init(function () {
    return Promise.resolve(getApiAccessForHC({
        baseUrl: hc_base_url,
        apiKey: hc_api_key,
        apiSecret: hc_api_secret
    }));
});
client.api("/v2/property/geocode")
    .query({ "address": "43 Valmonte Plaza", "zipcode": "90274" })
    .get()
    .then(function (value) {
    console.log("ret=\n" + JSON.stringify(value, null, 2));
}).catch(function (err) {
    console.error("!!! Error: " + JSON.stringify(err));
});
//# sourceMappingURL=testHC.js.map