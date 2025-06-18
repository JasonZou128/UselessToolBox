# 微信公众号设备维修管理系统部署指南

## 📱 项目概述

这是一个基于微信公众号的设备维修管理系统，支持：
- ✅ 角色选择（普通用户/维修人员/管理员）
- 🔧 设备故障报修
- 📋 维修进度跟踪
- ✅ 设备点检记录
- 📝 权限申请审核
- 💬 微信消息交互
- 🌐 H5网页界面

## 🚀 快速部署

### 1. 申请微信公众号

#### 个人订阅号（推荐测试）
1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 选择"订阅号" → "个人"
3. 填写个人信息并验证
4. 获取 AppID 和 AppSecret

#### 测试号（开发推荐）
1. 访问 [微信测试号平台](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)
2. 微信扫码登录
3. 获取测试号 AppID 和 AppSecret
4. 配置接口信息

### 2. 环境准备

#### 系统要求
- Node.js 14.0+
- MySQL 5.7+
- 支持HTTPS的服务器

#### 安装依赖
```bash
# 克隆项目
git clone <your-repo-url>
cd equipment-repair-wechat

# 安装依赖
npm install

# 或使用yarn
yarn install
```

### 3. 配置设置

#### 创建环境配置文件
复制 `.env.example` 为 `.env` 并填写配置：

```bash
# 微信公众号配置
WECHAT_TOKEN=your_wechat_token_here
WECHAT_APPID=your_app_id_here  
WECHAT_APPSECRET=your_app_secret_here

# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=equipment_repair

# 服务器配置
PORT=3000
BASE_URL=https://your-domain.com
```

#### 数据库初始化
```sql
-- 创建数据库
CREATE DATABASE equipment_repair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 数据库表会在服务器启动时自动创建
```

### 4. 微信公众号配置

#### 基本配置
1. 进入微信公众平台
2. 开发 → 基本配置
3. 填写服务器配置：
   - URL: `https://your-domain.com/wechat`
   - Token: 与环境变量中的 WECHAT_TOKEN 保持一致
   - EncodingAESKey: 随机生成
   - 消息加解密方式: 明文模式

#### 自定义菜单设置
在微信公众平台设置以下菜单：

```json
{
  "button": [
    {
      "name": "报修管理",
      "sub_button": [
        {
          "type": "view",
          "name": "设备报修",
          "url": "https://your-domain.com/repair"
        },
        {
          "type": "view", 
          "name": "维修记录",
          "url": "https://your-domain.com/records"
        }
      ]
    },
    {
      "name": "系统功能",
      "sub_button": [
        {
          "type": "view",
          "name": "权限申请", 
          "url": "https://your-domain.com/permission"
        },
        {
          "type": "click",
          "name": "使用帮助",
          "key": "help"
        }
      ]
    },
    {
      "type": "view",
      "name": "工作台",
      "url": "https://your-domain.com/"
    }
  ]
}
```

### 5. 启动服务

#### 开发环境
```bash
npm run dev
```

#### 生产环境
```bash
npm start

# 使用PM2管理进程（推荐）
npm install -g pm2
pm2 start wechat-server.js --name "equipment-repair"
pm2 startup
pm2 save
```

### 6. 部署到服务器

#### 使用宝塔面板（推荐）
1. 安装宝塔面板
2. 创建网站，绑定域名
3. 申请SSL证书（必须HTTPS）
4. 上传项目文件
5. 安装Node.js和MySQL
6. 配置反向代理

#### Nginx配置示例
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📋 功能说明

### 🔧 主要功能

#### 1. 角色管理
- **普通用户**：设备报修、查看进度、设备点检、申请权限
- **维修人员**：处理维修任务、更新状态、任务转办
- **管理员**：用户管理、权限审核、数据导出、系统设置

#### 2. 报修流程
1. 用户选择角色进入系统
2. 填写设备故障信息
3. 系统自动生成工单号
4. 分配维修人员处理
5. 实时跟踪维修进度

#### 3. 微信交互
- 发送"报修"快速报修
- 发送"查询"查看进度
- 发送"帮助"获取帮助
- 支持快捷报修格式：`报修#设备类型#设备编号#故障描述`

### 📱 使用方式

#### 网页版
- 访问 `https://your-domain.com`
- 选择角色类型
- 使用完整功能界面

#### 微信消息
- 关注公众号
- 发送关键词交互
- 点击菜单进入功能页面

## 🔧 开发说明

### 项目结构
```
equipment-repair-wechat/
├── public-account-system.html  # 前端页面
├── wechat-server.js           # 后端服务器
├── package.json               # 项目配置
├── WECHAT-DEPLOY.md          # 部署文档
└── .env.example              # 环境配置示例
```

### API接口
- `GET /api/user/:openid` - 获取用户信息
- `POST /api/repair` - 提交报修
- `GET /api/repairs/:openid` - 获取维修记录
- `POST /api/permission` - 权限申请

### 数据库表
- `users` - 用户信息表
- `repair_records` - 维修记录表  
- `permission_applications` - 权限申请表

## 🛠️ 常见问题

### Q1: 微信验证失败
**解决方案：**
- 检查Token配置是否正确
- 确认服务器URL可访问
- 验证HTTPS证书有效

### Q2: 数据库连接失败
**解决方案：**
- 检查数据库配置
- 确认数据库服务运行
- 验证用户权限

### Q3: 菜单不显示
**解决方案：**
- 等待24小时生效
- 重新关注公众号
- 检查菜单配置格式

### Q4: 页面无法访问
**解决方案：**
- 检查HTTPS配置
- 验证域名解析
- 确认端口开放

## 📞 技术支持

### 相关文档
- [微信公众平台开发文档](https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html)
- [Node.js官方文档](https://nodejs.org/zh-cn/docs/)
- [MySQL文档](https://dev.mysql.com/doc/)

### 联系方式
- GitHub Issues
- 技术交流群
- 邮箱支持

## 🎯 版本更新

### v1.0.0 - 初始版本
- ✅ 基础角色管理
- ✅ 设备报修功能
- ✅ 微信消息交互
- ✅ H5界面适配
- ✅ 权限申请流程

### 后续计划
- 📸 图片上传功能
- 🔔 消息推送通知
- 📊 数据统计分析
- 📁 文件管理功能
- 🔍 二维码扫描

---

🎉 **恭喜！您的微信公众号设备维修管理系统已经准备就绪！**

如有问题，请查看文档或联系技术支持。 