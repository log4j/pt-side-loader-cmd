'use strict';
var config = require('./config');
var torrentService = require('./torrent-service');

const io = require('socket.io-client')
var service = {
    socket: null,
    server: {}
};

service.connectPtSideServer = () => {
    console.log('start connecting Transimission...');
    torrentService.initSession().then(res => {
        // console.log(res);
        torrentService.getTorrentList().then(dd => {
            if (dd && dd.result)
                console.log('Current Seeding:', dd.data.length);
        })
    })
    console.log('start connecting PT Server');

    service.socket = io(config.server.host);
    service.socket.on('credentials_require', data => {
        console.log(data);
        service.socket.emit('credentials_verify', {
            username: config.account.username,
            password: config.account.password,
            device: config.account.deviceId,
            folders: config.folders
        });
    });

    service.socket.on('credentials_confirmed', data => {
        console.log(data);
        if (data && data.result) {

            service.server.state = 'connected';
            service.server.id = data.data;
            service.serverUpdated = new Date();
            console.log('updated!!!!');
        }
    })
    service.socket.on('welcome', function (data) {
        console.log(data);

        // Respond with a message including this clients' id sent from the server
        service.socket.emit('i am client', {
            data: 'foo!',
            id: data.id
        });
    });
    service.socket.on('time', function (data) {
        console.log(data);
    });
    service.socket.on('error', data => {
        console.log(data);
    });
    service.socket.on('message', data => {
        console.log(data);
    });

    service.socket.on('fetch_torrents', (data, fn) => {
        // console.log(data);
        // fn(['a','b']);

        torrentService.getTorrentList().then(res => {
            fn(res.data);
        });

    });

    service.socket.on('post_torrent', (data, fn) => {
        console.log('post_torrent', data);
        // fn(['a','b']);
        torrentService.postTorrent(data).then(res => {
            fn(res.data);
        });
    });

    // service.socket.on('fetch_folder', (data, fn) => {
    //     // fn(['a','b']);
    //     torrentService.postTorrent(data).then(res => {
    //         fn(res.data);
    //     });
    // });




    service.socket.on('disconnect', function () {
        console.log('user disconnected');
        service.server.state = 'disconnect';
        service.server.id = '';
        // $scope.$apply();
    });
}


service.disconnectPtSideServer = () => {
    if (service.socket) {
        service.socket.disconnect(true);
    }
}

module.exports = service;