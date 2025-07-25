Page({
  data: {
    username: '',
    password: '',
    loginType: '', // 'admin' or 'user'
    loading: false
  },
  // 管理员账号输入
  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },
  // 管理员密码输入
  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },
  // 管理员登录
  async onAdminLogin() {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({ title: '请输入账号和密码', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    // 调用云函数校验账号密码
    wx.cloud.callFunction({
      name: 'adminLogin',
      data: { action: 'login', username, password },
      success: (res) => {
        this.setData({ loading: false });
        if (res.result && res.result.code === 0) {
          wx.showToast({ title: '登录成功', icon: 'success' });
          wx.redirectTo({ url: '/pages/admin/admin' });
        } else {
          wx.showToast({ title: res.result.msg || '账号或密码错误', icon: 'none' });
        }
      },
      fail: (err) => {
        this.setData({ loading: false });
        wx.showToast({ title: '登录失败', icon: 'none' });
      }
    });
  },
  // 微信一键登录
  async onUserLogin() {
    // 1. 获取openid
    let openId = '';
    try {
      const res = await wx.cloud.callFunction({ name: 'login' });
      openId = res.result.openid;
    } catch (e) {
      wx.showToast({ title: '获取openid失败', icon: 'none' });
      return;
    }
    // 2. 查询用户
    const db = wx.cloud.database();
    const userRes = await db.collection('Users').where({ openId }).get();
    if (!userRes.data || userRes.data.length === 0) {
      // openid不存在，弹窗新建
      const nameRes = await new Promise((resolve) => {
        wx.showModal({
          title: '请输入真实姓名',
          editable: true,
          placeholderText: '请输入您的真实姓名',
          success: (res) => {
            if (res.confirm && res.content) {
              resolve(res.content);
            } else {
              resolve('');
            }
          }
        });
      });
      if (!nameRes) {
        wx.showToast({ title: '姓名不能为空', icon: 'none' });
        return;
      }
      const jobIdRes = await new Promise((resolve) => {
        wx.showModal({
          title: '请输入工号',
          editable: true,
          placeholderText: '请输入您的工号',
          success: (res) => {
            if (res.confirm && res.content) {
              resolve(res.content);
            } else {
              resolve('');
            }
          }
        });
      });
      if (!jobIdRes) {
        wx.showToast({ title: '工号不能为空', icon: 'none' });
        return;
      }
      // 写入新用户
      try {
        await db.collection('Users').add({
          data: {
            name: nameRes,
            jobId: jobIdRes,
            role: '',
            status: 'pending',
            openId
          }
        });
        wx.showToast({ title: '已提交申请，等待管理员审核', icon: 'success' });
      } catch (e) {
        wx.showToast({ title: '提交失败', icon: 'none' });
      }
      return;
    }
    // 3. openid已存在
    const user = userRes.data[0];
    if (user.status === 'pending') {
      wx.showToast({ title: '已申请，等待管理员授权', icon: 'none' });
      return;
    }
    if (user.status === 'active') {
      if (user.role === 'operator') {
        wx.redirectTo({ url: '/pages/operator/operator' });
        return;
      }
      if (user.role === 'repairman') {
        wx.redirectTo({ url: '/pages/repairman/repairman' });
        return;
      }
      wx.showToast({ title: '请联系管理员分配角色', icon: 'none' });
      return;
    }
    wx.showToast({ title: '用户状态异常，请联系管理员', icon: 'none' });
  }
}); 