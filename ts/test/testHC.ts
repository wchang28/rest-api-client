import * as api from "../";

let hc_base_url = process.env["HC_BASE_URL"];
if (!hc_base_url) {
    console.error("!!! Error: env. var. 'HC_BASE_URL' is not set");
    process.exit(1);
}

let hc_api_key = process.env["HC_API_KEY"];
if (!hc_api_key) {
    console.error("!!! Error: env. var. 'HC_API_KEY' is not set");
    process.exit(1);
}

let hc_api_secret = process.env["HC_API_SECRET"];
if (!hc_api_secret) {
    console.error("!!! Error: env. var. 'HC_API_SECRET' is not set");
    process.exit(1);
}

console.log(`hc_base_url=${hc_base_url}`);
console.log(`hc_api_key=${hc_api_key}`);
console.log(`hc_api_secret=${hc_api_secret}`);

interface HouseCanaryApiAccess {
    baseUrl: string;
    apiKey: string;
    apiSecret: string;
}

function getApiAccessForHC(hcAccess: HouseCanaryApiAccess): api.ApiAccess {
    let apiAccess: api.ApiAccess = {
        baseUrl: hcAccess.baseUrl
        ,credentialPlacement: "header"
        ,credential: {
            value: {
                tokenType: "Basic"
                ,token: {
                    username: hcAccess.apiKey
                    ,password: hcAccess.apiSecret
                }
            }
        }
    };
    return apiAccess;
}

let client = api.Client.init(() => {
    return Promise.resolve(getApiAccessForHC({
        baseUrl: hc_base_url
        ,apiKey: hc_api_key
        ,apiSecret: hc_api_secret
    }));
});

/*
client.api("/v2/property/geocode")
.query({"address": "43 Valmonte Plaza", "zipcode": "90274"})
.get()
.then((value: any) => {
    console.log(`ret=\n${JSON.stringify(value, null, 2)}`);
}).catch((err: api.IError) => {
    console.error(`!!! Error: ${JSON.stringify(err)}`);
});
*/

let allPropertyComponents: string[] = [
    "property/census"
    ,"property/details"
    ,"property/details_enhanced"
    ,"property/flood"
    ,"property/listing_status"
    ,"property/ltv_details"
    ,"property/ltv_origination"
    ,"property/mortgage_lien"
    ,"property/mortgage_lien_all"
    ,"property/nod"
    ,"property/on_market"
    ,"property/owner_occupied"
    ,"property/rental_listing_status"
    ,"property/rental_on_market"
    ,"property/rental_value"
    ,"property/rental_value_within_block"
    ,"property/rental_yield"
    ,"property/sales_history"
    ,"property/school"
    ,"property/value"
    ,"property/value_by_quality"
    ,"property/value_details_adjusted"
    ,"property/value_forecast"
    ,"property/value_hpi_adjusted"
    ,"property/value_within_block"
];

client.api("/v2/property/component_mget")
.query({"address": "43 Valmonte Plaza", "zipcode": "90274", "components": allPropertyComponents.join(",")})
.get()
.then((value: any) => {
    console.log(`ret=\n${JSON.stringify(value, null, 2)}`);
}).catch((err: api.IError) => {
    console.error(`!!! Error: ${JSON.stringify(err)}`);
});
