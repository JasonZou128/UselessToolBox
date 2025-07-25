Page({
  data: {
    activeTab: 'system', // 'system' or 'report'
    activeSubTab: 'user', // system: 'user'|'line'|'equipment', report: 'inspection'|'repair'|'maintain'
    showWelcome: true
  },
  onLoad() {},
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    let subTab = '';
    if (tab === 'system') subTab = 'user';
    if (tab === 'report') subTab = 'inspection';
    this.setData({ activeTab: tab, activeSubTab: subTab, showWelcome: false });
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