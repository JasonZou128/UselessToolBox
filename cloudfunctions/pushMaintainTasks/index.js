const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 工具函数：获取所有数据（分页）
async function getAllData(collection, where = {}) {
  const allData = [];
  let hasMore = true;
  let skip = 0;
  const limit = 100;
  while (hasMore) {
    const res = await db.collection(collection).where(where).skip(skip).limit(limit).get();
    allData.push(...res.data);
    hasMore = res.data.length === limit;
    skip += limit;
  }
  return allData;
}

exports.main = async (event, context) => {
  // event 可选 { fromDate: '2024-01-01' }，不传则默认本年1月1日
  const now = new Date();
  const year = now.getFullYear();
  const fromDate = event && event.fromDate ? new Date(event.fromDate) : new Date(year, 0, 1);

  // 1. 获取所有设备
  const eqList = await getAllData('Equipments');
  // 2. 获取所有保养计划
  const plans = await getAllData('MaintainPlans');
  // 3. 获取推送设置
  const pushSettings = await getAllData('PushSettings');
  // 4. 获取已存在的待保养记录
  const existRecords = await getAllData('MaintainRecords', { status: '待保养' });

  let totalPushed = 0;
  const toAdd = [];
  for (const plan of plans) {
    const device = eqList.find(e => e.assetId === plan.assetId);
    if (!device) continue;
    let type = '';
    if (plan.period === '周') type = 'weekMaintain';
    if (plan.period === '月') type = 'monthMaintain';
    if (plan.period === '季') type = 'quarterMaintain';
    if (plan.period === '年') type = 'yearMaintain';
    const setting = pushSettings.find(s => s.type === type);
    if (!setting) continue;
    for (const timePoint of setting.times) {
      const allDates = getAllShouldPushDates(plan.period, timePoint, now, fromDate);
      for (const dateObj of allDates) {
        const periodDisplay = getPeriodDisplay(plan.period, dateObj);
        const dueDate = getDueDate(plan.period, dateObj);
        // 判断该记录是否已存在
        const exist = existRecords.some(r => r.assetId === plan.assetId && r.planId === plan._id && r.period === plan.period && r.dueDate === dueDate);
        if (!exist) {
          toAdd.push({
            assetId: plan.assetId,
            planId: plan._id,
            period: plan.period,
            periodDisplay,
            dueDate,
            status: '待保养',
            type: device.type,
            line: device.line,
            group: device.repairGroup,
            steps: plan.steps || [],
            createTime: new Date()
          });
        }
      }
    }
  }
  // 批量写入，每次最多20条
  while (toAdd && toAdd.length) {
    const batch = toAdd.splice(0, 20);
    const addPromises = batch.map(item => db.collection('MaintainRecords').add({ data: item }));
    await Promise.all(addPromises);
    totalPushed += batch.length;
  }
  return { code: 0, msg: '保养推送完成', totalPushed };
};

// 生成所有应推送的时间点
function getAllShouldPushDates(period, timePoint, now, fromDate) {
  const dates = [];
  const year = now.getFullYear();
  if (period === '月') {
    for (let m = 1; m <= now.getMonth() + 1; m++) {
      let tpMonth = timePoint.month;
      if (typeof tpMonth === 'string' && tpMonth.endsWith('月')) tpMonth = parseInt(tpMonth);
      if (tpMonth !== m) continue;
      const day = timePoint.day;
      const date = new Date(year, m - 1, day);
      if (date <= now && (!fromDate || date >= fromDate)) dates.push(date);
    }
  } else if (period === '季') {
    let tpMonth = timePoint.month;
    if (typeof tpMonth === 'string' && tpMonth.endsWith('月')) tpMonth = parseInt(tpMonth);
    if (tpMonth > now.getMonth() + 1) return dates;
    const date = new Date(year, tpMonth - 1, timePoint.day);
    if (date <= now && (!fromDate || date >= fromDate)) dates.push(date);
  } else if (period === '年') {
    let tpMonth = timePoint.month;
    if (typeof tpMonth === 'string' && tpMonth.endsWith('月')) tpMonth = parseInt(tpMonth);
    const date = new Date(year, tpMonth - 1, timePoint.day);
    if (date <= now && (!fromDate || date >= fromDate)) dates.push(date);
  } else if (period === '周') {
    const weekMap = { '周一': 1, '周二': 2, '周三': 3, '周四': 4, '周五': 5, '周六': 6, '周日': 0 };
    const targetDay = weekMap[timePoint.weekDay];
    let d = new Date(year, 0, 1);
    while (d <= now) {
      if (d.getDay() === targetDay && (!fromDate || d >= fromDate)) {
        dates.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }
  }
  return dates;
}

function getPeriodDisplay(period, dateObj) {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const week = getWeekNumber(dateObj);
  if (period === '周') return `周期：第${week}周`;
  if (period === '月') return `周期：${month}月`;
  if (period === '季') {
    const quarter = Math.floor((month - 1) / 3) + 1;
    return `周期：第${quarter}季度`;
  }
  if (period === '年') return `周期：${year}年`;
  return '';
}

function getDueDate(period, dateObj) {
  let days = 0;
  if (period === '周') days = 5;
  if (period === '月') days = 25;
  if (period === '季') days = 80;
  if (period === '年') days = 280;
  const due = new Date(dateObj.getTime() + days * 24 * 60 * 60 * 1000);
  return `${due.getFullYear()}-${due.getMonth() + 1}-${due.getDate()}`;
}

function getWeekNumber(date) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = ((date - firstDay + 86400000) / 86400000);
  return Math.ceil((dayOfYear + firstDay.getDay()) / 7);
} 