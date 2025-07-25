Component({
  data: {
    equipmentList: [],
    lineOptions: [],
    repairGroupOptions: [],
    showAddForm: false,
    showEditForm: false,
    editId: '',
    addAssetId: '',
    addType: '',
    addLine: '',
    addRepairGroup: '',
  },
  lifetimes: {
    attached() {
      this.getEquipmentList();
      this.getLineOptions();
      this.getRepairGroupOptions();
    }
  },
  methods: {
    async getEquipmentList() {
      try {
        const db = wx.cloud.database();
        const res = await db.collection('Equipments').get();
        this.setData({ equipmentList: res.data });
      } catch (err) {
        wx.showToast({ title: '获取设备失败', icon: 'none' });
      }
    },
    async getLineOptions() {
      try {
        const db = wx.cloud.database();
        const res = await db.collection('Lines').get();
        this.setData({ lineOptions: res.data.map(item => item.line) });
      } catch (err) {
        wx.showToast({ title: '获取线体选项失败', icon: 'none' });
      }
    },
    async getRepairGroupOptions() {
      try {
        const db = wx.cloud.database();
        const res = await db.collection('RepairGroups').get();
        this.setData({ repairGroupOptions: res.data.map(item => item.name) });
      } catch (err) {
        wx.showToast({ title: '获取维修组失败', icon: 'none' });
      }
    },
    onShowAddForm() {
      this.setData({ showAddForm: true, showEditForm: false, editId: '', addAssetId: '', addType: '', addLine: '', addRepairGroup: '' });
    },
    onCancelAdd() {
      this.setData({ showAddForm: false });
    },
    onInputAssetId(e) {
      this.setData({ addAssetId: e.detail.value });
    },
    onInputType(e) {
      this.setData({ addType: e.detail.value });
    },
    onLinePickerChange(e) {
      this.setData({ addLine: this.data.lineOptions[e.detail.value] });
    },
    onRepairGroupPickerChange(e) {
      this.setData({ addRepairGroup: this.data.repairGroupOptions[e.detail.value] });
    },
    async onConfirmAdd() {
      const { addAssetId, addType, addLine, addRepairGroup } = this.data;
      if (!addAssetId || !addType || !addLine) {
        wx.showToast({ title: '请填写完整', icon: 'none' });
        return;
      }
      try {
        await wx.cloud.database().collection('Equipments').add({
          data: {
            assetId: addAssetId.trim(),
            type: addType.trim(),
            line: addLine,
            repairGroup: addRepairGroup || '',
            status: '运行中' // 新增：初始状态
          }
        });
        wx.showToast({ title: '新建成功', icon: 'success' });
        this.setData({ showAddForm: false, addAssetId: '', addType: '', addLine: '', addRepairGroup: '' });
        this.getEquipmentList();
      } catch (err) {
        wx.showToast({ title: '新建失败', icon: 'none' });
      }
    },
    // 编辑设备
    onShowEditForm(e) {
      const { id, assetid, type, line, repairgroup } = e.currentTarget.dataset;
      this.setData({
        showEditForm: true,
        showAddForm: false,
        editId: id,
        addAssetId: assetid,
        addType: type,
        addLine: line,
        addRepairGroup: repairgroup
      });
    },
    onCancelEdit() {
      this.setData({ showEditForm: false, editId: '', addAssetId: '', addType: '', addLine: '', addRepairGroup: '' });
    },
    async onConfirmEdit() {
      const { editId, addAssetId, addType, addLine, addRepairGroup } = this.data;
      if (!addAssetId || !addType || !addLine) {
        wx.showToast({ title: '请填写完整', icon: 'none' });
        return;
      }
      try {
        await wx.cloud.database().collection('Equipments').doc(editId).update({
          data: {
            assetId: addAssetId.trim(),
            type: addType.trim(),
            line: addLine,
            repairGroup: addRepairGroup || ''
          }
        });
        wx.showToast({ title: '修改成功', icon: 'success' });
        this.setData({ showEditForm: false, editId: '', addAssetId: '', addType: '', addLine: '', addRepairGroup: '' });
        this.getEquipmentList();
      } catch (err) {
        wx.showToast({ title: '修改失败', icon: 'none' });
      }
    },
    // 删除设备
    async onDeleteEquipment(e) {
      const { id } = e.currentTarget.dataset;
      wx.showModal({
        title: '确认删除',
        content: '确定要删除该设备吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await wx.cloud.database().collection('Equipments').doc(id).remove();
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.getEquipmentList();
            } catch (err) {
              wx.showToast({ title: '删除失败', icon: 'none' });
            }
          }
        }
      });
    }
  }
}); 