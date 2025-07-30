Page({
  data: {
    username: '',
    password: '',
    loginType: '', // 'admin' or 'user'
    loading: false,
    showLinePicker: false,
    lineOptions: [],
    selectedLineIndex: 0
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
          wx.reLaunch({ url: '/pages/admin/admin' });
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
      // 存储 openid 到本地
      wx.setStorageSync('openid', openId);
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
        // 每次都弹出线体选择
        const linesRes = await db.collection('Lines').get();
        console.log('Lines collection data:', linesRes.data);
        const lines = linesRes.data.map(l => l.line);
        console.log('Available lines:', lines);

        if (!lines.length) {
          wx.showToast({ title: '暂无可选线体', icon: 'none' });
          return;
        }

        const selectedLine = await new Promise((resolve) => {
          // 先显示标题提示
          wx.showToast({
            title: '请选择您今日工作的线体',
            icon: 'none',
            duration: 1500
          });
          
          // 延迟显示选择器，让用户看到提示
          setTimeout(() => {
            console.log('Showing custom line picker with lines:', lines);
            
            // 使用自定义弹窗选择线体
            this.setData({
              showLinePicker: true,
              lineOptions: lines,
              selectedLineIndex: 0
            });
            
            // 监听选择结果
            this.linePickerResolve = resolve;
          }, 1500); // 增加延迟时间，确保提示显示完整
        });

        if (selectedLine) {
          await db.collection('Users').doc(user._id).update({
            data: { line: selectedLine }
          });
          wx.reLaunch({ url: '/pages/operator/operator' });
        } else {
          wx.showToast({ title: '请选择线体', icon: 'none' });
        }
        return;
      }
      if (user.role === 'repairman') {
        wx.reLaunch({ url: '/pages/repairman/repairman' });
        return;
      }
      wx.showToast({ title: '请联系管理员分配角色', icon: 'none' });
      return;
    }
    wx.showToast({ title: '用户状态异常，请联系管理员', icon: 'none' });
  },
  // 线体选择器事件处理
  onLinePickerChange(e) {
    this.setData({
      selectedLineIndex: e.detail.value
    });
  },
  onConfirmLine() {
    const { lineOptions, selectedLineIndex } = this.data;
    const selectedLine = lineOptions[selectedLineIndex];
    console.log('User selected line:', selectedLine);
    
    this.setData({ showLinePicker: false });
    if (this.linePickerResolve) {
      this.linePickerResolve(selectedLine);
      this.linePickerResolve = null;
    }
  },
  onCancelLine() {
    console.log('User cancelled line selection');
    this.setData({ showLinePicker: false });
    if (this.linePickerResolve) {
      this.linePickerResolve('');
      this.linePickerResolve = null;
    }
  }
}); 