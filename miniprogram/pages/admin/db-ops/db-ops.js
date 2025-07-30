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
          let hasMore = true, limit = 20, totalDeleted = 0, totalFailed = 0;
          while (hasMore) {
            const res = await db.collection('MaintainRecords').limit(limit).get();
            if (!res.data.length) break;
            for (const doc of res.data) {
              try {
                await db.collection('MaintainRecords').doc(doc._id).remove();
                totalDeleted++;
              } catch (err) {
                console.log('删除失败:', doc._id, err);
                totalFailed++;
                // 继续处理下一条，不中断
              }
            }
            hasMore = res.data.length === limit;
          }
          this.setData({ loading: false });
          const msg = totalFailed > 0 ? 
            `已清理${totalDeleted}条，${totalFailed}条失败` : 
            `已清理${totalDeleted}条`;
          wx.showToast({ title: msg, icon: 'success' });
        }
      }
    });
  },
  async onClearInspectionRecords() {
    wx.showModal({
      title: '确认清理',
      content: '确定要清空所有点检记录吗？此操作不可恢复！',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          const db = wx.cloud.database();
          let hasMore = true, limit = 20, totalDeleted = 0;
          while (hasMore) {
            const res = await db.collection('InspectionRecords').limit(limit).get();
            if (!res.data.length) break;
            for (const doc of res.data) {
              await db.collection('InspectionRecords').doc(doc._id).remove();
              totalDeleted++;
            }
            hasMore = res.data.length === limit;
          }
          this.setData({ loading: false });
          wx.showToast({ title: `已清理${totalDeleted}条`, icon: 'success' });
        }
      }
    });
  },
  async onClearInspectionPlans() {
    wx.showModal({
      title: '确认清理',
      content: '确定要清空所有点检计划吗？此操作不可恢复！',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          const db = wx.cloud.database();
          let hasMore = true, limit = 20, totalDeleted = 0;
          while (hasMore) {
            const res = await db.collection('InspectionPlans').limit(limit).get();
            if (!res.data.length) break;
            for (const doc of res.data) {
              await db.collection('InspectionPlans').doc(doc._id).remove();
              totalDeleted++;
            }
            hasMore = res.data.length === limit;
          }
          this.setData({ loading: false });
          wx.showToast({ title: `已清理${totalDeleted}条`, icon: 'success' });
        }
      }
    });
  },
  async onClearMaintainPlans() {
    wx.showModal({
      title: '确认清理',
      content: '确定要清空所有保养计划吗？此操作不可恢复！',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          const db = wx.cloud.database();
          let hasMore = true, limit = 20, totalDeleted = 0;
          while (hasMore) {
            const res = await db.collection('MaintainPlans').limit(limit).get();
            if (!res.data.length) break;
            for (const doc of res.data) {
              await db.collection('MaintainPlans').doc(doc._id).remove();
              totalDeleted++;
            }
            hasMore = res.data.length === limit;
          }
          this.setData({ loading: false });
          wx.showToast({ title: `已清理${totalDeleted}条`, icon: 'success' });
        }
      }
    });
  },
  async onClearRepairRecords() {
    wx.showModal({
      title: '确认清理',
      content: '确定要清空所有维修记录吗？此操作不可恢复！',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          const db = wx.cloud.database();
          let hasMore = true, limit = 20, totalDeleted = 0;
          while (hasMore) {
            const res = await db.collection('RepairRecords').limit(limit).get();
            if (!res.data.length) break;
            for (const doc of res.data) {
              await db.collection('RepairRecords').doc(doc._id).remove();
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