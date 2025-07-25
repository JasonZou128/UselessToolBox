import xlsx from '../../utils/xlsx.min.js';

Component({
  data: {
    assetId: '',
    startDate: '',
    endDate: '',
    lineOptions: [],
    typeOptions: [],
    searchLine: '',
    searchType: '',
    statusOptions: ['待点检','完成','休班','缺勤'],
    searchStatus: '',
    tableData: [],
    allFields: [
      'assetId','type','line','date','period','pushTime','status','operatorName','finishTime','stepsConfirm','confirmAssetId','createTime'
    ],
    fieldMap: {
      assetId: '设备编号',
      type: '类型',
      line: '线体',
      date: '点检日期',
      period: '周期',
      pushTime: '推送时间',
      status: '状态',
      operatorName: '操作员',
      finishTime: '完成时间',
      stepsConfirm: '点检步骤确认',
      confirmAssetId: '点检确认设备编号',
      createTime: '创建时间'
    },
    stepsExpand: {}
  },
  lifetimes: {
    attached() {
      this.initOptions();
      this.onSearch(); // 自动加载数据
    }
  },
  methods: {
    formatTime(val) {
      if (!val) return '';
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
    },
    async initOptions() {
      const db = wx.cloud.database();
      const eqRes = await db.collection('Equipments').get();
      const lines = [...new Set(eqRes.data.map(e => e.line))];
      const types = [...new Set(eqRes.data.map(e => e.type))];
      this.setData({ lineOptions: lines, typeOptions: types });
    },
    onAssetIdInput(e) { this.setData({ assetId: e.detail.value }); },
    onStartDateChange(e) { this.setData({ startDate: e.detail.value }); },
    onEndDateChange(e) { this.setData({ endDate: e.detail.value }); },
    onLineChange(e) { this.setData({ searchLine: this.data.lineOptions[e.detail.value] }); },
    onTypeChange(e) { this.setData({ searchType: this.data.typeOptions[e.detail.value] }); },
    onStatusChange(e) { this.setData({ searchStatus: this.data.statusOptions[e.detail.value] }); },
    async onSearch() {
      const db = wx.cloud.database();
      let query = {};
      if (this.data.assetId) query.assetId = db.RegExp({
        regexp: this.data.assetId,
        options: 'i'
      });
      if (this.data.startDate) query.createTime = db.command.gte(new Date(this.data.startDate + ' 00:00:00'));
      if (this.data.endDate) query.createTime = Object.assign(query.createTime||{}, db.command.lte(new Date(this.data.endDate + ' 23:59:59')));
      if (this.data.searchLine) query.line = this.data.searchLine;
      if (this.data.searchType) query.type = this.data.searchType;
      if (this.data.searchStatus) query.status = this.data.searchStatus;
      // 获取全部数据（分页）
      let all = [], skip = 0, limit = 100;
      while (true) {
        const res = await db.collection('InspectionRecords').where(query).orderBy('createTime','desc').skip(skip).limit(limit).get();
        all = all.concat(res.data);
        if (res.data.length < limit) break;
        skip += limit;
      }
      // 格式化
      const tableData = all.map(row => ({
        ...row,
        finishTime: this.formatTime(row.finishTime),
        createTime: this.formatTime(row.createTime),
        stepsConfirm: row.stepsConfirm || []
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
        if (f === 'stepsConfirm') {
          return (row[f] && row[f].length) ? row[f].map((s,i) => `步骤${i+1}:${s.content || ''}${s.confirmed?'（已确认）':''}`).join('\n') : '';
        }
        return row[f] || '';
      }));
      const ws = xlsx.utils.aoa_to_sheet([header, ...data]);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, '点检报表');
      const out = xlsx.write(wb, { type: 'array', bookType: 'xlsx' });
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/inspection_report_${Date.now()}.xlsx`;
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
    onToggleSteps(e) {
      const idx = e.currentTarget.dataset.index;
      const stepsExpand = { ...this.data.stepsExpand };
      stepsExpand[idx] = !stepsExpand[idx];
      this.setData({ stepsExpand });
    }
  }
}); 