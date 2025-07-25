Component({
  data: {
    deviceList: [],
    allLines: [],
    allTypes: [],
    searchAssetId: '',
    searchLine: '',
    searchType: '',
    batchAssetIds: [],
    canBatchSet: false
  },
  lifetimes: {
    attached() {
      this.getDeviceList();
      this.getAllLinesAndTypes();
    }
  },
  methods: {
    async getDeviceList() {
      const db = wx.cloud.database();
      const res = await db.collection('Equipments').get();
      this.setData({ deviceList: res.data });
    },
    async getAllLinesAndTypes() {
      const db = wx.cloud.database();
      const res = await db.collection('Equipments').get();
      const lines = [...new Set(res.data.map(item => item.line))];
      const types = [...new Set(res.data.map(item => item.type))];
      this.setData({ allLines: lines, allTypes: types });
    },
    onInputAssetId(e) {
      this.setData({ searchAssetId: e.detail.value });
    },
    onLinePickerChange(e) {
      this.setData({ searchLine: this.data.allLines[e.detail.value] });
    },
    onTypePickerChange(e) {
      this.setData({ searchType: this.data.allTypes[e.detail.value] });
    },
    onScanAssetId() {
      wx.scanCode({
        onlyFromCamera: true,
        scanType: ['barCode', 'qrCode'],
        success: (res) => {
          this.setData({ searchAssetId: res.result });
        }
      });
    },
    async onSearch() {
      const db = wx.cloud.database();
      const { searchAssetId, searchLine, searchType } = this.data;
      let query = {};
      if (searchAssetId) query.assetId = searchAssetId;
      if (searchLine) query.line = searchLine;
      if (searchType) query.type = searchType;
      const res = await db.collection('Equipments').where(query).get();
      this.setData({
        deviceList: res.data,
        batchAssetIds: res.data.map(item => item.assetId),
        canBatchSet: res.data.length > 1 // 只要超过1个即可批量
      });
    },
    onBatchSetPlan() {
      wx.navigateTo({
        url: `/pages/repairman/maintain-detail/index?batch=true&assetIds=${encodeURIComponent(JSON.stringify(this.data.batchAssetIds))}`
      });
    },
    onDeviceTap(e) {
      const assetId = e.currentTarget.dataset.assetid;
      wx.navigateTo({ url: `/pages/repairman/maintain-detail/index?assetId=${assetId}` });
    }
  }
}); 