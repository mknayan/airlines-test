import history from "../history";
import $ from "jquery";
import Bowser from "bowser";

export const APP_VERSION = '1.0.0';

//For Production
export const BASE_URL = 'https://selise.mknayan.com/';
export const BASE_DOMAIN = '.mknayan.com';
export const API_URL = 'https://nmflightapi.azurewebsites.net/api/';

export const SITE = 'selise';
export const API_KEY = 'cp/W?';
export const DOWNTIME_ACCESS_CODE = "wewillbeup";

export const SITEDOWN_DATA = {
    downtime_status: 1,
    server_down: 1,
    downtime_access_validity: "invalid",
    downtime_message: '<h3>A technical error has occurred</h3><p>Please try again in a few minutes. Thanks!</p>',
};

export const SET_STORAGE = (name, value) => {
    return localStorage.setItem(name, value);
};
export const GET_STORAGE = name => {
    return localStorage.getItem(name);
};
export const REMOVE_STORAGE = name => {
    return localStorage.removeItem(name);
};
export const USER = "selise_user";

let COOKIE_EXP_DAY_P = 5;
if (GET_STORAGE("settings")) {
    const settings = JSON.parse(GET_STORAGE("settings"));
    COOKIE_EXP_DAY_P = settings.cookie_exp_day ? parseInt(settings.cookie_exp_day) : 7;
}
export const COOKIE_EXP_DAY = COOKIE_EXP_DAY_P;

export function SET_COOKIE(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + COOKIE_EXP_DAY * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function SET_LOGIN_COOKIE(data) {
    let expireAfter = new Date();
    //setting up cookie expire date after 10 minutes
    expireAfter.setMinutes(expireAfter.getMinutes() + 10)
    //now setup cookie
    document.cookie = USER + "=" + data + "; domain=" + BASE_DOMAIN + "; expires=" + expireAfter.toUTCString() + "; path=/";
}

export function DELETE_LOGIN_COOKIE() {
    let expireAfter = new Date();
    const exdays = -1;
    //setting up cookie expire date after 10 minutes
    expireAfter.setTime(expireAfter.getTime() + (exdays * 24 * 60 * 60 * 1000));
    //now setup cookie
    document.cookie = USER + "='data'; domain=" + BASE_DOMAIN + "; expires=" + expireAfter.toUTCString() + "; path=/";
}

export function GET_COOKIE(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function DELETE_COOKIE(cname) {
    var cvalue = "",
        exdays = -1;
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function AJAX_REQUEST(type = "GET", additional_url, data) {
    const c_user = JSON.parse(GET_STORAGE(USER));
    data.api_key = API_KEY;
    data.site = SITE;
    if (c_user) {
        // data.user_token = c_user.token;
    } else {
        history.push("/login");
    }

    let rdata = "";

    if (c_user) {
        // $.ajaxSetup({
        //     headers: {
        //       'Authorization': `Bearer ${c_user.token}`,
        //       'Access-Control-Allow-Headers': "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
        //     }
        // });
        // rdata = $.ajax({
        //     type: type,
        //     // beforeSend: function (xhr) {
        //     //     xhr.setRequestHeader ("Authorization", `Bearer ${c_user.token}`);
        //     // },
        //     // header: {
        //     //     'Authorization':`Bearer ${c_user.token}`
        //     // },
        //     url: API_URL + additional_url,
        //     data: data
        // });
        let promise = $.Deferred();
        $.ajax({
            type: type,
            url: API_URL + additional_url,
            data: data,
            headers: {
                'Authorization': `Bearer ${c_user.token}`
            },
            timeout: 60000,
            success: function (resp) {
                if (resp) {
                    if (typeof (resp) === 'object') {
                        if (resp.hasOwnProperty('response')) {
                            if (resp.response.hasOwnProperty('code')) {
                                promise.resolve(resp);
                            } else {
                                const respo = {
                                    "response": {
                                        "code": 5000,
                                        "status": "success",
                                        "message": "Something went wrong. Please try again.",
                                    }
                                };
                                promise.resolve(respo);
                            }
                        } else {
                            const respo = {
                                "response": {
                                    "code": 5000,
                                    "status": "success",
                                    "message": "Something went wrong. Please try again.",
                                }
                            };
                            promise.resolve(respo);
                        }
                    } else {
                        const respo = {
                            "response": {
                                "code": 5000,
                                "status": "success",
                                "message": "Something went wrong. Please try again.",
                            }
                        };
                        promise.resolve(respo);
                    }
                } else {
                    const respo = {
                        "response": {
                            "code": 5000,
                            "status": "success",
                            "message": "Something went wrong. Please refresh the page again.",
                        }
                    };
                    promise.resolve(respo);
                }
            },
            error: function (resp, textStatus) {
                if (textStatus === 'timeout') {
                    const respo = {
                        "response": {
                            "code": 5000,
                            "status": "success",
                            "message": "Connection timeout. Please try again.",
                        }
                    };
                    promise.resolve(respo);
                } else {
                    if (resp.status === 500) {
                        const respo = {
                            "response": {
                                "code": 5000,
                                "status": "success",
                                "message": "Something went wrong. Please try again.",
                                "originalMessage": resp.responseText,
                            }
                        };
                        promise.resolve(respo);
                    } else {
                        SET_STORAGE('settings', JSON.stringify(SITEDOWN_DATA));
                        history.push("/error");
                    }
                }
            }
        });
        rdata = promise.promise();
    } else {
        let promise = $.Deferred();
        $.ajax({
            type: type,
            url: API_URL + additional_url,
            data: data,
            timeout: 60000,
            success: function (resp) {
                if (resp) {
                    if (typeof (resp) === 'object') {
                        if (resp.hasOwnProperty('response')) {
                            if (resp.response.hasOwnProperty('code')) {
                                promise.resolve(resp);
                            } else {
                                const respo = {
                                    "response": {
                                        "code": 5000,
                                        "status": "success",
                                        "message": "Something went wrong. Please try again.",
                                    }
                                };
                                promise.resolve(respo);
                            }
                        } else {
                            const respo = {
                                "response": {
                                    "code": 5000,
                                    "status": "success",
                                    "message": "Something went wrong. Please try again.",
                                }
                            };
                            promise.resolve(respo);
                        }
                    } else {
                        const respo = {
                            "response": {
                                "code": 5000,
                                "status": "success",
                                "message": "Something went wrong. Please try again.",
                            }
                        };
                        promise.resolve(respo);
                    }
                } else {
                    const respo = {
                        "response": {
                            "code": 5000,
                            "status": "success",
                            "message": "Something went wrong. Please refresh the page again.",
                        }
                    };
                    promise.resolve(respo);
                }
            },
            error: function (resp, textStatus) {
                if (textStatus === 'timeout') {
                    const respo = {
                        "response": {
                            "code": 5000,
                            "status": "success",
                            "message": "Connection timeout. Please try again.",
                        }
                    };
                    promise.resolve(respo);
                } else {
                    if (resp.status === 500) {
                        const respo = {
                            "response": {
                                "code": 5000,
                                "status": "success",
                                "message": "Something went wrong. Please try again.",
                                "originalMessage": resp.responseText,
                            }
                        };
                        promise.resolve(respo);
                    } else {
                        SET_STORAGE('settings', JSON.stringify(SITEDOWN_DATA));
                        history.push("/error");
                    }
                }
            }
        });
        rdata = promise.promise();
        // rdata = $.ajax({
        //     type: type,
        //     url: API_URL + additional_url,
        //     data: data
        // });
    }

    rdata.then(results => {
        const response = results.response;
        if (parseInt(response.code) === 4001 || parseInt(response.code) === 1001) {
            history.push("/login");
            // const c_user = JSON.parse(GET_STORAGE(USER));
            // if(c_user){
            //     console.log(c_user);
            // }
        }
        // if(parseInt(response.code)===1004){
        //     if(history.goBack(1)){
        //         history.goBack(1);
        //     }else{
        //         history.push('/my-account');
        //     }
        // }
    });
    return rdata;
}

export function AJAX_REQUEST_WITH_FILE(type = "GET", additional_url, data) {
    const c_user = JSON.parse(GET_STORAGE(USER));
    data.append("api_key", API_KEY);
    data.append("site", SITE);
    // if (c_user) {
    //     data.append("user_token", c_user.token);
    // }

    let promise = $.Deferred();
    if (c_user) {
        $.ajax({
            type: type,
            url: API_URL + additional_url,
            data: data,
            headers: {
                'Authorization': `Bearer ${c_user.token}`
            },
            dataType: "JSON",
            processData: false,
            contentType: false,
            timeout: 120000,
            success: function (resp) {
                if (resp) {
                    if (typeof (resp) === 'object') {
                        if (resp.hasOwnProperty('response')) {
                            if (resp.response.hasOwnProperty('code')) {
                                promise.resolve(resp);
                            } else {
                                const respo = {
                                    "response": {
                                        "code": 5000,
                                        "status": "success",
                                        "message": "Something went wrong. Please try again.",
                                    }
                                };
                                promise.resolve(respo);
                            }
                        } else {
                            const respo = {
                                "response": {
                                    "code": 5000,
                                    "status": "success",
                                    "message": "Something went wrong. Please try again.",
                                }
                            };
                            promise.resolve(respo);
                        }
                    } else {
                        const respo = {
                            "response": {
                                "code": 5000,
                                "status": "success",
                                "message": "Something went wrong. Please try again.",
                            }
                        };
                        promise.resolve(respo);
                    }
                } else {
                    const respo = {
                        "response": {
                            "code": 5000,
                            "status": "success",
                            "message": "Something went wrong. Please refresh the page again.",
                        }
                    };
                    promise.resolve(respo);
                }
            },
            error: function (resp, textStatus) {
                if (textStatus === 'timeout') {
                    const respo = {
                        "response": {
                            "code": 5000,
                            "status": "success",
                            "message": "Connection timeout. Please try again.",
                        }
                    };
                    promise.resolve(respo);
                } else {
                    if (resp.status === 500) {
                        const respo = {
                            "response": {
                                "code": 5000,
                                "status": "success",
                                "message": "Something went wrong. Please try again.",
                                "originalMessage": resp.responseText,
                            }
                        };
                        promise.resolve(respo);
                    } else {
                        SET_STORAGE('settings', JSON.stringify(SITEDOWN_DATA));
                        history.push("/error");
                    }
                }
            }
        });
    } else {
        $.ajax({
            type: type,
            url: API_URL + additional_url,
            data: data,
            dataType: "JSON",
            processData: false,
            contentType: false,
            timeout: 120000,
            success: function (resp) {
                if (resp) {
                    if (typeof (resp) === 'object') {
                        if (resp.hasOwnProperty('response')) {
                            if (resp.response.hasOwnProperty('code')) {
                                promise.resolve(resp);
                            } else {
                                const respo = {
                                    "response": {
                                        "code": 5000,
                                        "status": "success",
                                        "message": "Something went wrong. Please try again.",
                                    }
                                };
                                promise.resolve(respo);
                            }
                        } else {
                            const respo = {
                                "response": {
                                    "code": 5000,
                                    "status": "success",
                                    "message": "Something went wrong. Please try again.",
                                }
                            };
                            promise.resolve(respo);
                        }
                    } else {
                        const respo = {
                            "response": {
                                "code": 5000,
                                "status": "success",
                                "message": "Something went wrong. Please try again.",
                            }
                        };
                        promise.resolve(respo);
                    }
                } else {
                    const respo = {
                        "response": {
                            "code": 5000,
                            "status": "success",
                            "message": "Something went wrong. Please refresh the page again.",
                        }
                    };
                    promise.resolve(respo);
                }
            },
            error: function (resp, textStatus) {
                if (textStatus === 'timeout') {
                    const respo = {
                        "response": {
                            "code": 5000,
                            "status": "success",
                            "message": "Connection timeout. Please try again.",
                        }
                    };
                    promise.resolve(respo);
                } else {
                    if (resp.status === 500) {
                        const respo = {
                            "response": {
                                "code": 5000,
                                "status": "success",
                                "message": "Something went wrong. Please try again.",
                                "originalMessage": resp.responseText,
                            }
                        };
                        promise.resolve(respo);
                    } else {
                        SET_STORAGE('settings', JSON.stringify(SITEDOWN_DATA));
                        history.push("/error");
                    }
                }
            }
        });
    }

    return promise.promise();
    // return $.ajax({
    //     type: type,
    //     url: API_URL + additional_url,
    //     data: data,
    //     dataType: "JSON",
    //     processData: false,
    //     contentType: false
    // });
}

export function AJAX_SERVICE_LOGIN_REQUEST(type = 'GET', additional_url, data) {
    let new_data = new FormData();
    new_data.append('api_key', API_KEY);
    new_data.append('site', SITE);

    let promise = $.Deferred();
    $.ajax({
        type: type,
        url: API_URL + additional_url,
        // data: data,
        data: new_data,
        headers: {
            'Authorization': `Bearer ${data.user_token}`
        },
        dataType: "JSON",
        processData: false,
        contentType: false,
        timeout: 60000,
        success: function (resp) {
            if (resp) {
                if (typeof (resp) === 'object') {
                    if (resp.hasOwnProperty('response')) {
                        if (resp.response.hasOwnProperty('code')) {
                            promise.resolve(resp);
                        } else {
                            const respo = {
                                "response": {
                                    "code": 5000,
                                    "status": "success",
                                    "message": "Something went wrong. Please try again.",
                                }
                            };
                            promise.resolve(respo);
                        }
                    } else {
                        const respo = {
                            "response": {
                                "code": 5000,
                                "status": "success",
                                "message": "Something went wrong. Please try again.",
                            }
                        };
                        promise.resolve(respo);
                    }
                } else {
                    const respo = {
                        "response": {
                            "code": 5000,
                            "status": "success",
                            "message": "Something went wrong. Please try again.",
                        }
                    };
                    promise.resolve(respo);
                }
            } else {
                const respo = {
                    "response": {
                        "code": 5000,
                        "status": "success",
                        "message": "Something went wrong. Please refresh the page again.",
                    }
                };
                promise.resolve(respo);
            }
        },
        error: function (resp, textStatus) {
            if (textStatus === 'timeout') {
                const respo = {
                    "response": {
                        "code": 5000,
                        "status": "success",
                        "message": "Connection timeout. Please try again.",
                    }
                };
                promise.resolve(respo);
            } else {
                if (resp.status === 500) {
                    const respo = {
                        "response": {
                            "code": 5000,
                            "status": "success",
                            "message": "Something went wrong. Please try again.",
                            "originalMessage": resp.responseText,
                        }
                    };
                    promise.resolve(respo);
                } else {
                    SET_STORAGE('settings', JSON.stringify(SITEDOWN_DATA));
                    history.push("/error");
                }
            }
        }
    });

    return promise.promise();
}

export function AJAX_PUBLIC_REQUEST(type = "GET", additional_url, data) {
    data.api_key = API_KEY;
    data.site = SITE;

    let promise = $.Deferred();
    $.ajax({
        type: type,
        url: API_URL + additional_url,
        data: data,
        timeout: 60000,
        success: function (resp) {
            if (resp) {
                promise.resolve(resp);
            } else {
                const respo = {
                    "response": {
                        "code": 5000,
                        "status": "success",
                        "message": "Something went wrong. Please refresh the page again.",
                    }
                };
                promise.resolve(respo);
            }
        },
        error: function (resp, textStatus) {
            if (textStatus === 'timeout') {
                const respo = {
                    "response": {
                        "code": 5000,
                        "status": "success",
                        "message": "Connection timeout. Please try again.",
                    }
                };
                promise.resolve(respo);
            } else {
                if (resp.status === 500) {
                    const respo = {
                        "response": {
                            "code": 5000,
                            "status": "success",
                            "message": "Something went wrong. Please try again.",
                            "originalMessage": resp.responseText,
                        }
                    };
                    promise.resolve(respo);
                } else {

                    SET_STORAGE('settings', JSON.stringify(SITEDOWN_DATA));
                    history.push("/error");

                }
            }
        }
    });
    return promise.promise();

    // return $.ajax({
    //     type: type,
    //     url: API_URL + additional_url,
    //     data: data
    // });
}

export function AJAX_ACCOUNT_KIT_REQUEST(data) {
    const token_exchange_url =
        "https://graph.accountkit.com/" +
        data.account_kit_api_version +
        "/access_token?grant_type=authorization_code&code=" +
        data.code +
        "&access_token=AA|" +
        data.facebook_app_id +
        "|" +
        data.account_kit_app_secret;

    return $.ajax({
        type: "GET",
        url: token_exchange_url,
        data: {}
    }).then(results => {
        const user_id = results.id;
        const user_access_token = results.access_token;
        const refresh_interval = results.token_refresh_interval_sec;

        const me_endpoint_url =
            "https://graph.accountkit.com/" + data.account_kit_api_version + "/me?access_token=" + user_access_token;
        return $.ajax({
            type: "GET",
            url: me_endpoint_url,
            data: {}
        });
    });
}
