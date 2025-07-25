Page({
  data: {
    assetId: '',
    equipment: null,
    maintainPlans: [], // 保养计划列表
    isBatch: false,
    assetIds: [],
    showAddDialog: false, // 新增/编辑保养计划弹窗
    newStepContent: '',
    newPeriod: '',
    newSteps: [], // 新增的步骤列表
    periodOptions: ['周', '月', '季', '年'],
    editPlanId: '', // 编辑时的planId
    showDeleteDialog: false, // 删除弹窗
    deletePlanId: '' // 待删除的planId
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
      this.getMaintainPlans(assetId);
    }
  },
  async getEquipment(assetId) {
    const db = wx.cloud.database();
    const res = await db.collection('Equipments').where({ assetId }).get();
    if (res.data && res.data.length > 0) {
      this.setData({ equipment: res.data[0] });
    }
  },
  async getMaintainPlans(assetId) {
    const db = wx.cloud.database();
    const res = await db.collection('MaintainPlans').where({ assetId }).get();
    if (res.data && res.data.length > 0) {
      this.setData({ maintainPlans: res.data });
    } else {
      this.setData({ maintainPlans: [] });
    }
  },
  onShowAddDialog() {
    this.setData({ 
      showAddDialog: true,
      newSteps: [],
      newStepContent: '',
      newPeriod: '',
      editPlanId: ''
    });
  },
  onHideAddDialog() {
    this.setData({ 
      showAddDialog: false,
      newStepContent: '',
      newPeriod: '',
      newSteps: [],
      editPlanId: ''
    });
  },
  onInputStep(e) {
    this.setData({ newStepContent: e.detail.value });
  },
  onAddStep() {
    const { newStepContent, newSteps } = this.data;
    if (!newStepContent) {
      wx.showToast({ title: '请输入保养内容', icon: 'none' });
      return;
    }
    const newStep = { step: newSteps.length + 1, content: newStepContent };
    this.setData({ 
      newSteps: [...newSteps, newStep], 
      newStepContent: '' 
    });
  },
  onDeleteStep(e) {
    const idx = e.currentTarget.dataset.idx;
    let newSteps = this.data.newSteps.slice();
    newSteps.splice(idx, 1);
    newSteps = newSteps.map((item, i) => ({ ...item, step: i + 1 }));
    this.setData({ newSteps });
  },
  onPeriodChange(e) {
    this.setData({ newPeriod: this.data.periodOptions[e.detail.value] });
  },
  // 编辑功能
  async onEditPlan(e) {
    const id = e.currentTarget.dataset.id;
    const plan = this.data.maintainPlans.find(p => p._id === id);
    if (plan) {
      this.setData({
        showAddDialog: true,
        editPlanId: id,
        newSteps: plan.steps || [],
        newPeriod: plan.period || '',
        newStepContent: ''
      });
    }
  },
  async onAddOrEditMaintainPlan() {
    const { newSteps, newPeriod, assetId, isBatch, assetIds, editPlanId } = this.data;
    if (!newSteps.length) {
      wx.showToast({ title: '请添加保养步骤', icon: 'none' });
      return;
    }
    if (!newPeriod) {
      wx.showToast({ title: '请选择保养周期', icon: 'none' });
      return;
    }
    const db = wx.cloud.database();
    if (editPlanId) {
      // 编辑保存
      await db.collection('MaintainPlans').doc(editPlanId).update({
        data: {
          steps: newSteps,
          period: newPeriod
        }
      });
      wx.showToast({ title: '保存成功', icon: 'success' });
      this.getMaintainPlans(assetId);
    } else if (isBatch) {
      wx.showLoading({ title: '批量添加中...' });
      for (const id of assetIds) {
        await db.collection('MaintainPlans').add({ 
          data: { 
            assetId: id, 
            steps: newSteps,
            period: newPeriod,
            createTime: new Date()
          } 
        });
      }
      wx.hideLoading();
      wx.showToast({ title: '批量添加成功', icon: 'success' });
      // 不自动返回，刷新计划列表并关闭弹窗
      if (assetIds.length > 0) {
        this.getMaintainPlans(assetIds[0]);
      }
    } else {
      await db.collection('MaintainPlans').add({ 
        data: { 
          assetId, 
          steps: newSteps,
          period: newPeriod,
          createTime: new Date()
        } 
      });
      wx.showToast({ title: '添加成功', icon: 'success' });
      this.getMaintainPlans(assetId); // 刷新列表
    }
    this.onHideAddDialog();
  },
  // 删除功能
  onDeletePlan(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ showDeleteDialog: true, deletePlanId: id });
  },
  onHideDeleteDialog() {
    this.setData({ showDeleteDialog: false, deletePlanId: '' });
  },
  async onConfirmDeletePlan() {
    const { deletePlanId, assetId } = this.data;
    if (!deletePlanId) return;
    const db = wx.cloud.database();
    await db.collection('MaintainPlans').doc(deletePlanId).remove();
    wx.showToast({ title: '删除成功', icon: 'success' });
    this.setData({ showDeleteDialog: false, deletePlanId: '' });
    this.getMaintainPlans(assetId);
  }
}); 