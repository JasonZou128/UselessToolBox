Component({
  data: {
    group: '', // 当前维修员所属维修组
    maintainTodoList: [], // 待处理保养卡片列表
    showDialog: false, // 保养弹窗显示状态
    currentMaintain: null, // 当前操作的保养任务
    maintainDesc: '', // 保养内容输入
    submitting: false, // 保养提交状态
    filterIndex: 0, // 保养类型筛选索引，0=全部，1=周，2=月，3=季，4=年
    filteredList: [], // 当前筛选后的卡片列表
    currentSteps: [],
    currentStepIndex: 0,
  },
  lifetimes: {
    attached() {
      this.loadData();
    }
  },
  methods: {
    // 通用分页查询函数，获取所有数据
    async getAllData(collection, where = {}) {
      const db = wx.cloud.database();
      const allData = [];
      let hasMore = true;
      let skip = 0;
      const limit = 20;
      while (hasMore) {
        const res = await db.collection(collection).where(where).skip(skip).limit(limit).get();
        allData.push(...res.data);
        hasMore = res.data.length === limit;
        skip += limit;
      }
      return allData;
    },
    // 加载当前维修员分组及待保养任务
    async loadData() {
      const openid = wx.getStorageSync('openid');
      const db = wx.cloud.database();
      // 获取当前维修员的 group
      const userList = await this.getAllData('Users', { _openid: openid, role: 'repairman' });
      if (!userList.length) {
        this.setData({ group: '（未分配维修组）', maintainTodoList: [], filteredList: [] });
        return;
      }
      const group = userList[0].group;
      this.setData({ group });
      await this.loadPendingRecords(group);
    },
    // 只拉取 status=待保养 的记录并渲染，直接用 group 字段筛选
    async loadPendingRecords(group) {
      const maintainTodos = await this.getAllData('MaintainRecords', { status: '待保养', group });
      this.setData({ maintainTodoList: maintainTodos }, () => {
        this.updateFilteredList();
      });
    },
    updateFilteredList() {
      const { maintainTodoList, filterIndex } = this.data;
      let filtered = maintainTodoList;
      if (filterIndex && filterIndex > 0) {
        const periodArr = ['周', '月', '季', '年'];
        filtered = maintainTodoList.filter(item => item.period === periodArr[filterIndex - 1]);
      }
      this.setData({ filteredList: filtered });
    },
    onFilterChange(e) {
      this.setData({ filterIndex: Number(e.detail.value) }, () => {
        this.updateFilteredList();
      });
    },
    // 弹窗相关方法
    async onShowDialog(e) {
      const idx = e.currentTarget.dataset.index;
      const currentMaintain = this.data.maintainTodoList[idx];
      const db = wx.cloud.database();
      // 查找 MaintainPlans 中对应的步骤
      const planRes = await db.collection('MaintainPlans').where({
        assetId: currentMaintain.assetId,
        period: currentMaintain.period
      }).get();
      const steps = planRes.data.length ? (planRes.data[0].steps || []) : [];
      this.setData({
        showDialog: true,
        currentMaintain,
        maintainDesc: '',
        currentSteps: steps,
        currentStepIndex: 0
      });
    },
    onHideDialog() {
      this.setData({ showDialog: false, currentMaintain: null, maintainDesc: '', currentSteps: [], currentStepIndex: 0 });
    },
    onNextStep() {
      this.setData({
        currentStepIndex: this.data.currentStepIndex + 1
      });
    },
    onInputMaintain(e) {
      this.setData({ maintainDesc: e.detail.value });
    },
    // 提交保养内容，写入 MaintainRecords
    async onSubmitMaintain() {
      if (this.data.currentStepIndex < this.data.currentSteps.length) {
        wx.showToast({ title: '请先完成所有步骤', icon: 'none' });
        return;
      }
      const { currentMaintain, maintainDesc, currentSteps } = this.data;
      if (!maintainDesc) {
        wx.showToast({ title: '请填写保养内容', icon: 'none' });
        return;
      }
      this.setData({ submitting: true });
      const db = wx.cloud.database();
      const openid = wx.getStorageSync('openid');
      const userList = await this.getAllData('Users', { _openid: openid, role: 'repairman' });
      const repairmanName = userList.length ? userList[0].name : '';
      await db.collection('MaintainRecords').doc(currentMaintain._id).update({
        data: {
          steps: currentSteps,
          desc: maintainDesc,
          repairmanName,
          maintainTime: new Date(),
          status: '已完成'
        }
      });
      wx.showToast({ title: '保养完成', icon: 'success' });
      this.setData({ showDialog: false, currentMaintain: null, maintainDesc: '', submitting: false });
      this.loadData();
    }
  }
}); 