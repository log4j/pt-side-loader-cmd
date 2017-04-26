module.exports = {
    transimission: {
        host: 'http://127.0.0.1', //Transmission访问host
        path: '/transmission/rpc', //Transmission访问path
        port: 9091, //Transmission访问端口
        authorization: true, //是否需要验证
        username: '', //如需验证, 账号和密码
        password: ''
    },
    server: {
        host: 'http://word.mangs.site:5000' // PT side loader 所需的服务器, 请勿修改
    },
    account: {
        username: '', // 葡萄账号, 填写错误会导致手机端无法找到你的Transmission信息, 也可能把你的Transmission暴露给其他人
        password: '', // 暂时不需要
        deviceId: 'PT-Side-Loader'  // Transmission在手机客户端的的显示名称
    },
    folders: [ // 使用手机端的下载功能时, 可选择的下载路径. 请安如下规范填写. 如果路径错误, 将会使用Transmission的默认下载路径
        {
            label: 'Movie',
            value: '/volume2/media'
        }, {
            label: 'Shows',
            value: '/volume2/shows'
        }
    ]
}
