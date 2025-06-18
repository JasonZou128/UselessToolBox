// app.js
App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'prod-8g0iq9bwb972a467', // 你的云环境ID
        traceUser: true,
      });
    }

    // 获取用户信息
    this.globalData = {
      userInfo: null,
      userRole: 'user', // 默认角色
      openid: null
    };

    // 获取用户openid
    this.getOpenId();
  },

  // 获取用户openid
  getOpenId() {
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: res => {
        console.log('获取openid成功', res.result.openid);
        this.globalData.openid = res.result.openid;
        // 检查用户角色
        this.checkUserRole();
      },
      fail: err => {
        console.error('获取openid失败', err);
      }
    });
  },

  // 检查用户角色
  checkUserRole() {
    const db = wx.cloud.database();
    db.collection('users').where({
      openid: this.globalData.openid
    }).get({
      success: res => {
        if (res.data.length > 0) {
          // 用户已存在，获取角色信息
          this.globalData.userRole = res.data[0].role || 'user';
          this.globalData.userInfo = res.data[0];
        } else {
          // 新用户，创建默认记录
          this.createNewUser();
        }
      },
      fail: err => {
        console.error('查询用户信息失败', err);
      }
    });
  },

  // 创建新用户
  createNewUser() {
    const db = wx.cloud.database();
    db.collection('users').add({
      data: {
        openid: this.globalData.openid,
        role: 'user',
        name: '新用户',
        department: '',
        phone: '',
        createTime: new Date(),
        status: 'active'
      },
      success: res => {
        console.log('创建用户成功', res._id);
        this.globalData.userRole = 'user';
      },
      fail: err => {
        console.error('创建用户失败', err);
      }
    });
  },

  globalData: {
    userInfo: null,
    userRole: 'user',
    openid: null
  }
}); 