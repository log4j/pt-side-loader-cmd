'use strict';
var config = require('./config');
var $http = require('node-httpclient');


var service = {

}

service.sessionId = '';

service.url = config.transimission.host +':' + config.transimission.port + config.transimission.path;

console.log(service.url);

service.recheckSession = function (res) {
    if (res.status === 409) {

        service.sessionId = res.headers['x-transmission-session-id'];
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
        service.sessionId = res.headers['x-transmission-session-id'];
        return { result: !(!service.sessionId), data: service.sessionId }
    }, res => {
        console.log(res.headers);
        service.sessionId = res.headers['x-transmission-session-id'];
        return { result: !(!service.sessionId), data: service.sessionId }
    })
}

service.getTorrentList = () => {
    return $http.post(service.url, {
        method: 'torrent-get',
        arguments: {
            fields: [
                'id', 'name', 'status', 'totalSize'
            ]
        }
    }, {
            headers: {
                'x-transmission-session-id': service.sessionId
            }
        }).then(res => {
            console.log(res);
            return { result: true, data: res.data.arguments.torrents };
        }, res => {
            console.log(res);
            if (service.recheckSession(res))
                return service.getTorrentList();
            else
                return { result: false }
        })
}

service.postTorrent = (data) => {
    return $http.post(service.url, {
        method: 'torrent-add',
        arguments: {
            metainfo: data.torrent
        }
    }, {
            headers: {
                'x-transmission-session-id': service.sessionId
            }
        }).then(res => {
            console.log(res);
            return { result: true, data: res.data };
        }, res => {
            if (service.recheckSession(res))
                return service.postTorrent(data);
            else
                return { result: false }
        })
}

module.exports = service;