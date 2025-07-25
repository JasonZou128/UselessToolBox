// 云函数入口文件
const cloud = require('@cloudbase/node-sdk');
const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV
});
const db = app.database();

// 云函数入口函数
exports.main = async (event, context) => {
  // 创建集合
  const createCollection = async (collection) => {
    try {
      await db.createCollection(collection);
    } catch (e) {
      // 集合已存在时忽略
    }
  };

  await createCollection('Lines');
  await createCollection('Equipments');
  await createCollection('Users');
  await createCollection('admin');
  await createCollection('RepairGroups');
  await createCollection('InspectionPlans');
  await createCollection('MaintainPlans');
  await createCollection('RepairRecords');
  await createCollection('PushSettings');
  await createCollection('MaintainRecords');
  await createCollection('InspectionRecords');

  return {
    code: 0,
    msg: '数据库集合初始化完成'
  };
}; 