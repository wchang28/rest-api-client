import * as api from "../";

let smartystreets_base_url = process.env["SMARTYSTREETS_BASE_URL"];
if (!smartystreets_base_url) {
    console.error("!!! Error: env. var. 'SMARTYSTREETS_BASE_URL' is not set");
    process.exit(1);
}

let smartystreets_auth_id = process.env["SMARTYSTREETS_AUTH_ID"];
if (!smartystreets_auth_id) {
    console.error("!!! Error: env. var. 'SMARTYSTREETS_AUTH_ID' is not set");
    process.exit(1);
}

let smartystreets_auth_token = process.env["SMARTYSTREETS_AUTH_TOKEN"];
if (!smartystreets_auth_token) {
    console.error("!!! Error: env. var. 'SMARTYSTREETS_AUTH_TOKEN' is not set");
    process.exit(1);
}

console.log(`smartystreets_base_url=${smartystreets_base_url}`);
console.log(`smartystreets_auth_id=${smartystreets_auth_id}`);
console.log(`smartystreets_auth_token=${smartystreets_auth_token}`);

interface SmartyStreetsApiAccess {
    baseUrl: string;
    authId: string;
    authToken: string;
}

function getApiAccessForSmartyStreets(ssAccess: SmartyStreetsApiAccess): api.ApiAccess {
    let apiAccess: api.ApiAccess = {
        baseUrl: ssAccess.baseUrl
        ,credentialPlacement: "query"
        ,credential: {
            "auth-id": ssAccess.authId
            ,"auth-token": ssAccess.authToken
        }
    };
    return apiAccess;
}

let client = api.Client.init(() => {
    return Promise.resolve(getApiAccessForSmartyStreets({
        baseUrl: smartystreets_base_url
        ,authId: smartystreets_auth_id
        ,authToken: smartystreets_auth_token
    }));
});

client
.api("/street-address")
.send([{
    input_id: "0"
    ,street: "43 Valmonte Plaza"
    ,zipcode: "90274"
    ,candidates: 1
}]).post()
.then((value: any) => {
    console.log(`ret=\n${JSON.stringify(value, null, 2)}`);
}).catch((err: api.IError) => {
    console.error(`!!! Error: ${JSON.stringify(err)}`);
});
