'use strict';
var config = require('./config');
var $ = require('node-httpclient');

var httpclient = require('http-client')
var headerAuth = null;
if (config.transimission.authorization) {
    headerAuth = "Basic " + new Buffer(config.transimission.username + ":" + config.transimission.password).toString("base64");
}



var $http = {
    get: (url, opt) => {

    },
    post: (url, data, opt) => {
        let headers = opt ? opt.headers : {};
        if (headerAuth) {
            headers["Authorization"] = headerAuth;
        }
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/json',
                data: data,
                // dataType: "json",
                success: (data, status, headers) => {
                    // console.log(data);
                    resolve({
                        data: data,
                        status: status,
                        headers: headers
                    })
                },
                error: (data, status, headers) => {
                    // console.log(data, status, headers);
                    reject({
                        data: data,
                        status: status,
                        headers: headers
                    });
                },
                headers: headers
            })
        });
    }
}

// var fetch = {
//     get: null,
//     post: httpclient.createFetch(
//         httpclient.method('POST'),

//     )
// }
var possibleKeys = ['x-transmission-session-id', 'X-Transmission-Session-Id'];

var service = {

}

service.sessionId = '';
service.sessionKey = '';

service.url = config.transimission.host + ':' + config.transimission.port + config.transimission.path;

console.log('Transmission connection ', service.url);

service.recheckSession = function (res) {
    if (res.status === 409) {
        // console.log(res.headers);
        for (var i = 0; i < possibleKeys.length; i++) {
            if (res.headers[possibleKeys[i]]) {
                service.sessionKey = possibleKeys[i];
            }
        }
        service.sessionId = res.headers[service.sessionKey];
        service.headers = {};
        service.headers[service.sessionKey] = service.sessionId ? service.sessionId : 'empty';

        if (service.sessionId)
            return true;
        else
            return false;
    }
    return false;
}

service.initSession = () => {
    return $http.post(service.url, {
        method: 'session-get'
    }).then(res => {
        console.log('Transmission session created!');

        service.recheckSession(res);
        service.sessionId = res.headers[service.sessionKey];

        return {
            result: !(!service.sessionId),
            data: service.sessionId
        }
    }, res => {
        console.log('Try to build session with Transmission...');
        // console.log(res);
        service.recheckSession(res);

        service.sessionId = res.headers[service.sessionKey];
        if (!service.sessionId) {
            console.log('Can not connect to Transmission. Please make sure Transmission is running and Remote is enabled!');
        }
        return {
            result: !(!service.sessionId),
            data: service.sessionId
        }
    })
}

service.getTorrentList = () => {
    return $http.post(service.url, {
        method: 'torrent-get',
        arguments: {
            fields: [
                'id',
                'name',
                'status',
                'totalSize',
                'rateDownload',
                'rateUpload',
                'startDate',
                'downloadedEver',
                'uploadedEver'
            ]
        }
    }, {
            headers: service.headers
        }).then(res => {
            // console.log(res);
            return {
                result: true,
                data: res.data.arguments.torrents
            };
        }, res => {
            // console.log(res);
            if (service.recheckSession(res))
                return service.getTorrentList();
            else
                return {
                    result: false
                }
        })
}

service.postTorrent = (data) => {
    let body = {
        method: 'torrent-add',
        arguments: {
            metainfo: data.torrent
        }
    };

    if (data.target) {
        body.arguments["download-dir"] = data.target;
    }

    return $http.post(service.url, body, {
        headers: service.headers
    }).then(res => {
        console.log(res);
        return {
            result: true,
            data: res.data
        };
    }, res => {
        if (service.recheckSession(res))
            return service.postTorrent(data);
        else
            return {
                result: false
            }
    })
}

module.exports = service;
