import xlsx from '../../utils/xlsx.min.js';

Component({
  data: {
    startDate: '',
    endDate: '',
    lineOptions: [],
    typeOptions: [],
    repairmanOptions: [],
    searchLine: '',
    searchType: '',
    searchRepairman: '',
    tableData: [],
    allFields: ['assetId','type','line','reportTime','operatorName','faultDesc','repairmanName','repairDesc','finishTime','duration','status'],
    fieldMap: {
      assetId: '设备编号',
      type: '类型',
      line: '线体',
      reportTime: '报修时间',
      operatorName: '操作员',
      faultDesc: '故障描述',
      repairmanName: '维修员',
      repairDesc: '维修内容',
      finishTime: '维修完成时间',
      duration: '维修用时(分钟)',
      status: '状态'
    }
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
    async initOptions() {
      const db = wx.cloud.database();
      // 获取线体、类型、维修员选项
      const eqRes = await db.collection('Equipments').get();
      const lines = [...new Set(eqRes.data.map(e => e.line))];
      const types = [...new Set(eqRes.data.map(e => e.type))];
      const repairRes = await db.collection('Users').where({ role: 'repairman' }).get();
      const repairmans = [...new Set(repairRes.data.map(u => u.name))];
      this.setData({ lineOptions: lines, typeOptions: types, repairmanOptions: repairmans });
    },
    onStartDateChange(e) { this.setData({ startDate: e.detail.value }); },
    onEndDateChange(e) { this.setData({ endDate: e.detail.value }); },
    onLineChange(e) { this.setData({ searchLine: this.data.lineOptions[e.detail.value] }); },
    onTypeChange(e) { this.setData({ searchType: this.data.typeOptions[e.detail.value] }); },
    onRepairmanChange(e) { this.setData({ searchRepairman: this.data.repairmanOptions[e.detail.value] }); },
    async onSearch() {
      const db = wx.cloud.database();
      let query = {};
      if (this.data.startDate) query.reportTime = db.command.gte(new Date(this.data.startDate + ' 00:00:00'));
      if (this.data.endDate) query.reportTime = Object.assign(query.reportTime||{}, db.command.lte(new Date(this.data.endDate + ' 23:59:59')));
      if (this.data.searchLine) query.line = this.data.searchLine;
      if (this.data.searchType) query.type = this.data.searchType;
      if (this.data.searchRepairman) query.repairmanName = this.data.searchRepairman;
      const res = await db.collection('RepairRecords').where(query).orderBy('reportTime','desc').get();
      // 格式化时间字段
      const tableData = res.data.map(row => ({
        ...row,
        reportTime: this.formatTime(row.reportTime),
        finishTime: this.formatTime(row.finishTime)
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
      const data = tableData.map(row => allFields.map(f => row[f] || ''));
      const ws = xlsx.utils.aoa_to_sheet([header, ...data]);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, '维修报表');
      const out = xlsx.write(wb, { type: 'array', bookType: 'xlsx' });
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/repair_report_${Date.now()}.xlsx`;
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
    }
  }
}); 