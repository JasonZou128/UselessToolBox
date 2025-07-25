Component({
  data: {
    userLine: '',
    deviceList: [],
    showDialog: false,
    currentAssetId: '',
    faultDesc: '',
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
      const userRes = await db.collection('Users').where({ _openid: openid, role: 'operator' }).get();
      if (userRes.data.length) {
        const userLine = userRes.data[0].line;
        this.setData({ userLine });
        const deviceRes = await db.collection('Equipments').where({ line: userLine }).get();
        this.setData({ deviceList: deviceRes.data });
      } else {
        this.setData({ userLine: '（未分配线体或未授权）', deviceList: [] });
      }
    },
    onShowDialog(e) {
      const assetId = e.currentTarget.dataset.assetid;
      this.setData({ showDialog: true, currentAssetId: assetId, faultDesc: '' });
    },
    onHideDialog() {
      this.setData({ showDialog: false, currentAssetId: '', faultDesc: '' });
    },
    onInputFault(e) {
      this.setData({ faultDesc: e.detail.value });
    },
    async onSubmitFault() {
      const { currentAssetId, faultDesc, deviceList } = this.data;
      if (!faultDesc) {
        wx.showToast({ title: '请填写故障现象', icon: 'none' });
        return;
      }
      this.setData({ submitting: true });
      const db = wx.cloud.database();
      // 获取当前操作员信息
      const openid = wx.getStorageSync('openid');
      const userRes = await db.collection('Users').where({ _openid: openid, role: 'operator' }).get();
      const operatorName = userRes.data.length ? userRes.data[0].name : '';
      // 获取设备信息
      const device = deviceList.find(d => d.assetId === currentAssetId);
      // 写入维修记录
      await db.collection('RepairRecords').add({
        data: {
          assetId: device.assetId,
          type: device.type,
          line: device.line,
          reportTime: new Date(),
          operatorName,
          faultDesc,
          status: '待维修'
        }
      });
      // 更新设备状态
      await db.collection('Equipments').where({ assetId: currentAssetId }).update({
        data: { status: '待维修' }
      });
      wx.showToast({ title: '报修成功', icon: 'success' });
      this.setData({ showDialog: false, currentAssetId: '', faultDesc: '', submitting: false });
      this.loadData(); // 刷新设备列表
    }
  }
}); 