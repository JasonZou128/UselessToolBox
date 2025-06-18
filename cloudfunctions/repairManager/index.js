// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, data } = event

  switch (action) {
    case 'submitRepair':
      return await submitRepair(data, wxContext.OPENID)
    case 'getRepairList':
      return await getRepairList(data, wxContext.OPENID)
    case 'updateRepairStatus':
      return await updateRepairStatus(data, wxContext.OPENID)
    case 'assignRepair':
      return await assignRepair(data, wxContext.OPENID)
    case 'transferTask':
      return await transferTask(data, wxContext.OPENID)
    case 'completeRepair':
      return await completeRepair(data, wxContext.OPENID)
    default:
      return { success: false, message: '未知操作' }
  }
}

// 提交报修单
async function submitRepair(data, openid) {
  try {
    // 生成报修单号
    const repairNo = 'RX' + Date.now()
    
    const result = await db.collection('repair_records').add({
      data: {
        repairNo,
        deviceType: data.deviceType,
        deviceId: data.deviceId,
        faultType: data.faultType,
        urgency: data.urgency,
        description: data.description,
        reporter: data.reporter,
        contact: data.contact,
        reporterOpenid: openid,
        status: 'pending', // 待处理
        createTime: new Date(),
        updateTime: new Date()
      }
    })

    // 根据设备类型和故障类型自动分配维修人员
    await autoAssignMaintainer(result._id, data.deviceType, data.faultType, data.urgency)

    return {
      success: true,
      message: '报修单提交成功',
      repairNo,
      recordId: result._id
    }
  } catch (error) {
    console.error('提交报修单失败', error)
    return {
      success: false,
      message: '提交报修单失败：' + error.message
    }
  }
}

// 获取报修记录列表
async function getRepairList(data, openid) {
  try {
    let query = {}
    
    // 根据用户角色和权限筛选数据
    const userInfo = await getUserInfo(openid)
    
    if (userInfo.role === 'user') {
      // 普通用户只能看自己的报修记录
      query.reporterOpenid = openid
    } else if (userInfo.role === 'maintainer') {
      // 维修人员看分配给自己的任务
      query.assignedTo = openid
    }
    // 管理员可以看所有记录，不添加筛选条件

    // 添加状态筛选
    if (data.status) {
      query.status = data.status
    }

    const result = await db.collection('repair_records')
      .where(query)
      .orderBy('createTime', 'desc')
      .limit(data.limit || 20)
      .skip(data.skip || 0)
      .get()

    return {
      success: true,
      data: result.data,
      total: result.data.length
    }
  } catch (error) {
    console.error('获取报修记录失败', error)
    return {
      success: false,
      message: '获取报修记录失败：' + error.message
    }
  }
}

// 更新维修状态
async function updateRepairStatus(data, openid) {
  try {
    // 检查权限
    const userInfo = await getUserInfo(openid)
    if (!['maintainer', 'admin'].includes(userInfo.role)) {
      return { success: false, message: '权限不足' }
    }

    const result = await db.collection('repair_records').doc(data.recordId).update({
      data: {
        status: data.status,
        maintainerNotes: data.notes || '',
        updateTime: new Date(),
        ...(data.status === 'processing' && { startTime: new Date() }),
        ...(data.status === 'completed' && { completeTime: new Date() })
      }
    })

    return {
      success: true,
      message: '状态更新成功'
    }
  } catch (error) {
    console.error('更新状态失败', error)
    return {
      success: false,
      message: '更新状态失败：' + error.message
    }
  }
}

// 分配维修人员
async function assignRepair(data, openid) {
  try {
    // 检查权限
    const userInfo = await getUserInfo(openid)
    if (userInfo.role !== 'admin') {
      return { success: false, message: '权限不足' }
    }

    const result = await db.collection('repair_records').doc(data.recordId).update({
      data: {
        assignedTo: data.maintainerOpenid,
        assignedBy: openid,
        assignTime: new Date(),
        updateTime: new Date()
      }
    })

    return {
      success: true,
      message: '分配成功'
    }
  } catch (error) {
    console.error('分配维修人员失败', error)
    return {
      success: false,
      message: '分配失败：' + error.message
    }
  }
}

// 任务转办
async function transferTask(data, openid) {
  try {
    // 检查权限
    const userInfo = await getUserInfo(openid)
    if (!['maintainer', 'admin'].includes(userInfo.role)) {
      return { success: false, message: '权限不足' }
    }

    // 记录转办历史
    await db.collection('task_transfers').add({
      data: {
        taskId: data.recordId,
        fromUser: openid,
        toUser: data.targetMaintainer,
        reason: data.reason,
        transferTime: new Date()
      }
    })

    // 更新任务分配
    const result = await db.collection('repair_records').doc(data.recordId).update({
      data: {
        assignedTo: data.targetMaintainer,
        transferredBy: openid,
        transferTime: new Date(),
        updateTime: new Date()
      }
    })

    return {
      success: true,
      message: '任务转办成功'
    }
  } catch (error) {
    console.error('任务转办失败', error)
    return {
      success: false,
      message: '转办失败：' + error.message
    }
  }
}

// 完成维修
async function completeRepair(data, openid) {
  try {
    // 检查权限
    const userInfo = await getUserInfo(openid)
    if (!['maintainer', 'admin'].includes(userInfo.role)) {
      return { success: false, message: '权限不足' }
    }

    const result = await db.collection('repair_records').doc(data.recordId).update({
      data: {
        status: 'completed',
        completeTime: new Date(),
        updateTime: new Date(),
        solution: data.solution,
        usedParts: data.usedParts,
        workHours: data.workHours,
        completedBy: openid
      }
    })

    return {
      success: true,
      message: '维修完成'
    }
  } catch (error) {
    console.error('完成维修失败', error)
    return {
      success: false,
      message: '完成维修失败：' + error.message
    }
  }
}

// 自动分配维修人员
async function autoAssignMaintainer(recordId, deviceType, faultType, urgency) {
  try {
    // 查找合适的维修人员
    const maintainers = await db.collection('users').where({
      role: 'maintainer',
      status: 'active'
    }).get()

    if (maintainers.data.length > 0) {
      // 简单分配策略：选择第一个可用的维修人员
      // 实际应用中可以根据技能、工作负载等因素智能分配
      const assignedMaintainer = maintainers.data[0]
      
      await db.collection('repair_records').doc(recordId).update({
        data: {
          assignedTo: assignedMaintainer.openid,
          assignTime: new Date(),
          status: urgency === '紧急' ? 'urgent' : 'assigned'
        }
      })
    }
  } catch (error) {
    console.error('自动分配维修人员失败', error)
  }
}

// 获取用户信息
async function getUserInfo(openid) {
  try {
    const result = await db.collection('users').where({
      openid: openid
    }).get()
    
    return result.data.length > 0 ? result.data[0] : { role: 'user' }
  } catch (error) {
    console.error('获取用户信息失败', error)
    return { role: 'user' }
  }
} 