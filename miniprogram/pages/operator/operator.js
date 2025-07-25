Page({
  data: {
    activeTab: 0
  },
  onTabChange(e) {
    this.setData({ activeTab: Number(e.currentTarget.dataset.index) });
  },
  onLogout() {
    wx.clearStorageSync();
    wx.redirectTo({ url: '/pages/login/login' });
  }
}); 