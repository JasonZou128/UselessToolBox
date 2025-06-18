# 微信云开发部署指南

## 📋 部署前准备

### 1. 申请微信小程序
1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册小程序账号（个人或企业）
3. 获取小程序 AppID

### 2. 开通云开发
1. 在微信开发者工具中创建云开发环境
2. 记录云环境 ID（例如：prod-8g0iq9bwb972a467）

### 3. 安装开发工具
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- Node.js 环境

## 🚀 部署步骤

### Step 1: 配置项目
1. 修改 `project.config.json` 中的 `appid` 为你的小程序 AppID
2. 修改 `miniprogram/app.js` 中的云环境 ID

```javascript
wx.cloud.init({
  env: 'your-cloud-env-id', // 替换为你的云环境ID
  traceUser: true,
});
```

### Step 2: 创建数据库集合
在微信云开发控制台创建以下数据库集合：
- `users` - 用户表
- `repair_records` - 维修记录表
- `permission_applications` - 权限申请表
- `inspection_records` - 设备点检记录表
- `maintenance_records` - 保养记录表
- `task_transfers` - 任务转办记录表
- `role_changes` - 角色变更记录表

详细数据库结构参考 `database-init.md`

### Step 3: 部署云函数
1. 在微信开发者工具中打开项目
2. 右键点击 `cloudfunctions` 文件夹
3. 选择"同步云函数列表"
4. 分别右键点击每个云函数文件夹，选择"上传并部署"：
   - `getOpenId`
   - `repairManager`
   - `userManager`

### Step 4: 设置数据库权限
在云开发控制台 > 数据库 > 集合权限中设置：

```json
// users 集合权限
{
  "read": "auth.openid == doc.openid || get('users', auth.openid).role == 'admin'",
  "write": "get('users', auth.openid).role == 'admin'"
}

// repair_records 集合权限
{
  "read": "auth.openid == doc.reporterOpenid || auth.openid == doc.assignedTo || get('users', auth.openid).role == 'admin'",
  "write": "auth.openid == doc.reporterOpenid || auth.openid == doc.assignedTo || get('users', auth.openid).role == 'admin'"
}

// permission_applications 集合权限
{
  "read": "auth.openid == doc.applicantOpenid || get('users', auth.openid).role == 'admin'",
  "write": "get('users', auth.openid).role == 'admin'"
}
```

### Step 5: 创建初始管理员
在数据库 `users` 集合中手动添加管理员记录：

```json
{
  "openid": "你的微信OpenID",
  "name": "系统管理员",
  "role": "admin",
  "department": "IT部",
  "phone": "13800138000",
  "employeeCode": "ADMIN001",
  "status": "active",
  "createTime": "2024-01-01T00:00:00.000Z",
  "updateTime": "2024-01-01T00:00:00.000Z"
}
```

### Step 6: 测试部署
1. 在微信开发者工具中预览小程序
2. 测试各项功能：
   - 用户登录和角色识别
   - 故障报修功能
   - 权限申请功能
   - 维修任务管理
   - 管理员审核功能

## 📱 功能特性

### ✅ 已实现功能
- 🔐 基于微信OpenID的用户身份识别
- 👥 三种角色权限管理（普通用户/维修人员/管理员）
- 🔧 设备故障报修系统
- 📋 维修任务跟踪和管理
- ✅ 设备点检记录
- ⚙️ 设备保养管理
- 🔄 任务转办功能
- 📝 权限申请和审核
- 📊 统计数据展示
- 🔔 实时数据同步

### 🎯 核心业务流程
1. **报修流程**：用户提交报修 → 自动分配维修员 → 维修处理 → 完成确认
2. **权限申请**：用户申请权限 → 管理员审核 → 角色变更 → 权限生效
3. **任务管理**：任务分配 → 状态更新 → 转办处理 → 完成记录

## 🛠️ 技术架构

### 前端技术
- 微信小程序原生开发
- WXML + WXSS + JavaScript
- 微信云开发 SDK

### 后端技术
- 微信云开发
- Node.js 云函数
- 云数据库
- 云存储（用于图片上传）

### 数据库设计
- 基于文档型数据库
- 完整的权限控制
- 数据关联和索引优化

## 🔧 配置说明

### 环境变量
```javascript
// app.js
const ENV_CONFIG = {
  development: 'dev-env-id',
  production: 'prod-8g0iq9bwb972a467'
}
```

### 权限配置
```javascript
// 角色权限定义
const ROLE_PERMISSIONS = {
  user: ['repair', 'view_own', 'inspection'],
  maintainer: ['repair', 'view_assigned', 'maintenance', 'update_status'],
  admin: ['all']
}
```

## 📈 性能优化

### 数据库优化
- 合理的索引设计
- 分页查询
- 数据缓存策略

### 小程序优化
- 按需加载
- 图片压缩
- 代码分包

## 🔒 安全考虑

### 数据安全
- 基于OpenID的身份验证
- 数据库权限严格控制
- 敏感信息加密存储

### 接口安全
- 云函数权限验证
- 参数校验和过滤
- 操作日志记录

## 📞 技术支持

### 常见问题
1. **云函数调用失败**：检查云环境ID配置和云函数部署状态
2. **数据库权限错误**：确认权限规则配置正确
3. **用户角色不正确**：检查用户表中的角色字段

### 联系方式
- 开发文档：[微信小程序云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- 技术社区：微信开发者社区

## 🔄 版本更新

### v3.0 - 云开发版本
- ✅ 完整的微信云开发架构
- ✅ 真实的数据库存储
- ✅ 完善的权限管理系统
- ✅ 移动端原生体验

### 后续计划
- 📱 支持微信公众号H5版本
- 🔔 消息推送和通知
- 📊 更丰富的数据分析
- 🏷️ 二维码扫描功能
- 📁 文件上传和管理

---

🎉 **恭喜！您的设备维修管理系统云开发版本已经准备就绪！** 