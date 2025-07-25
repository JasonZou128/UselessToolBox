// 云函数入口文件
const cloud = require('@cloudbase/node-sdk');
const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
const db = app.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, username, password } = event;
  
  // 管理员登录验证
  if (action === 'login') {
    if (!username || !password) {
      return { code: 1, msg: '账号或密码不能为空' };
    }
    const res = await db.collection('admin').where({ username, password }).get();
    if (res.data && res.data.length > 0) {
      return { code: 0, msg: '登录成功' };
    } else {
      return { code: 2, msg: '账号或密码错误' };
    }
  }
  
  // 获取申请列表
  if (action === 'getApplyList') {
    try {
      const res = await db.collection('Users').where({
        status: 'pending'
      }).get();
      return { code: 0, data: res.data, msg: '获取成功' };
    } catch (err) {
      return { code: 3, msg: '获取申请列表失败', error: err.message };
    }
  }
  
  return { code: 4, msg: '未知操作' };
}; 