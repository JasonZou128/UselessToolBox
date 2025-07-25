Component({
  data: {
    group: '',
    deviceList: [],
    showDialog: false,
    currentAssetId: '',
    repairDesc: '',
    submitting: false
  },
  lifetimes: {
    attached() {
      this.loadData();
    }
  },
  methods: {
    async loadData() {
      const openid = wx.getStorageSync('openid');
      const db = wx.cloud.database();
      // 获取当前维修员的group
      const userRes = await db.collection('Users').where({ _openid: openid, role: 'repairman' }).get();
      if (userRes.data.length) {
        const group = userRes.data[0].group;
        this.setData({ group });
        // 查询待维修设备
        const deviceRes = await db.collection('Equipments').where({ status: '待维修', repairGroup: group }).get();
        this.setData({ deviceList: deviceRes.data });
      } else {
        this.setData({ group: '（未分配维修组）', deviceList: [] });
      }
    },
    onShowDialog(e) {
      const assetId = e.currentTarget.dataset.assetid;
      this.setData({ showDialog: true, currentAssetId: assetId, repairDesc: '' });
    },
    onHideDialog() {
      this.setData({ showDialog: false, currentAssetId: '', repairDesc: '' });
    },
    onInputRepair(e) {
      this.setData({ repairDesc: e.detail.value });
    },
    async onSubmitRepair() {
      const { currentAssetId, repairDesc } = this.data;
      if (!repairDesc) {
        wx.showToast({ title: '请填写维修内容', icon: 'none' });
        return;
      }
      this.setData({ submitting: true });
      const db = wx.cloud.database();
      // 获取当前维修员信息
      const openid = wx.getStorageSync('openid');
      const userRes = await db.collection('Users').where({ _openid: openid, role: 'repairman' }).get();
      const repairmanName = userRes.data.length ? userRes.data[0].name : '';
      // 查找最新的待维修记录
      const recordRes = await db.collection('RepairRecords')
        .where({ assetId: currentAssetId, status: '待维修' })
        .orderBy('reportTime', 'desc').limit(1).get();
      if (recordRes.data.length) {
        const record = recordRes.data[0];
        const finishTime = new Date();
        const reportTime = new Date(record.reportTime);
        const duration = Math.round((finishTime - reportTime) / 60000); // 分钟
        await db.collection('RepairRecords').doc(record._id).update({
          data: {
            repairmanName,
            repairDesc,
            finishTime,
            duration,
            status: '已完成'
          }
        });
      }
      // 更新设备状态
      await db.collection('Equipments').where({ assetId: currentAssetId }).update({
        data: { status: '运行中' }
      });
      wx.showToast({ title: '维修完成', icon: 'success' });
      this.setData({ showDialog: false, currentAssetId: '', repairDesc: '', submitting: false });
      this.loadData();
    }
  }
}); 