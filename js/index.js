"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("superagent");
var base64 = require("js-base64");
;
;
var DEFAULT_API_ACCESS_SOURCE = function () { return Promise.resolve(null); };
var RequestClass = /** @class */ (function () {
    function RequestClass(__apiAccessSource, __path) {
        this.__apiAccessSource = __apiAccessSource;
        this.__path = __path;
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
    Object.defineProperty(RequestClass.prototype, "apiAccessSource", {
        get: function () {
            return (this.__apiAccessSource ? this.__apiAccessSource : DEFAULT_API_ACCESS_SOURCE);
        },
        enumerable: true,
        configurable: true
    });
    RequestClass.prototype.query = function (q) {
        this.__queries.push(q);
        return this;
    };
    ;
    RequestClass.prototype.header = function (field, val) {
        this.__headers[field.toLocaleLowerCase()] = val;
        return this;
    };
    RequestClass.prototype.send = function (data) {
        if (data) {
            this.__data.push(data);
        }
        return this;
    };
    RequestClass.prototype.fullPath = function (baseUrl) {
        return "" + baseUrl + this.__path;
    };
    RequestClass.prototype.placeCredentialInRequest = function (req, access) {
        if (access && access.credentialPlacement === "query" && access.credential) {
            var cred = access.credential;
            req = req.query(cred);
        }
        else if (access && access.credentialPlacement === "header" && access.credential) {
            var cred = access.credential;
            var field = (cred.field ? cred.field : "Authorization");
            var value = null;
            if (typeof cred.value === "string") {
                value = cred.value;
            }
            else {
                var tc = cred.value;
                var tokenType = (tc.tokenType ? tc.tokenType : "Basic");
                var token = null;
                if (typeof tc.token === "string")
                    token = tc.token;
                else if (tokenType === "Basic") {
                    var bc = tc.token;
                    if (bc && bc.username && bc.password) {
                        token = base64.Base64.encode(bc.username + ":" + bc.password);
                    }
                }
                if (token) {
                    value = tokenType + " " + token;
                }
            }
            if (value) {
                req = req.set(field, value);
            }
        }
        return req;
    };
    RequestClass.prototype.request = function (method, access) {
        var methodFunction = RequestClass.methodMap[method.toString()];
        var req = methodFunction.call(request, this.fullPath(access ? (access.baseUrl ? access.baseUrl : "") : ""));
        req = this.placeCredentialInRequest(req, access);
        if (this.__queries && this.__queries.length > 0) {
            for (var _i = 0, _a = this.__queries; _i < _a.length; _i++) {
                var q = _a[_i];
                req = req.query(q);
            }
        }
        if (this.__data && this.__data.length > 0) {
            for (var _b = 0, _c = this.__data; _b < _c.length; _b++) {
                var data = _c[_b];
                req = req.send(data);
            }
        }
        if (this.__headers) {
            for (var field in this.__headers)
                req = req.set(field, this.__headers[field]);
        }
        return req;
    };
    RequestClass.prototype.goodHTTPStatus = function (statusCode) {
        return ((statusCode >= 200 && statusCode < 300) || (statusCode === 304));
    };
    RequestClass.prototype.parseResponse = function (res) {
        var body = {};
        if (res.body) {
            body = res.body;
        }
        else if (res.text) {
            try {
                body = JSON.parse(res.text);
            }
            catch (e) {
                body = { msg: res.text };
            }
        }
        return (this.goodHTTPStatus(res.status) ? Promise.resolve(body) : Promise.reject({ status: res.status, body: body }));
    };
    RequestClass.prototype.get = function () {
        var _this = this;
        return this.apiAccessSource()
            .then(function (access) {
            return _this.request("GET", access);
        }).then(function (res) {
            return _this.parseResponse(res);
        });
    };
    RequestClass.prototype.post = function () {
        var _this = this;
        return this.apiAccessSource()
            .then(function (access) {
            return _this.request("POST", access);
        }).then(function (res) {
            return _this.parseResponse(res);
        });
    };
    RequestClass.prototype.put = function () {
        var _this = this;
        return this.apiAccessSource()
            .then(function (access) {
            return _this.request("PUT", access);
        }).then(function (res) {
            return _this.parseResponse(res);
        });
    };
    RequestClass.prototype.patch = function () {
        var _this = this;
        return this.apiAccessSource()
            .then(function (access) {
            return _this.request("PATCH", access);
        }).then(function (res) {
            return _this.parseResponse(res);
        });
    };
    RequestClass.prototype.delete = function () {
        var _this = this;
        return this.apiAccessSource()
            .then(function (access) {
            return _this.request("DELETE", access);
        }).then(function (res) {
            return _this.parseResponse(res);
        });
    };
    RequestClass.prototype.options = function () {
        var _this = this;
        return this.apiAccessSource()
            .then(function (access) {
            return _this.request("OPTIONS", access);
        }).then(function (res) {
            return _this.parseResponse(res);
        });
    };
    RequestClass.methodMap = null;
    return RequestClass;
}());
var Client = /** @class */ (function () {
    function Client(accessSource) {
        this.__accessSource = (accessSource ? accessSource : DEFAULT_API_ACCESS_SOURCE);
    }
    Client.init = function (accessSource) {
        return new Client(accessSource);
    };
    Client.prototype.api = function (path) {
        return new RequestClass(this.__accessSource, path);
    };
    return Client;
}());
exports.Client = Client;
//# sourceMappingURL=index.js.map