const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  // event 传入 { pushTime: "09:00" } 或 "21:00"
  const pushTime = event.pushTime; // 当前推送时间点
  if (!pushTime) return { code: 2, msg: '缺少 pushTime 参数' };
  const now = new Date();
  const pushDateStr = now.toISOString().slice(0, 10); // 始终用当天日期

  // 1. 获取所有线体
  const linesRes = await db.collection('Lines').get();
  const lines = linesRes.data.map(l => l.name);

  // 2. 获取所有设备
  const eqRes = await db.collection('Equipments').get();
  const eqList = eqRes.data;

  // 3. 获取所有点检计划
  const planRes = await db.collection('InspectionPlans').get();
  const plans = planRes.data;

  // 4. 获取推送设置
  const pushRes = await db.collection('PushSettings').where({ type: 'inspection' }).get();
  const pushSetting = pushRes.data.length ? pushRes.data[0] : null;
  if (!pushSetting) return { code: 1, msg: '无推送设置' };

  // 5. 获取当天已推送的记录
  const existRes = await db.collection('InspectionRecords').where({
    date: pushDateStr,
    pushTime
  }).get();
  const existRecords = existRes.data;

  let totalPushed = 0, totalFinished = 0;

  // 6. 推送逻辑
  for (const plan of plans) {
    const eq = eqList.find(e => e.assetId === plan.assetId);
    if (!eq) continue;
    // 判断该计划当前班次是否需要推送
    let times = [];
    if (plan.pushTime === '单班') times = [pushSetting.times[0]];
    else if (plan.pushTime === '双班') times = pushSetting.times.slice(0,2);
    else times = [pushSetting.times[0]];
    if (!times.includes(pushTime)) continue;

    // 检查该设备该时间点是否已推送
    const exist = existRecords.some(r => r.assetId === plan.assetId && r.pushTime === pushTime);
    if (!exist) {
      // 终止上一轮未完成的推送（缺勤）
      await finishLastUnfinished(db, eq.line, plan.assetId, pushTime, pushDateStr, times);
      // 推送新卡片（不写operatorName）
      await db.collection('InspectionRecords').add({
        data: {
          assetId: plan.assetId,
          type: eq.type,
          line: eq.line,
          planId: plan._id,
          period: plan.period,
          date: pushDateStr,
          pushTime: pushTime,
          status: '待点检',
          createTime: new Date()
        }
      });
      totalPushed++;
    }
  }

  return { code: 0, msg: '推送完成', totalPushed, totalFinished };
};

// 终止上一轮未完成的推送（缺勤）
async function finishLastUnfinished(db, line, assetId, pushTime, todayStr, allTimes) {
  if (allTimes && allTimes.length === 2) {
    const [time0, time1] = allTimes;
    if (pushTime === time0) {
      // 终结前一天 time1 未完成的推送
      const yesterday = new Date(new Date(todayStr).getTime() - 24*60*60*1000);
      const ystr = yesterday.toISOString().slice(0,10);
      const res = await db.collection('InspectionRecords').where({
        line,
        assetId,
        pushTime: time1,
        status: '待点检',
        date: ystr
      }).get();
      for (const rec of res.data) {
        await db.collection('InspectionRecords').doc(rec._id).update({
          data: { status: '缺勤', finishTime: new Date() }
        });
      }
    } else if (pushTime === time1) {
      // 终结当天 time0 未完成的推送
      const res = await db.collection('InspectionRecords').where({
        line,
        assetId,
        pushTime: time0,
        status: '待点检',
        date: todayStr
      }).get();
      for (const rec of res.data) {
        await db.collection('InspectionRecords').doc(rec._id).update({
          data: { status: '缺勤', finishTime: new Date() }
        });
      }
    }
  }
} 