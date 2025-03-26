const express = require('express');
const { queryServer } = require('source-server-query');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// API路由
app.get('/query', async (req, res) => {
    const { ip, port } = req.query;
    
    if (!ip || !port) {
        return res.status(400).json({ error: 'IP和端口参数必填' });
    }
    
    try {
        const options = {
            timeout: 3000,
            maxRetries: 2
        };
        
        // 查询服务器信息
        const info = await queryServer(ip, parseInt(port), options);
        
        // 处理玩家信息
        let players = [];
        if (info.players) {
            players = info.players.map(player => ({
                name: player.name || '未知',
                score: player.score || 0,
                duration: player.duration || 0
            }));
        }
        
        // 返回格式化数据
        res.json({
            name: info.name || '未知服务器',
            game: info.game || '未知游戏',
            map: info.map || '未知地图',
            version: info.version || '未知版本',
            players: players,
            maxPlayers: info.maxPlayers || 0,
            bots: info.bots || 0,
            serverType: getServerType(info.serverType),
            environment: getEnvironment(info.environment)
        });
    } catch (error) {
        console.error('查询错误:', error);
        res.status(500).json({ error: '无法连接到服务器: ' + error.message });
    }
});

// 辅助函数：获取服务器类型描述
function getServerType(type) {
    const types = {
        'd': '专用服务器',
        'l': '非专用服务器',
        'p': 'SourceTV中继'
    };
    return types[type] || '未知类型';
}

// 辅助函数：获取环境描述
function getEnvironment(env) {
    const environments = {
        'l': 'Linux',
        'w': 'Windows',
        'm': 'Mac'
    };
    return environments[env] || '未知环境';
}

// 默认路由
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});