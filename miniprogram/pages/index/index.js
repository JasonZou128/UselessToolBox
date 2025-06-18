const app = getApp()

Page({
  data: {
    userInfo: {},
    userRole: 'user',
    roleText: '普通用户',
    statsTitle: '我的统计',
    statsData: [],
    recentActivities: [],
    showPermissionModal: false,
    roleOptions: [
      { value: 'maintainer', name: '维修人员' },
      { value: 'admin', name: '管理员' }
    ],
    roleIndex: 0,
    applyReason: ''
  },

  onLoad() {
    this.initUserInfo()
  },

  onShow() {
    this.loadUserStats()
    this.loadRecentActivities()
  },

  // 初始化用户信息
  initUserInfo() {
    const userInfo = app.globalData.userInfo || {}
    const userRole = app.globalData.userRole || 'user'
    
    let roleText = '普通用户'
    let statsTitle = '我的统计'
    
    switch (userRole) {
      case 'maintainer':
        roleText = '维修人员'
        statsTitle = '工作统计'
        break
      case 'admin':
        roleText = '管理员'
        statsTitle = '系统概况'
        break
    }

    this.setData({
      userInfo,
      userRole,
      roleText,
      statsTitle
    })
  },

  // 加载用户统计数据
  loadUserStats() {
    wx.cloud.callFunction({
      name: 'userManager',
      data: {
        action: 'getUserStats'
      },
      success: res => {
        if (res.result.success) {
          const stats = res.result.data
          let statsData = []

          if (this.data.userRole === 'user') {
            statsData = [
              { label: '报修单', value: stats.repairCount || 0 },
              { label: '点检记录', value: stats.inspectionCount || 0 },
              { label: '完成率%', value: '89' }
            ]
          } else if (this.data.userRole === 'maintainer') {
            statsData = [
              { label: '分配任务', value: stats.assignedTasks || 0 },
              { label: '已完成', value: stats.completedTasks || 0 },
              { label: '完成率%', value: stats.completionRate || 0 }
            ]
          } else if (this.data.userRole === 'admin') {
            statsData = [
              { label: '总用户', value: stats.totalUsers || 0 },
              { label: '总维修单', value: stats.totalRepairs || 0 },
              { label: '待审核', value: stats.pendingApplications || 0 }
            ]
          }

          this.setData({ statsData })
        }
      },
      fail: err => {
        console.error('加载统计数据失败', err)
      }
    })
  },

  // 加载最近活动
  loadRecentActivities() {
    // 根据角色加载不同的活动数据
    wx.cloud.callFunction({
      name: 'repairManager',
      data: {
        action: 'getRepairList',
        data: { limit: 5 }
      },
      success: res => {
        if (res.result.success) {
          const activities = res.result.data.map(item => ({
            id: item._id,
            title: `${item.deviceType} - ${item.deviceId}`,
            description: item.description.substring(0, 30) + '...',
            time: this.formatTime(item.createTime)
          }))
          this.setData({ recentActivities: activities })
        }
      },
      fail: err => {
        console.error('加载最近活动失败', err)
      }
    })
  },

  // 申请权限
  applyPermission() {
    this.setData({ showPermissionModal: true })
  },

  // 隐藏权限申请弹窗
  hidePermissionModal() {
    this.setData({ 
      showPermissionModal: false,
      applyReason: '',
      roleIndex: 0
    })
  },

  // 角色选择变化
  onRoleChange(e) {
    this.setData({ roleIndex: e.detail.value })
  },

  // 申请原因输入
  onReasonInput(e) {
    this.setData({ applyReason: e.detail.value })
  },

  // 提交权限申请
  submitPermissionApplication() {
    if (!this.data.applyReason.trim()) {
      wx.showToast({
        title: '请填写申请原因',
        icon: 'none'
      })
      return
    }

    const targetRole = this.data.roleOptions[this.data.roleIndex].value

    wx.cloud.callFunction({
      name: 'userManager',
      data: {
        action: 'submitPermissionApplication',
        data: {
          targetRole,
          reason: this.data.applyReason
        }
      },
      success: res => {
        if (res.result.success) {
          wx.showToast({
            title: res.result.message,
            icon: 'success'
          })
          this.hidePermissionModal()
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('提交权限申请失败', err)
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 维修工作台
  goToWorkbench() {
    wx.navigateTo({
      url: '/pages/track/track?type=workbench'
    })
  },

  // 显示统计信息
  showStats() {
    wx.showModal({
      title: '工作统计',
      content: `本月维修：${this.data.statsData[0]?.value || 0}个\n已完成：${this.data.statsData[1]?.value || 0}个\n完成率：${this.data.statsData[2]?.value || 0}%`,
      showCancel: false
    })
  },

  // 数据中心
  showDataCenter() {
    wx.showModal({
      title: '数据中心',
      content: '数据导出功能开发中...',
      showCancel: false
    })
  },

  // 用户管理
  manageUsers() {
    wx.showModal({
      title: '用户管理',
      content: '用户管理功能开发中...',
      showCancel: false
    })
  },

  // 权限审核
  auditPermissions() {
    wx.navigateTo({
      url: '/pages/admin/admin?tab=audit'
    })
  },

  // 格式化时间
  formatTime(date) {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    
    if (diff < 60000) {
      return '刚刚'
    } else if (diff < 3600000) {
      return Math.floor(diff / 60000) + '分钟前'
    } else if (diff < 86400000) {
      return Math.floor(diff / 3600000) + '小时前'
    } else {
      return Math.floor(diff / 86400000) + '天前'
    }
  }
}) 