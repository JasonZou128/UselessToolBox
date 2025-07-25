Component({
  data: {
    userLine: '',
    userName: '',
    todoList: [], // 当前待点检卡片
    loading: false,
    showDialog: false,
    currentIdx: 0,
    currentSteps: [],
    currentStepIndex: 0,
    stepConfirm: [],
    scanAssetId: '',
    scanError: '',
    submitting: false
  },
  lifetimes: {
    attached() {
      this.initUserAndLoad();
    }
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '';
      let d;
      if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, day] = dateStr.split('-');
        d = new Date(Number(y), Number(m) - 1, Number(day));
      } else {
        d = new Date(dateStr);
      }
      if (isNaN(d.getTime())) return dateStr;
      return `${d.getFullYear()}年${(d.getMonth()+1).toString().padStart(2,'0')}月${d.getDate().toString().padStart(2,'0')}日`;
    },
    async initUserAndLoad() {
      this.setData({ loading: true });
      const db = wx.cloud.database();
      const openid = wx.getStorageSync('openid');
      const userRes = await db.collection('Users').where({ _openid: openid, role: 'operator' }).get();
      if (!userRes.data.length) {
        this.setData({ userLine: '（未分配线体）', userName: '', todoList: [], loading: false });
        return;
      }
      const user = userRes.data[0];
      this.setData({ userLine: user.line, userName: user.name });
      await this.loadTodoList(user.line);
      this.setData({ loading: false });
    },
    async loadTodoList(line) {
      const db = wx.cloud.database();
      const todayStr = (new Date()).toISOString().slice(0,10);
      const res = await db.collection('InspectionRecords').where({
        line,
        date: todayStr,
        status: '待点检'
      }).get();
      this.setData({ todoList: res.data });
    },
    // 弹窗相关
    async onShowDialog(e) {
      const idx = e.currentTarget.dataset.index;
      const rec = this.data.todoList[idx];
      const db = wx.cloud.database();
      // 查找 InspectionPlans 获取 steps
      const planRes = await db.collection('InspectionPlans').where({ assetId: rec.assetId }).get();
      const steps = planRes.data.length ? (planRes.data[0].steps || []) : [];
      this.setData({
        showDialog: true,
        currentIdx: idx,
        currentSteps: steps,
        currentStepIndex: 0,
        stepConfirm: [],
        scanAssetId: '',
        scanError: '',
        submitting: false
      });
    },
    onHideDialog() {
      this.setData({ showDialog: false, currentIdx: 0, currentSteps: [], currentStepIndex: 0, stepConfirm: [], scanAssetId: '', scanError: '', submitting: false });
    },
    onConfirmStep() {
      // 记录本步已确认
      const { stepConfirm, currentStepIndex } = this.data;
      stepConfirm[currentStepIndex] = true;
      this.setData({
        stepConfirm,
        currentStepIndex: this.data.currentStepIndex + 1
      });
    },
    onScanAssetId() {
      wx.scanCode({
        onlyFromCamera: false,
        scanType: ['barCode', 'qrCode'],
        success: res => {
          this.setData({ scanAssetId: res.result, scanError: '' });
        },
        fail: () => {
          this.setData({ scanError: '扫码失败，请重试' });
        }
      });
    },
    onInputAssetId(e) {
      this.setData({ scanAssetId: e.detail.value, scanError: '' });
    },
    async onSubmitFinish() {
      const { todoList, currentIdx, scanAssetId } = this.data;
      const rec = todoList[currentIdx];
      if (!scanAssetId || scanAssetId !== rec.assetId) {
        this.setData({ scanError: '设备编号不正确，请扫码或手动输入正确编号' });
        return;
      }
      this.setData({ submitting: true });
      const db = wx.cloud.database();
      try {
        const res = await db.collection('InspectionRecords').doc(rec._id).update({
          data: {
            status: '完成',
            finishTime: new Date(),
            stepsConfirm: this.data.currentSteps.map((s, i) => ({ ...s, confirmed: true })),
            confirmAssetId: scanAssetId
          }
        });
        console.log('onSubmitFinish update result:', res);
        if (res.stats && res.stats.updated === 0) {
          wx.showToast({ title: '未更新任何数据，可能是权限问题', icon: 'none' });
        } else {
          wx.showToast({ title: '点检完成', icon: 'success' });
          this.onHideDialog();
          this.initUserAndLoad();
        }
      } catch (err) {
        console.error('onSubmitFinish update error:', err);
        wx.showToast({ title: '更新失败', icon: 'none' });
      }
    },
    async onRest(e) {
      const idx = e.currentTarget.dataset.index;
      const rec = this.data.todoList[idx];
      const db = wx.cloud.database();
      try {
        const res = await db.collection('InspectionRecords').doc(rec._id).update({
          data: { status: '休班', finishTime: new Date() }
        });
        console.log('onRest update result:', res);
        if (res.stats && res.stats.updated === 0) {
          wx.showToast({ title: '未更新任何数据，可能是权限问题', icon: 'none' });
        } else {
          wx.showToast({ title: '已休班', icon: 'success' });
          this.initUserAndLoad();
        }
      } catch (err) {
        console.error('onRest update error:', err);
        wx.showToast({ title: '更新失败', icon: 'none' });
      }
    },
    stopPropagation() {}
  }
});
