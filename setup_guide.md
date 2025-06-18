# 微信云开发环境配置指南

## 1. 配置微信云开发环境

### 1.1 开通云开发
1. 打开微信开发者工具
2. 点击左上角"+"号，创建新项目
   - 选择类型：公众号
   - 目录：选择你的Cursor项目目录
   - AppID：填入你的测试号AppID
   - 项目名称：设备维修管理系统
   - 开发模式：选择"JavaScript"
   - 勾选"启用云开发"

### 1.2 创建云环境
1. 点击工具栏中的"云开发"按钮
2. 点击"创建环境"
   - 环境名称：例如"equipment-dev"
   - 环境ID：会自动生成，记录下来
   - 选择付费方式：可以先选择免费版

### 1.3 初始化项目结构
```bash
# 在Cursor中创建以下目录结构
project-root/
├── miniprogram/              # 小程序代码
│   ├── pages/               # 页面文件
│   ├── components/          # 组件
│   ├── images/              # 图片资源
│   └── app.js              # 入口文件
├── cloudfunctions/          # 云函数目录
│   ├── login/              # 登录云函数
│   ├── maintenance/        # 维修相关云函数
│   └── inspection/         # 点检相关云函数
└── project.config.json     # 项目配置文件
```

### 1.4 配置项目文件

1. 创建 project.config.json：
```json
{
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionRoot": "cloudfunctions/",
  "setting": {
    "urlCheck": true,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": true,
    "coverView": true,
    "nodeModules": true,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true
  },
  "appid": "你的测试号AppID",
  "projectname": "设备维修管理系统",
  "libVersion": "2.30.2",
  "cloudfunctionTemplateRoot": "cloudfunctionTemplate",
  "condition": {
    "search": {
      "list": []
    },
    "conversation": {
      "list": []
    },
    "plugin": {
      "list": []
    },
    "game": {
      "list": []
    }
  }
}
```

2. 创建 miniprogram/app.js：
```javascript
// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-5g0ypdni79c27e59', // 替换为你的云环境ID
        traceUser: true,
      })
    }
  }
})
```

3. 创建 miniprogram/app.json：
```json
{
  "pages": [
    "pages/index/index",
    "pages/maintenance/list",
    "pages/inspection/list"
  ],
  "window": {
    "backgroundColor": "#F6F6F6",
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#F6F6F6",
    "navigationBarTitleText": "设备维修管理系统",
    "navigationBarTextStyle": "black"
  }
}
```

## 2. 关联Cursor和微信开发者工具

### 2.1 配置Cursor
1. 在Cursor中打开项目目录
2. 确保项目根目录包含上述创建的所有文件
3. 在Cursor中安装必要的VS Code插件：
   - 微信小程序开发工具
   - JavaScript (ES6) code snippets
   - ESLint

### 2.2 配置微信开发者工具
1. 打开微信开发者工具设置
2. 开启"服务端口"
   - 设置 -> 安全设置
   - 开启"服务端口"
   - 记录端口号（默认为27777）

### 2.3 启动开发环境
1. 在微信开发者工具中：
   - 打开项目
   - 确保云开发环境正常
   - 确保可以编译运行

2. 在Cursor中：
   - 编辑代码
   - 保存时会自动同步到微信开发者工具
   - 在微信开发者工具中预览效果

## 3. 验证配置

### 3.1 测试云环境
1. 创建测试云函数：
```javascript
// cloudfunctions/test/index.js
exports.main = async (event, context) => {
  return {
    msg: 'Hello, Cloud Function!'
  }
}
```

2. 在页面中调用测试：
```javascript
// miniprogram/pages/index/index.js
Page({
  testCloud() {
    wx.cloud.callFunction({
      name: 'test',
      success: res => {
        console.log('云函数调用成功：', res)
      },
      fail: err => {
        console.error('云函数调用失败：', err)
      }
    })
  }
})
```

### 3.2 检查要点
- [ ] 项目可以在微信开发者工具中正常编译
- [ ] 云环境连接正常
- [ ] 云函数可以正常调用
- [ ] Cursor中的修改可以同步到微信开发者工具
- [ ] 文件结构完整
- [ ] 基础配置文件正确

## 4. 常见问题解决

### 4.1 环境问题
- 云环境初始化失败
  * 检查环境ID是否正确
  * 确认云开发是否已开通
  * 检查权限是否配置正确

- 文件同步问题
  * 检查微信开发者工具服务端口是否开启
  * 确认项目路径配置是否正确
  * 尝试重启开发者工具

### 4.2 调试技巧
- 使用console.log进行调试
- 善用微信开发者工具的调试器
- 注意查看云开发控制台的日志
- 定期检查云环境的资源使用情况 