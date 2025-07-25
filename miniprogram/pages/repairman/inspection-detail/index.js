Page({
  data: {
    assetId: '',
    equipment: null,
    steps: [],
    newStepContent: '',
    periodOptions: ['日', '周', '月', '季', '年'],
    pushTimeOptions: ['单班', '双班'],
    period: '',
    pushTime: '',
    isBatch: false, // 新增
    assetIds: []    // 新增
  },
  onLoad(query) {
    if (query.batch === 'true') {
      this.setData({
        isBatch: true,
        assetIds: JSON.parse(decodeURIComponent(query.assetIds))
      });
      // 批量模式不加载单设备信息
    } else {
      const assetId = query.assetId || '';
      this.setData({ assetId });
      this.getEquipment(assetId);
      this.getInspectionPlan(assetId);
    }
  },
  async getEquipment(assetId) {
    const db = wx.cloud.database();
    const res = await db.collection('Equipments').where({ assetId }).get();
    if (res.data && res.data.length > 0) {
      this.setData({ equipment: res.data[0] });
    }
  },
  async getInspectionPlan(assetId) {
    const db = wx.cloud.database();
    const res = await db.collection('InspectionPlans').where({ assetId }).get();
    if (res.data && res.data.length > 0) {
      const plan = res.data[0];
      this.setData({
        steps: plan.steps || [],
        period: plan.period || '',
        pushTime: plan.pushTime || ''
      });
    }
  },
  onInputStep(e) {
    this.setData({ newStepContent: e.detail.value });
  },
  onAddStep() {
    const { newStepContent, steps } = this.data;
    if (!newStepContent) {
      wx.showToast({ title: '请输入点检内容', icon: 'none' });
      return;
    }
    const newStep = { step: steps.length + 1, content: newStepContent };
    this.setData({ steps: [...steps, newStep], newStepContent: '' });
  },
  onDeleteStep(e) {
    const idx = e.currentTarget.dataset.idx;
    let steps = this.data.steps.slice();
    steps.splice(idx, 1);
    steps = steps.map((item, i) => ({ ...item, step: i + 1 }));
    this.setData({ steps });
  },
  onPeriodChange(e) {
    this.setData({ period: this.data.periodOptions[e.detail.value] });
  },
  onPushTimeChange(e) {
    this.setData({ pushTime: this.data.pushTimeOptions[e.detail.value] });
  },
  async onSubmitPlan() {
    const { isBatch, assetIds, assetId, steps, period, pushTime } = this.data;
    if (!steps.length) {
      wx.showToast({ title: '请添加点检步骤', icon: 'none' });
      return;
    }
    if (!period || !pushTime) {
      wx.showToast({ title: '请选择周期和推送时间', icon: 'none' });
      return;
    }
    const db = wx.cloud.database();
    if (isBatch) {
      wx.showLoading({ title: '批量提交中...' });
      for (const id of assetIds) {
        const res = await db.collection('InspectionPlans').where({ assetId: id }).get();
        if (res.data && res.data.length > 0) {
          await db.collection('InspectionPlans').doc(res.data[0]._id).update({ data: { steps, period, pushTime } });
        } else {
          await db.collection('InspectionPlans').add({ data: { assetId: id, steps, period, pushTime } });
        }
      }
      wx.hideLoading();
      wx.showToast({ title: '批量提交成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 800);
    } else {
      const res = await db.collection('InspectionPlans').where({ assetId }).get();
      if (res.data && res.data.length > 0) {
        await db.collection('InspectionPlans').doc(res.data[0]._id).update({ data: { steps, period, pushTime } });
      } else {
        await db.collection('InspectionPlans').add({ data: { assetId, steps, period, pushTime } });
      }
      wx.showToast({ title: '提交成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 800);
    }
  }
}); 