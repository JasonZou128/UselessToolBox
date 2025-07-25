Component({
  data: {
    userList: [],
    lineOptions: [],
    repairGroups: [],
    repairGroupNames: [],
    showLinePickerId: '',
    showGroupPickerId: '',
    selectedLine: '',
    selectedGroup: '',
    showAddGroup: false,
    newGroupName: ''
  },
  lifetimes: {
    attached() {
      this.getUserList();
      this.getLineOptions();
      this.getRepairGroups();
    }
  },
  methods: {
    async getUserList() {
      try {
        const db = wx.cloud.database();
        const res = await db.collection('Users').orderBy('status', 'asc').get();
        this.setData({ userList: res.data });
      } catch (err) {
        wx.showToast({ title: '获取用户列表失败', icon: 'none' });
      }
    },
    async getLineOptions() {
      try {
        const db = wx.cloud.database();
        const res = await db.collection('Lines').get();
        this.setData({ lineOptions: res.data.map(item => item.line) });
      } catch (err) {
        wx.showToast({ title: '获取线体失败', icon: 'none' });
      }
    },
    async getRepairGroups() {
      try {
        const db = wx.cloud.database();
        const res = await db.collection('RepairGroups').get();
        this.setData({
          repairGroups: res.data,
          repairGroupNames: res.data.map(item => item.name)
        });
      } catch (err) {
        wx.showToast({ title: '获取维修组失败', icon: 'none' });
      }
    },
    // 分配线体
    onShowLinePicker(e) {
      this.setData({ showLinePickerId: e.currentTarget.dataset.id, selectedLine: '' });
    },
    onLinePickerChange(e) {
      this.setData({ selectedLine: this.data.lineOptions[e.detail.value] });
    },
    async onConfirmLine() {
      const { showLinePickerId, selectedLine } = this.data;
      if (!selectedLine) {
        wx.showToast({ title: '请选择线体', icon: 'none' });
        return;
      }
      try {
        await wx.cloud.database().collection('Users').doc(showLinePickerId).update({
          data: { line: selectedLine }
        });
        wx.showToast({ title: '分配成功', icon: 'success' });
        this.setData({ showLinePickerId: '', selectedLine: '' });
        this.getUserList();
      } catch (err) {
        wx.showToast({ title: '分配失败', icon: 'none' });
      }
    },
    onCancelLine() {
      this.setData({ showLinePickerId: '', selectedLine: '' });
    },
    // 分配维修组
    onShowGroupPicker(e) {
      this.setData({ showGroupPickerId: e.currentTarget.dataset.id, selectedGroup: '', showAddGroup: false, newGroupName: '' });
    },
    onGroupPickerChange(e) {
      this.setData({ selectedGroup: this.data.repairGroups[e.detail.value].name });
    },
    async onConfirmGroup() {
      const { showGroupPickerId, selectedGroup } = this.data;
      if (!selectedGroup) {
        wx.showToast({ title: '请选择维修组', icon: 'none' });
        return;
      }
      try {
        await wx.cloud.database().collection('Users').doc(showGroupPickerId).update({
          data: { group: selectedGroup }
        });
        wx.showToast({ title: '分配成功', icon: 'success' });
        this.setData({ showGroupPickerId: '', selectedGroup: '' });
        this.getUserList();
      } catch (err) {
        wx.showToast({ title: '分配失败', icon: 'none' });
      }
    },
    onCancelGroup() {
      this.setData({ showGroupPickerId: '', selectedGroup: '', showAddGroup: false, newGroupName: '' });
    },
    // 新建维修组
    onShowAddGroup() {
      this.setData({ showAddGroup: true, newGroupName: '' });
    },
    onInputNewGroup(e) {
      this.setData({ newGroupName: e.detail.value });
    },
    async onConfirmAddGroup() {
      const { newGroupName } = this.data;
      if (!newGroupName) {
        wx.showToast({ title: '请输入组名', icon: 'none' });
        return;
      }
      try {
        await wx.cloud.database().collection('RepairGroups').add({ data: { name: newGroupName.trim() } });
        wx.showToast({ title: '新建成功', icon: 'success' });
        this.setData({ showAddGroup: false, newGroupName: '' });
        this.getRepairGroups();
      } catch (err) {
        wx.showToast({ title: '新建失败', icon: 'none' });
      }
    },
    // 删除维修组
    async onDeleteGroup(e) {
      const { name } = e.currentTarget.dataset;
      wx.showModal({
        title: '确认删除',
        content: `删除后所有属于该组的维修员的group都将被清空，确定删除“${name}”？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              // 删除组
              const db = wx.cloud.database();
              const groupRes = await db.collection('RepairGroups').where({ name }).get();
              if (groupRes.data.length) {
                await db.collection('RepairGroups').doc(groupRes.data[0]._id).remove();
              }
              // 清空所有属于该组的维修员的group字段
              const users = await db.collection('Users').where({ group: name }).get();
              for (const u of users.data) {
                await db.collection('Users').doc(u._id).update({ data: { group: '' } });
              }
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.getRepairGroups();
              this.getUserList();
            } catch (err) {
              wx.showToast({ title: '删除失败', icon: 'none' });
            }
          }
        }
      });
    },
    async onDelete(e) {
      const { id } = e.currentTarget.dataset;
      wx.showModal({
        title: '确认删除',
        content: '确定要删除该用户吗？',
        success: async (res) => {
          if (res.confirm) {
            wx.showLoading({ title: '删除中...' });
            try {
              await wx.cloud.database().collection('Users').doc(id).remove();
              wx.hideLoading();
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.getUserList();
            } catch (err) {
              wx.hideLoading();
              wx.showToast({ title: '删除失败', icon: 'none' });
            }
          }
        }
      });
    },
    onAuth: async function(e) {
      const { id, role } = e.currentTarget.dataset;
      wx.showLoading({ title: '授权中...' });
      try {
        await wx.cloud.database().collection('Users').doc(id).update({
          data: {
            status: 'active',
            role
          }
        });
        wx.hideLoading();
        wx.showToast({ title: '授权成功', icon: 'success' });
        this.getUserList();
      } catch (err) {
        wx.hideLoading();
        wx.showToast({ title: '授权失败', icon: 'none' });
      }
    }
  }
}); 