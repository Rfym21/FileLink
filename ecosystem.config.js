const config = require('./src/config')

module.exports = {
  apps: [{
    name: 'WebDocSystem',
    script: './src/server.js',
    instances: '1',
    // 多进程模式
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: config.Service.port
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: config.Service.port
    },
    // 监听文件变化
    watch: false,
    // 最大内存
    max_memory_restart: '1024M',
    // 最小运行时间
    min_uptime: '10s',
    // 最大重启次数
    max_restarts: 10
  }]
}