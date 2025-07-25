import xlsx from '../../utils/xlsx.min.js';

Component({
  data: {
    periodOptions: ['周', '月', '季', '年'],
    lineOptions: [],
    typeOptions: [],
    searchPeriod: '',
    searchLine: '',
    searchType: '',
    searchAssetId: '',
    tableData: [],
    allFields: [
      'assetId','type','line','period','periodDisplay','dueDate','status','group','steps','repairmanName','maintainTime','desc','createTime'
    ],
    fieldMap: {
      assetId: '设备编号',
      type: '类型',
      line: '线体',
      period: '保养周期',
      periodDisplay: '周期显示',
      dueDate: '应完成日期',
      status: '状态',
      group: '维修组',
      steps: '步骤',
      repairmanName: '维修员',
      maintainTime: '保养完成时间',
      desc: '保养内容备注',
      createTime: '创建时间'
    },
    stepsExpand: {} // 控制steps折叠展开
  },
  lifetimes: {
    attached() {
      this.initOptions();
    }
  },
  methods: {
    formatTime(val) {
      if (!val) return '';
      const d = new Date(val);
      return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
    },
    async getAllData(collection, where = {}, orderField = '', order = 'desc') {
      const db = wx.cloud.database();
      const allData = [];
      let hasMore = true;
      let skip = 0;
      const limit = 20;
      while (hasMore) {
        let query = db.collection(collection).where(where);
        if (orderField) query = query.orderBy(orderField, order);
        const res = await query.skip(skip).limit(limit).get();
        allData.push(...res.data);
        hasMore = res.data.length === limit;
        skip += limit;
      }
      return allData;
    },
    async initOptions() {
      const db = wx.cloud.database();
      const eqRes = await db.collection('Equipments').get();
      const lines = [...new Set(eqRes.data.map(e => e.line))];
      const types = [...new Set(eqRes.data.map(e => e.type))];
      this.setData({ lineOptions: lines, typeOptions: types });
    },
    onPeriodChange(e) { this.setData({ searchPeriod: this.data.periodOptions[e.detail.value] }); },
    onLineChange(e) { this.setData({ searchLine: this.data.lineOptions[e.detail.value] }); },
    onTypeChange(e) { this.setData({ searchType: this.data.typeOptions[e.detail.value] }); },
    onAssetIdInput(e) { this.setData({ searchAssetId: e.detail.value }); },
    async onSearch() {
      let query = {};
      if (this.data.searchPeriod) query.period = this.data.searchPeriod;
      if (this.data.searchLine) query.line = this.data.searchLine;
      if (this.data.searchType) query.type = this.data.searchType;
      if (this.data.searchAssetId) query.assetId = this.data.searchAssetId;
      const allData = await this.getAllData('MaintainRecords', query, 'dueDate', 'desc');
      // 格式化时间字段
      const tableData = allData.map(row => ({
        ...row,
        maintainTime: this.formatTime(row.maintainTime),
        createTime: this.formatTime(row.createTime),
        dueDate: row.dueDate || '',
        steps: row.steps || []
      }));
      this.setData({ tableData });
    },
    onExport() {
      const { tableData, allFields, fieldMap } = this.data;
      if (!tableData.length) {
        wx.showToast({ title: '无数据可导出', icon: 'none' });
        return;
      }
      const header = allFields.map(f => fieldMap[f] || f);
      const data = tableData.map(row => allFields.map(f => {
        if (f === 'steps') {
          return (row[f] && row[f].length) ? row[f].map((s,i) => `步骤${i+1}:${s.content}`).join('\n') : '';
        }
        return row[f] || '';
      }));
      const ws = xlsx.utils.aoa_to_sheet([header, ...data]);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, '保养报表');
      const out = xlsx.write(wb, { type: 'array', bookType: 'xlsx' });
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/maintain_report_${Date.now()}.xlsx`;
      fs.writeFile({
        filePath,
        data: out,
        encoding: 'binary',
        success: () => {
          wx.openDocument({ filePath, fileType: 'xlsx' });
        },
        fail: () => {
          wx.showToast({ title: '导出失败', icon: 'none' });
        }
      });
    },
    // steps 展开/收起
    onToggleSteps(e) {
      const idx = e.currentTarget.dataset.index;
      const stepsExpand = { ...this.data.stepsExpand };
      stepsExpand[idx] = !stepsExpand[idx];
      this.setData({ stepsExpand });
    }
  }
}); 