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
var address = process.argv[2] ? process.argv[2] : "43 Valmonte Plaza";
var zipcode = process.argv[3] ? process.argv[3] : "90274";
console.log("hc_base_url=" + hc_base_url);
console.log("hc_api_key=" + hc_api_key);
console.log("hc_api_secret=" + hc_api_secret);
console.log("address=" + address);
console.log("zipcode=" + zipcode);
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
/*
client.api("/v2/property/geocode")
.query({address, zipcode})
.get()
.then((value: any) => {
    console.log(`ret=\n${JSON.stringify(value, null, 2)}`);
}).catch((err: api.IError) => {
    console.error(`!!! Error: ${JSON.stringify(err)}`);
});
*/
var allPropertyComponents = [
    "property/census",
    "property/details",
    "property/details_enhanced",
    "property/flood",
    "property/listing_status",
    "property/ltv_details",
    "property/ltv_origination",
    "property/mortgage_lien",
    "property/mortgage_lien_all",
    "property/nod",
    "property/on_market",
    "property/owner_occupied",
    "property/rental_listing_status",
    "property/rental_on_market",
    "property/rental_value",
    "property/rental_value_within_block",
    "property/rental_yield",
    "property/sales_history",
    "property/school",
    "property/value",
    "property/value_by_quality",
    "property/value_details_adjusted",
    "property/value_forecast",
    "property/value_hpi_adjusted",
    "property/value_within_block"
];
client.api("/v2/property/component_mget")
    .query({ address: address, zipcode: zipcode, components: allPropertyComponents.join(",") })
    .get()
    .then(function (value) {
    console.log("ret=\n" + JSON.stringify(value, null, 2));
}).catch(function (err) {
    console.error("!!! Error: " + JSON.stringify(err));
});
//# sourceMappingURL=testHC.js.map