Component({
  data: {
    // 点检
    inspectionTimes: [],
    showAddInspectionTimeDialog: false,
    addInspectionTime: '',
    // 月保养
    monthMaintainTimes: [],
    showAddMonthDialog: false,
    addMonth: 0,
    addDay: 1,
    addTime: '',
    // 季度保养
    quarterMaintainTimes: [],
    showAddQuarterDialog: false,
    addQuarterMonth: 0,
    addQuarterDay: 1,
    addQuarterTime: '',
    // 年保养
    yearMaintainTimes: [],
    showAddYearDialog: false,
    addYearMonth: 0,
    addYearDay: 1,
    addYearTime: '',
    // 周保养
    weekMaintainTimes: [],
    showAddWeekDialog: false,
    addWeekDay: 0,
    addWeekTime: '',
    // 通用
    monthOptions: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    dayOptions: Array.from({length: 31}, (_, i) => (i+1).toString()),
    weekOptions: ['周一','周二','周三','周四','周五','周六','周日']
  },
  lifetimes: {
    attached() {
      this.loadInspectionTimes();
      this.loadWeekMaintainTimes();
      this.loadMonthMaintainTimes();
      this.loadQuarterMaintainTimes();
      this.loadYearMaintainTimes();
    }
  },
  methods: {
    async loadInspectionTimes() {
      const db = wx.cloud.database();
      const res = await db.collection('PushSettings').where({ type: 'inspection' }).get();
      if (res.data.length) {
        this.setData({ inspectionTimes: res.data[0].times || [] });
      }
    },
    onShowAddInspectionTime() {
      this.setData({ showAddInspectionTimeDialog: true, addInspectionTime: '' });
    },
    onHideAddInspectionTimeDialog() {
      this.setData({ showAddInspectionTimeDialog: false, addInspectionTime: '' });
    },
    onAddInspectionTimeChange(e) {
      this.setData({ addInspectionTime: e.detail.value });
    },
    onConfirmAddInspectionTime() {
      const { addInspectionTime, inspectionTimes } = this.data;
      if (!addInspectionTime) {
        wx.showToast({ title: '请选择时间', icon: 'none' });
        return;
      }
      if (inspectionTimes.includes(addInspectionTime)) {
        wx.showToast({ title: '时间已存在', icon: 'none' });
        return;
      }
      this.setData({
        inspectionTimes: [...inspectionTimes, addInspectionTime],
        showAddInspectionTimeDialog: false,
        addInspectionTime: ''
      });
    },
    onDeleteInspectionTime(e) {
      const idx = e.currentTarget.dataset.index;
      let inspectionTimes = this.data.inspectionTimes.slice();
      inspectionTimes.splice(idx, 1);
      this.setData({ inspectionTimes });
    },
    async onSaveInspectionTimes() {
      const { inspectionTimes } = this.data;
      if (!inspectionTimes.length) {
        wx.showToast({ title: '请添加时间点', icon: 'none' });
        return;
      }
      const db = wx.cloud.database();
      const res = await db.collection('PushSettings').where({ type: 'inspection' }).get();
      if (res.data.length) {
        await db.collection('PushSettings').doc(res.data[0]._id).update({
          data: { times: inspectionTimes }
        });
      } else {
        await db.collection('PushSettings').add({
          data: { type: 'inspection', times: inspectionTimes, createTime: new Date() }
        });
      }
      wx.showToast({ title: '保存成功', icon: 'success' });
    },
    onShowAddMonthMaintainTime() {
      this.setData({ showAddMonthDialog: true, addMonth: 0, addDay: 1, addTime: '' });
    },
    onHideAddMonthMaintainTimeDialog() {
      this.setData({ showAddMonthDialog: false, addMonth: 0, addDay: 1, addTime: '' });
    },
    onAddMonthChange(e) {
      this.setData({ addMonth: Number(e.detail.value) });
    },
    onAddDayChange(e) {
      this.setData({ addDay: Number(this.data.dayOptions[e.detail.value]) });
    },
    onAddTimeChange(e) {
      this.setData({ addTime: e.detail.value });
    },
    onConfirmAddMonthMaintainTime() {
      const { addMonth, addDay, addTime, monthOptions, monthMaintainTimes } = this.data;
      if (!addTime) {
        wx.showToast({ title: '请选择时间', icon: 'none' });
        return;
      }
      if (monthMaintainTimes.length >= 12) {
        wx.showToast({ title: '最多12个时间点', icon: 'none' });
        return;
      }
      const newTime = { month: monthOptions[addMonth], day: addDay, time: addTime };
      this.setData({
        monthMaintainTimes: [...monthMaintainTimes, newTime],
        showAddMonthDialog: false,
        addMonth: 0,
        addDay: 1,
        addTime: ''
      });
    },
    onDeleteMonthMaintainTime(e) {
      const idx = e.currentTarget.dataset.index;
      let monthMaintainTimes = this.data.monthMaintainTimes.slice();
      monthMaintainTimes.splice(idx, 1);
      this.setData({ monthMaintainTimes });
    },
    async onSaveMonthMaintainTimes() {
      const { monthMaintainTimes } = this.data;
      if (!monthMaintainTimes.length) {
        wx.showToast({ title: '请添加时间点', icon: 'none' });
        return;
      }
      const db = wx.cloud.database();
      const res = await db.collection('PushSettings').where({ type: 'monthMaintain' }).get();
      if (res.data.length) {
        await db.collection('PushSettings').doc(res.data[0]._id).update({
          data: { times: monthMaintainTimes }
        });
      } else {
        await db.collection('PushSettings').add({
          data: { type: 'monthMaintain', times: monthMaintainTimes, createTime: new Date() }
        });
      }
      wx.showToast({ title: '保存成功', icon: 'success' });
    },
    async loadMonthMaintainTimes() {
      const db = wx.cloud.database();
      const res = await db.collection('PushSettings').where({ type: 'monthMaintain' }).get();
      if (res.data.length) {
        this.setData({ monthMaintainTimes: res.data[0].times || [] });
      } else {
        this.setData({ monthMaintainTimes: [] });
      }
    },
    async loadQuarterMaintainTimes() {
      const db = wx.cloud.database();
      const res = await db.collection('PushSettings').where({ type: 'quarterMaintain' }).get();
      if (res.data.length) {
        this.setData({ quarterMaintainTimes: res.data[0].times || [] });
      } else {
        this.setData({ quarterMaintainTimes: [] });
      }
    },
    async loadYearMaintainTimes() {
      const db = wx.cloud.database();
      const res = await db.collection('PushSettings').where({ type: 'yearMaintain' }).get();
      if (res.data.length) {
        this.setData({ yearMaintainTimes: res.data[0].times || [] });
      } else {
        this.setData({ yearMaintainTimes: [] });
      }
    },
    onShowAddQuarterMaintainTime() {
      this.setData({ showAddQuarterDialog: true, addQuarterMonth: 0, addQuarterDay: 1, addQuarterTime: '' });
    },
    onHideAddQuarterMaintainTimeDialog() {
      this.setData({ showAddQuarterDialog: false, addQuarterMonth: 0, addQuarterDay: 1, addQuarterTime: '' });
    },
    onAddQuarterMonthChange(e) {
      this.setData({ addQuarterMonth: Number(e.detail.value) });
    },
    onAddQuarterDayChange(e) {
      this.setData({ addQuarterDay: Number(this.data.dayOptions[e.detail.value]) });
    },
    onAddQuarterTimeChange(e) {
      this.setData({ addQuarterTime: e.detail.value });
    },
    onConfirmAddQuarterMaintainTime() {
      const { addQuarterMonth, addQuarterDay, addQuarterTime, monthOptions, quarterMaintainTimes } = this.data;
      if (!addQuarterTime) {
        wx.showToast({ title: '请选择时间', icon: 'none' });
        return;
      }
      if (quarterMaintainTimes.length >= 4) {
        wx.showToast({ title: '最多4个时间点', icon: 'none' });
        return;
      }
      const newTime = { month: monthOptions[addQuarterMonth], day: addQuarterDay, time: addQuarterTime };
      this.setData({
        quarterMaintainTimes: [...quarterMaintainTimes, newTime],
        showAddQuarterDialog: false,
        addQuarterMonth: 0,
        addQuarterDay: 1,
        addQuarterTime: ''
      });
    },
    onDeleteQuarterMaintainTime(e) {
      const idx = e.currentTarget.dataset.index;
      let quarterMaintainTimes = this.data.quarterMaintainTimes.slice();
      quarterMaintainTimes.splice(idx, 1);
      this.setData({ quarterMaintainTimes });
    },
    async onSaveQuarterMaintainTimes() {
      const { quarterMaintainTimes } = this.data;
      if (!quarterMaintainTimes.length) {
        wx.showToast({ title: '请添加时间点', icon: 'none' });
        return;
      }
      const db = wx.cloud.database();
      const res = await db.collection('PushSettings').where({ type: 'quarterMaintain' }).get();
      if (res.data.length) {
        await db.collection('PushSettings').doc(res.data[0]._id).update({
          data: { times: quarterMaintainTimes }
        });
      } else {
        await db.collection('PushSettings').add({
          data: { type: 'quarterMaintain', times: quarterMaintainTimes, createTime: new Date() }
        });
      }
      wx.showToast({ title: '保存成功', icon: 'success' });
    },
    async loadWeekMaintainTimes() {
      const db = wx.cloud.database();
      const res = await db.collection('PushSettings').where({ type: 'weekMaintain' }).get();
      if (res.data.length) {
        this.setData({ weekMaintainTimes: res.data[0].times || [] });
      }
    },
    onShowAddWeekMaintainTime() {
      this.setData({ showAddWeekDialog: true, addWeekDay: 0, addWeekTime: '' });
    },
    onHideAddWeekMaintainTimeDialog() {
      this.setData({ showAddWeekDialog: false, addWeekDay: 0, addWeekTime: '' });
    },
    onAddWeekDayChange(e) {
      this.setData({ addWeekDay: Number(e.detail.value) });
    },
    onAddWeekTimeChange(e) {
      this.setData({ addWeekTime: e.detail.value });
    },
    onConfirmAddWeekMaintainTime() {
      const { addWeekDay, addWeekTime, weekOptions, weekMaintainTimes } = this.data;
      if (!addWeekTime) {
        wx.showToast({ title: '请选择时间', icon: 'none' });
        return;
      }
      const newTime = { weekDay: weekOptions[addWeekDay], time: addWeekTime };
      this.setData({
        weekMaintainTimes: [...weekMaintainTimes, newTime],
        showAddWeekDialog: false,
        addWeekDay: 0,
        addWeekTime: ''
      });
    },
    onDeleteWeekMaintainTime(e) {
      const idx = e.currentTarget.dataset.index;
      let weekMaintainTimes = this.data.weekMaintainTimes.slice();
      weekMaintainTimes.splice(idx, 1);
      this.setData({ weekMaintainTimes });
    },
    async onSaveWeekMaintainTimes() {
      const { weekMaintainTimes } = this.data;
      if (!weekMaintainTimes.length) {
        wx.showToast({ title: '请添加时间点', icon: 'none' });
        return;
      }
      const db = wx.cloud.database();
      const res = await db.collection('PushSettings').where({ type: 'weekMaintain' }).get();
      if (res.data.length) {
        await db.collection('PushSettings').doc(res.data[0]._id).update({
          data: { times: weekMaintainTimes }
        });
      } else {
        await db.collection('PushSettings').add({
          data: { type: 'weekMaintain', times: weekMaintainTimes, createTime: new Date() }
        });
      }
      wx.showToast({ title: '保存成功', icon: 'success' });
    },
    refreshAllPushSettings() {
      this.loadInspectionTimes();
      this.loadWeekMaintainTimes();
      this.loadMonthMaintainTimes();
      this.loadQuarterMaintainTimes();
      this.loadYearMaintainTimes();
    }
  }
}); 