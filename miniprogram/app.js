// app.js
App({
  onLaunch() {
    // 云开发初始化
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-3g4ki6a194e32821', // 替换为你的云开发环境ID
        traceUser: true
      })
    }
    // 获取 openid 并写入本地
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        wx.setStorageSync('openid', res.result.openid);
        console.log('云函数获取到 openid:', res.result.openid);
      },
      fail: err => {
        console.error('获取 openid 失败', err);
      }
    });
  },

  // 初始化用户角色
  initUserRole() {
    try {
      const storedRole = wx.getStorageSync('userRole');
      const storedUserInfo = wx.getStorageSync('userInfo');
      
      if (storedRole && storedUserInfo) {
        // 如果有存储的角色信息，直接使用
        this.globalData.userRole = storedRole;
        this.globalData.userInfo = storedUserInfo;
        console.log('使用本地存储的角色信息:', { role: storedRole, userInfo: storedUserInfo });
      } else {
        // 如果没有存储的角色信息，使用默认值
        this.globalData = {
          userInfo: {
            name: '演示用户',
            avatarUrl: ''
          },
          userRole: 'operator', // 默认角色: operator, repair, admin
          openid: 'demo_openid'
        };
        console.log('使用默认角色信息');
      }
    } catch (error) {
      console.error('读取本地存储失败:', error);
      // 出错时使用默认值
      this.globalData = {
        userInfo: {
          name: '演示用户',
          avatarUrl: ''
        },
        userRole: 'operator',
        openid: 'demo_openid'
      };
    }
  },

  // 获取用户openid（暂时注释掉，使用演示数据）
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
        // 使用演示数据
        this.globalData.openid = 'demo_openid';
        console.log('使用演示openid');
      }
    });
  },

  // 检查用户角色（暂时注释掉，使用演示数据）
  checkUserRole() {
    const db = wx.cloud.database();
    db.collection('users').where({
      openid: this.globalData.openid
    }).get({
      success: res => {
        if (res.data.length > 0) {
          // 用户已存在，获取角色信息
          this.globalData.userRole = res.data[0].role || 'operator';
          this.globalData.userInfo = res.data[0];
        } else {
          // 新用户，创建默认记录
          this.createNewUser();
        }
      },
      fail: err => {
        console.error('查询用户信息失败', err);
        // 使用默认角色
        this.globalData.userRole = 'operator';
      }
    });
  },

  // 创建新用户（暂时注释掉）
  createNewUser() {
    const db = wx.cloud.database();
    db.collection('users').add({
      data: {
        openid: this.globalData.openid,
        role: 'operator',
        name: '新用户',
        department: '',
        phone: '',
        createTime: new Date(),
        status: 'active'
      },
      success: res => {
        console.log('创建用户成功', res._id);
        this.globalData.userRole = 'operator';
      },
      fail: err => {
        console.error('创建用户失败', err);
      }
    });
  },

  globalData: {
    userInfo: null,
    userRole: 'operator',
    openid: null
  }
}); 