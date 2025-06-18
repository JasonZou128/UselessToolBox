const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const mysql = require('mysql2/promise');
const path = require('path');
const xmlparser = require('express-xml-bodyparser');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xmlparser());
app.use(express.static('.'));

// 微信公众号配置
const WECHAT_CONFIG = {
    token: process.env.WECHAT_TOKEN || 'your_wechat_token',
    appid: process.env.WECHAT_APPID || 'your_app_id',
    appsecret: process.env.WECHAT_APPSECRET || 'your_app_secret'
};

// 数据库配置
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'equipment_repair',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// 创建数据库连接池
const pool = mysql.createPool(DB_CONFIG);

// 微信access_token缓存
let accessToken = null;
let tokenExpireTime = 0;

// 验证微信服务器
app.get('/wechat', (req, res) => {
    const { signature, timestamp, nonce, echostr } = req.query;
    
    // 验证签名
    const token = WECHAT_CONFIG.token;
    const tmpArr = [token, timestamp, nonce].sort();
    const tmpStr = tmpArr.join('');
    const tmpSign = crypto.createHash('sha1').update(tmpStr).digest('hex');
    
    if (tmpSign === signature) {
        res.send(echostr);
    } else {
        res.send('Invalid signature');
    }
});

// 处理微信消息
app.post('/wechat', async (req, res) => {
    try {
        const { xml } = req.body;
        
        if (!xml) {
            return res.send('success');
        }
        
        const msgType = xml.msgtype ? xml.msgtype[0] : xml.MsgType[0];
        const fromUser = xml.fromusername ? xml.fromusername[0] : xml.FromUserName[0];
        const toUser = xml.tousername ? xml.tousername[0] : xml.ToUserName[0];
        
        let response = '';
        
        switch (msgType) {
            case 'text':
                const content = xml.content ? xml.content[0] : xml.Content[0];
                response = await handleTextMessage(fromUser, content);
                break;
                
            case 'event':
                const event = xml.event ? xml.event[0] : xml.Event[0];
                const eventKey = xml.eventkey ? xml.eventkey[0] : (xml.EventKey ? xml.EventKey[0] : '');
                response = await handleEvent(fromUser, event, eventKey);
                break;
                
            default:
                response = createTextMessage(fromUser, toUser, '欢迎使用设备维修管理系统！');
        }
        
        res.set('Content-Type', 'application/xml');
        res.send(response);
        
    } catch (error) {
        console.error('处理微信消息错误:', error);
        res.send('success');
    }
});

// 处理文本消息
async function handleTextMessage(fromUser, content) {
    let replyContent = '';
    
    // 检查用户是否存在
    const user = await getUserInfo(fromUser);
    
    if (content === '帮助' || content === 'help') {
        replyContent = `🔧 设备维修管理系统帮助

📱 功能菜单：
• 发送"报修"进行设备报修
• 发送"查询"查看维修进度
• 发送"角色"查看当前角色
• 发送"申请"申请权限升级

👥 角色说明：
• 普通用户：设备报修、查询进度
• 维修人员：处理维修任务
• 管理员：用户管理、审核权限

🔗 网页版：点击菜单进入完整功能界面`;
    
    } else if (content === '报修') {
        replyContent = `🔧 设备故障报修

请点击下方菜单"报修管理"进入详细报修页面，或直接回复以下格式：

格式：报修#设备类型#设备编号#故障描述
示例：报修#包装设备#PKG-001#传送带异响

⚡ 紧急故障请直接致电：400-1234-567`;
        
    } else if (content === '查询') {
        const repairs = await getUserRepairs(fromUser);
        if (repairs.length === 0) {
            replyContent = '📋 您还没有提交过报修单\n\n发送"报修"开始报修流程';
        } else {
            replyContent = '📋 您的维修记录：\n\n';
            repairs.slice(0, 5).forEach((repair, index) => {
                const status = getStatusText(repair.status);
                replyContent += `${index + 1}. ${repair.device_type}-${repair.device_id}\n`;
                replyContent += `   状态：${status}\n`;
                replyContent += `   时间：${formatDate(repair.create_time)}\n\n`;
            });
            replyContent += '点击菜单"维修记录"查看详细信息';
        }
        
    } else if (content === '角色') {
        const roleText = user ? getRoleText(user.role) : '普通用户';
        replyContent = `👤 您的当前角色：${roleText}\n\n`;
        if (!user || user.role === 'user') {
            replyContent += '💡 想要申请更高权限？发送"申请"了解详情';
        }
        
    } else if (content === '申请') {
        replyContent = `📝 权限申请说明

🔧 维修人员权限：
• 处理维修任务
• 更新维修状态
• 查看维修记录

👨‍💻 管理员权限：
• 用户管理
• 权限审核
• 数据导出

📋 申请方式：
点击菜单"权限申请"填写详细申请表单`;

    } else if (content.startsWith('报修#')) {
        // 解析报修信息
        const parts = content.split('#');
        if (parts.length >= 4) {
            const repairData = {
                openid: fromUser,
                device_type: parts[1],
                device_id: parts[2],
                description: parts[3],
                fault_type: '其他故障',
                urgency: '中',
                reporter: user ? user.name : '微信用户',
                status: 'pending'
            };
            
            try {
                const repairId = await createRepairRecord(repairData);
                replyContent = `✅ 报修单提交成功！\n\n`;
                replyContent += `🆔 工单号：RX${repairId}\n`;
                replyContent += `🔧 设备：${parts[1]}-${parts[2]}\n`;
                replyContent += `📝 描述：${parts[3]}\n\n`;
                replyContent += `我们会尽快安排维修人员处理，请保持通讯畅通。`;
            } catch (error) {
                replyContent = '❌ 报修提交失败，请稍后重试或联系管理员';
            }
        } else {
            replyContent = `❌ 报修格式错误\n\n正确格式：\n报修#设备类型#设备编号#故障描述\n\n示例：\n报修#包装设备#PKG-001#传送带异响`;
        }
        
    } else {
        replyContent = `😊 您好！欢迎使用设备维修管理系统

🔍 发送以下关键词获取帮助：
• "帮助" - 查看详细使用说明
• "报修" - 设备故障报修
• "查询" - 查看维修进度
• "角色" - 查看当前权限
• "申请" - 申请权限升级

📱 点击底部菜单使用完整功能`;
    }
    
    return createTextMessage(fromUser, WECHAT_CONFIG.appid, replyContent);
}

// 处理事件消息
async function handleEvent(fromUser, event, eventKey = '') {
    let replyContent = '';
    
    if (event === 'subscribe') {
        // 用户关注
        await createUserIfNotExists(fromUser);
        
        replyContent = `🎉 欢迎关注设备维修管理系统！

🔧 我们为您提供：
• 便捷的设备故障报修
• 实时的维修进度跟踪
• 完整的维修记录管理

👋 新用户指南：
1. 点击菜单"报修管理"进行设备报修
2. 点击菜单"维修记录"查看历史记录
3. 发送"帮助"获取详细使用说明

✨ 立即开始使用吧！`;
        
    } else if (event === 'unsubscribe') {
        // 用户取消关注
        console.log(`用户${fromUser}取消关注`);
        
    } else if (event === 'CLICK') {
        // 菜单点击事件
        replyContent = await handleMenuClick(fromUser, eventKey);
    }
    
    return createTextMessage(fromUser, WECHAT_CONFIG.appid, replyContent);
}

// 处理菜单点击
async function handleMenuClick(fromUser, eventKey) {
    switch (eventKey) {
        case 'repair_new':
            return '🔧 点击链接进入报修页面：\n' + getWebUrl('/repair');
            
        case 'repair_list':
            return '📋 点击链接查看维修记录：\n' + getWebUrl('/records');
            
        case 'permission_apply':
            return '📝 点击链接申请权限：\n' + getWebUrl('/permission');
            
        case 'help':
            return await handleTextMessage(fromUser, '帮助');
            
        default:
            return '😊 感谢您的使用！';
    }
}

// 创建文本消息
function createTextMessage(toUser, fromUser, content) {
    const timestamp = Math.floor(Date.now() / 1000);
    return `<xml>
        <ToUserName><![CDATA[${toUser}]]></ToUserName>
        <FromUserName><![CDATA[${fromUser}]]></FromUserName>
        <CreateTime>${timestamp}</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[${content}]]></Content>
    </xml>`;
}

// 获取网页URL
function getWebUrl(path) {
    const baseUrl = process.env.BASE_URL || 'https://your-domain.com';
    return `${baseUrl}${path}`;
}

// 数据库操作函数

// 获取用户信息
async function getUserInfo(openid) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE openid = ?',
            [openid]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('获取用户信息错误:', error);
        return null;
    }
}

// 创建用户（如果不存在）
async function createUserIfNotExists(openid) {
    try {
        const existingUser = await getUserInfo(openid);
        if (!existingUser) {
            await pool.execute(
                'INSERT INTO users (openid, name, role, status, create_time) VALUES (?, ?, ?, ?, NOW())',
                [openid, '微信用户', 'user', 'active']
            );
            console.log(`创建新用户: ${openid}`);
        }
    } catch (error) {
        console.error('创建用户错误:', error);
    }
}

// 获取用户维修记录
async function getUserRepairs(openid) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM repair_records WHERE reporter_openid = ? ORDER BY create_time DESC LIMIT 10',
            [openid]
        );
        return rows;
    } catch (error) {
        console.error('获取维修记录错误:', error);
        return [];
    }
}

// 创建维修记录
async function createRepairRecord(data) {
    try {
        const repairNo = 'RX' + Date.now();
        const [result] = await pool.execute(
            `INSERT INTO repair_records 
            (repair_no, device_type, device_id, fault_type, urgency, description, 
             reporter, reporter_openid, status, create_time, update_time) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [repairNo, data.device_type, data.device_id, data.fault_type, 
             data.urgency, data.description, data.reporter, data.openid, data.status]
        );
        return result.insertId;
    } catch (error) {
        console.error('创建维修记录错误:', error);
        throw error;
    }
}

// API路由

// 提供网页界面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public-account-system.html'));
});

app.get('/repair', (req, res) => {
    res.sendFile(path.join(__dirname, 'public-account-system.html'));
});

app.get('/records', (req, res) => {
    res.sendFile(path.join(__dirname, 'public-account-system.html'));
});

app.get('/permission', (req, res) => {
    res.sendFile(path.join(__dirname, 'public-account-system.html'));
});

// API接口

// 获取用户信息API
app.get('/api/user/:openid', async (req, res) => {
    try {
        const user = await getUserInfo(req.params.openid);
        res.json({ success: true, data: user });
    } catch (error) {
        res.json({ success: false, message: '获取用户信息失败' });
    }
});

// 提交报修API
app.post('/api/repair', async (req, res) => {
    try {
        const repairId = await createRepairRecord(req.body);
        res.json({ 
            success: true, 
            message: '报修单提交成功', 
            repairId,
            repairNo: 'RX' + repairId 
        });
    } catch (error) {
        res.json({ success: false, message: '提交失败：' + error.message });
    }
});

// 获取维修记录API
app.get('/api/repairs/:openid', async (req, res) => {
    try {
        const repairs = await getUserRepairs(req.params.openid);
        res.json({ success: true, data: repairs });
    } catch (error) {
        res.json({ success: false, message: '获取记录失败' });
    }
});

// 权限申请API
app.post('/api/permission', async (req, res) => {
    try {
        const { openid, target_role, reason } = req.body;
        
        await pool.execute(
            'INSERT INTO permission_applications (applicant_openid, target_role, reason, status, create_time) VALUES (?, ?, ?, ?, NOW())',
            [openid, target_role, reason, 'pending']
        );
        
        res.json({ success: true, message: '权限申请提交成功' });
    } catch (error) {
        res.json({ success: false, message: '申请失败：' + error.message });
    }
});

// 工具函数
function getRoleText(role) {
    const roleMap = {
        'user': '普通用户',
        'maintainer': '维修人员',
        'admin': '管理员'
    };
    return roleMap[role] || '普通用户';
}

function getStatusText(status) {
    const statusMap = {
        'pending': '待处理',
        'assigned': '已分配',
        'processing': '处理中',
        'completed': '已完成',
        'urgent': '紧急'
    };
    return statusMap[status] || status;
}

function formatDate(date) {
    return new Date(date).toLocaleString('zh-CN');
}

// 获取微信Access Token
async function getAccessToken() {
    const now = Date.now();
    
    if (accessToken && now < tokenExpireTime) {
        return accessToken;
    }
    
    try {
        const response = await axios.get(
            `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_CONFIG.appid}&secret=${WECHAT_CONFIG.appsecret}`
        );
        
        if (response.data.access_token) {
            accessToken = response.data.access_token;
            tokenExpireTime = now + (response.data.expires_in - 300) * 1000; // 提前5分钟过期
            return accessToken;
        } else {
            throw new Error('获取access_token失败');
        }
    } catch (error) {
        console.error('获取access_token错误:', error);
        return null;
    }
}

// 发送模板消息
async function sendTemplateMessage(openid, templateId, data) {
    try {
        const token = await getAccessToken();
        if (!token) return false;
        
        const response = await axios.post(
            `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`,
            {
                touser: openid,
                template_id: templateId,
                data: data
            }
        );
        
        return response.data.errcode === 0;
    } catch (error) {
        console.error('发送模板消息错误:', error);
        return false;
    }
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 微信公众号服务器启动成功！`);
    console.log(`📱 服务地址: http://localhost:${PORT}`);
    console.log(`🔧 微信接口: http://localhost:${PORT}/wechat`);
    console.log(`💻 网页版本: http://localhost:${PORT}`);
    
    // 初始化数据库表（如果需要）
    initDatabase();
});

// 初始化数据库
async function initDatabase() {
    try {
        // 创建用户表
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                openid VARCHAR(100) UNIQUE NOT NULL,
                unionid VARCHAR(100),
                name VARCHAR(50) DEFAULT '微信用户',
                role ENUM('user', 'maintainer', 'admin') DEFAULT 'user',
                department VARCHAR(50),
                phone VARCHAR(20),
                employee_code VARCHAR(50),
                status ENUM('active', 'inactive') DEFAULT 'active',
                create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // 创建维修记录表
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS repair_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                repair_no VARCHAR(50) UNIQUE NOT NULL,
                device_type VARCHAR(50) NOT NULL,
                device_id VARCHAR(50) NOT NULL,
                fault_type VARCHAR(50) NOT NULL,
                urgency ENUM('低', '中', '高', '紧急') DEFAULT '中',
                description TEXT NOT NULL,
                reporter VARCHAR(50) NOT NULL,
                contact VARCHAR(50),
                reporter_openid VARCHAR(100) NOT NULL,
                assigned_to VARCHAR(100),
                assigned_by VARCHAR(100),
                assign_time DATETIME,
                status ENUM('pending', 'assigned', 'processing', 'completed', 'urgent') DEFAULT 'pending',
                start_time DATETIME,
                complete_time DATETIME,
                solution TEXT,
                used_parts TEXT,
                work_hours DECIMAL(5,2),
                completed_by VARCHAR(100),
                maintainer_notes TEXT,
                create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_reporter_openid (reporter_openid),
                INDEX idx_status (status),
                INDEX idx_create_time (create_time)
            )
        `);
        
        // 创建权限申请表
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS permission_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                applicant_openid VARCHAR(100) NOT NULL,
                target_role ENUM('maintainer', 'admin') NOT NULL,
                reason TEXT NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                approved_by VARCHAR(100),
                approve_time DATETIME,
                approve_comment TEXT,
                rejected_by VARCHAR(100),
                reject_time DATETIME,
                reject_reason TEXT,
                create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_applicant_openid (applicant_openid),
                INDEX idx_status (status)
            )
        `);
        
        console.log('✅ 数据库表初始化完成');
        
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
    }
}

module.exports = app; 