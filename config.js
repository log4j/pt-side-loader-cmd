module.exports = {
    transimission: {
        host: 'http://127.0.0.1',
        path: '/transmission/rpc',
        port: 9091,
		authorization: true,
		username: 'yangmang',
        password: 'mission'
    },
    server: {
        host: 'http://word.mangs.site:5000'
    },
    account: {
        username: 'yangmang',
        password: '',
        deviceId: 'DSM Transmission'
    },
    folders: [
        {
            label: 'movie',
            value: ''
        }
    ]
}
