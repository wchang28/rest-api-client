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

let hcClient = api.Client.init(() => {
    return Promise.resolve(getApiAccessForHC({
        baseUrl: hc_base_url
        ,apiKey: hc_api_key
        ,apiSecret: hc_api_secret
    }));
});

hcClient.api("/v2/property/geocode")
.query({"address": "43 Valmonte Plaza", "zipcode": "90274"})
.get()
.then((value: any) => {
    console.log(`ret=\n${JSON.stringify(value, null, 2)}`);
}).catch((err: api.IError) => {
    console.error(`!!! Error: ${JSON.stringify(err)}`);
});