Page({
  data: {
    activeTab: 'plan', // 'plan' or 'report' or 'todo'
    activeSubTab: 'inspectionPlan', // plan: 'inspectionPlan'|'maintainPlan', report: 'inspectionReport'|'repairReport'|'maintainReport', todo: 'todoRepair'|'todoMaintain'
  },
  onLoad() {},
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    let subTab = '';
    if (tab === 'plan') subTab = 'inspectionPlan';
    if (tab === 'report') subTab = 'inspectionReport';
    if (tab === 'todo') subTab = 'todoRepair';
    this.setData({ activeTab: tab, activeSubTab: subTab });
  },
  switchSubTab(e) {
    const subTab = e.currentTarget.dataset.subtab;
    this.setData({ activeSubTab: subTab });
  },
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.redirectTo({ url: '/pages/login/login' });
        }
      }
    });
  }
}); 