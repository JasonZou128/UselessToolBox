Component({
  data: {
    lineList: [],
    showAddForm: false,
    addLine: '',
    addWorkshop: ''
  },
  lifetimes: {
    attached() {
      this.getLineList();
    }
  },
  methods: {
    async getLineList() {
      try {
        const db = wx.cloud.database();
        const res = await db.collection('Lines').get();
        this.setData({ lineList: res.data });
      } catch (err) {
        wx.showToast({ title: '获取线体失败', icon: 'none' });
      }
    },
    onShowAddForm() {
      this.setData({ showAddForm: true, addLine: '', addWorkshop: '' });
    },
    onCancelAdd() {
      this.setData({ showAddForm: false });
    },
    onInputLine(e) {
      this.setData({ addLine: e.detail.value });
    },
    onInputWorkshop(e) {
      this.setData({ addWorkshop: e.detail.value });
    },
    async onConfirmAdd() {
      const { addLine, addWorkshop } = this.data;
      if (!addLine || !addWorkshop) {
        wx.showToast({ title: '请填写完整', icon: 'none' });
        return;
      }
      try {
        await wx.cloud.database().collection('Lines').add({
          data: { line: addLine.trim(), workshop: addWorkshop.trim() }
        });
        wx.showToast({ title: '新建成功', icon: 'success' });
        this.setData({ showAddForm: false, addLine: '', addWorkshop: '' });
        this.getLineList();
      } catch (err) {
        wx.showToast({ title: '新建失败', icon: 'none' });
      }
    },
    onEditLine(e) {
      const { id, line, workshop } = e.currentTarget.dataset;
      wx.showModal({
        title: '修改线体',
        content: `${line},${workshop}`,
        editable: true,
        placeholderText: '线体,车间',
        success: async (res) => {
          if (res.confirm && res.content) {
            const [newLine, newWorkshop] = res.content.split(',');
            if (!newLine || !newWorkshop) {
              wx.showToast({ title: '格式错误', icon: 'none' });
              return;
            }
            try {
              await wx.cloud.database().collection('Lines').doc(id).update({
                data: { line: newLine.trim(), workshop: newWorkshop.trim() }
              });
              wx.showToast({ title: '修改成功', icon: 'success' });
              this.getLineList();
            } catch (err) {
              wx.showToast({ title: '修改失败', icon: 'none' });
            }
          }
        }
      });
    },
    onDeleteLine(e) {
      const { id } = e.currentTarget.dataset;
      wx.showModal({
        title: '确认删除',
        content: '确定要删除该线体吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await wx.cloud.database().collection('Lines').doc(id).remove();
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.getLineList();
            } catch (err) {
              wx.showToast({ title: '删除失败', icon: 'none' });
            }
          }
        }
      });
    }
  }
}); 