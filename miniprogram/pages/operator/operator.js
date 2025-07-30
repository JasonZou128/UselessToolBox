Page({
  data: {
    activeTab: 0
  },
  onTabChange(e) {
    const newTab = Number(e.currentTarget.dataset.index);
    this.setData({ activeTab: newTab });
    
    // 切换 tab 后刷新对应组件
    setTimeout(() => {
      if (newTab === 0) {
        // 切换到设备报修，刷新 repair-report
        const repairReport = this.selectComponent('#repairReport');
        if (repairReport && repairReport.loadData) {
          repairReport.loadData();
        }
      } else if (newTab === 1) {
        // 切换到待点检，刷新 inspection-todo
        const inspectionTodo = this.selectComponent('#inspectionTodo');
        if (inspectionTodo && inspectionTodo.initUserAndLoad) {
          inspectionTodo.initUserAndLoad();
        }
      }
    }, 100);
  },
  onShow() {
    // 延时确保组件完全加载
    setTimeout(() => {
      // 根据当前 tab 刷新对应组件
      if (this.data.activeTab === 0) {
        // 当前显示设备报修，刷新 repair-report
        const repairReport = this.selectComponent('#repairReport');
        if (repairReport && repairReport.loadData) {
          repairReport.loadData();
        }
      } else if (this.data.activeTab === 1) {
        // 当前显示待点检，刷新 inspection-todo
        const inspectionTodo = this.selectComponent('#inspectionTodo');
        if (inspectionTodo && inspectionTodo.initUserAndLoad) {
          inspectionTodo.initUserAndLoad();
        }
      }
    }, 100);
  },
  onLogout() {
    wx.clearStorageSync();
    wx.redirectTo({ url: '/pages/login/login' });
  }
}); 