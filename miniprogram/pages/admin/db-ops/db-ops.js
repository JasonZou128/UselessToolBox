Page({
  data: {
    loading: false
  },
  async onClearMaintainRecords() {
    wx.showModal({
      title: '确认清理',
      content: '确定要清空所有保养记录吗？此操作不可恢复！',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          const db = wx.cloud.database();
          let hasMore = true, limit = 20, totalDeleted = 0;
          while (hasMore) {
            const res = await db.collection('MaintainRecords').limit(limit).get();
            if (!res.data.length) break;
            for (const doc of res.data) {
              await db.collection('MaintainRecords').doc(doc._id).remove();
              totalDeleted++;
            }
            hasMore = res.data.length === limit;
          }
          this.setData({ loading: false });
          wx.showToast({ title: `已清理${totalDeleted}条`, icon: 'success' });
        }
      }
    });
  }
}); 