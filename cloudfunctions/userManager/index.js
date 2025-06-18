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
    case 'submitPermissionApplication':
      return await submitPermissionApplication(data, wxContext.OPENID)
    case 'getPermissionApplications':
      return await getPermissionApplications(data, wxContext.OPENID)
    case 'approveApplication':
      return await approveApplication(data, wxContext.OPENID)
    case 'rejectApplication':
      return await rejectApplication(data, wxContext.OPENID)
    case 'getUserList':
      return await getUserList(data, wxContext.OPENID)
    case 'updateUserRole':
      return await updateUserRole(data, wxContext.OPENID)
    case 'getUserStats':
      return await getUserStats(data, wxContext.OPENID)
    default:
      return { success: false, message: '未知操作' }
  }
}

// 提交权限申请
async function submitPermissionApplication(data, openid) {
  try {
    // 检查是否已有待审核的申请
    const existingApp = await db.collection('permission_applications').where({
      applicantOpenid: openid,
      status: 'pending'
    }).get()

    if (existingApp.data.length > 0) {
      return {
        success: false,
        message: '您已有待审核的申请，请等待审核结果'
      }
    }

    const result = await db.collection('permission_applications').add({
      data: {
        applicantOpenid: openid,
        targetRole: data.targetRole,
        reason: data.reason,
        status: 'pending',
        createTime: new Date(),
        updateTime: new Date()
      }
    })

    return {
      success: true,
      message: '权限申请提交成功，请等待管理员审核',
      applicationId: result._id
    }
  } catch (error) {
    console.error('提交权限申请失败', error)
    return {
      success: false,
      message: '提交申请失败：' + error.message
    }
  }
}

// 获取权限申请列表
async function getPermissionApplications(data, openid) {
  try {
    // 检查权限
    const userInfo = await getUserInfo(openid)
    if (userInfo.role !== 'admin') {
      return { success: false, message: '权限不足' }
    }

    let query = {}
    if (data.status) {
      query.status = data.status
    }

    const result = await db.collection('permission_applications')
      .where(query)
      .orderBy('createTime', 'desc')
      .limit(data.limit || 20)
      .skip(data.skip || 0)
      .get()

    // 获取申请人信息
    const applications = await Promise.all(result.data.map(async (app) => {
      const applicantInfo = await getUserInfo(app.applicantOpenid)
      return {
        ...app,
        applicantName: applicantInfo.name || '未知用户',
        applicantDepartment: applicantInfo.department || ''
      }
    }))

    return {
      success: true,
      data: applications,
      total: applications.length
    }
  } catch (error) {
    console.error('获取权限申请列表失败', error)
    return {
      success: false,
      message: '获取申请列表失败：' + error.message
    }
  }
}

// 批准权限申请
async function approveApplication(data, openid) {
  try {
    // 检查权限
    const userInfo = await getUserInfo(openid)
    if (userInfo.role !== 'admin') {
      return { success: false, message: '权限不足' }
    }

    // 获取申请信息
    const appResult = await db.collection('permission_applications').doc(data.applicationId).get()
    if (!appResult.data) {
      return { success: false, message: '申请不存在' }
    }

    const application = appResult.data

    // 更新申请状态
    await db.collection('permission_applications').doc(data.applicationId).update({
      data: {
        status: 'approved',
        approvedBy: openid,
        approveTime: new Date(),
        updateTime: new Date(),
        approveComment: data.comment || ''
      }
    })

    // 更新用户角色
    await db.collection('users').where({
      openid: application.applicantOpenid
    }).update({
      data: {
        role: application.targetRole,
        updateTime: new Date()
      }
    })

    // 记录角色变更历史
    await db.collection('role_changes').add({
      data: {
        userOpenid: application.applicantOpenid,
        oldRole: userInfo.role,
        newRole: application.targetRole,
        changedBy: openid,
        changeTime: new Date(),
        reason: '权限申请通过'
      }
    })

    return {
      success: true,
      message: '权限申请已通过'
    }
  } catch (error) {
    console.error('批准权限申请失败', error)
    return {
      success: false,
      message: '批准申请失败：' + error.message
    }
  }
}

// 拒绝权限申请
async function rejectApplication(data, openid) {
  try {
    // 检查权限
    const userInfo = await getUserInfo(openid)
    if (userInfo.role !== 'admin') {
      return { success: false, message: '权限不足' }
    }

    await db.collection('permission_applications').doc(data.applicationId).update({
      data: {
        status: 'rejected',
        rejectedBy: openid,
        rejectTime: new Date(),
        updateTime: new Date(),
        rejectReason: data.reason || ''
      }
    })

    return {
      success: true,
      message: '权限申请已拒绝'
    }
  } catch (error) {
    console.error('拒绝权限申请失败', error)
    return {
      success: false,
      message: '拒绝申请失败：' + error.message
    }
  }
}

// 获取用户列表
async function getUserList(data, openid) {
  try {
    // 检查权限
    const userInfo = await getUserInfo(openid)
    if (userInfo.role !== 'admin') {
      return { success: false, message: '权限不足' }
    }

    let query = {}
    if (data.role) {
      query.role = data.role
    }
    if (data.status) {
      query.status = data.status
    }

    const result = await db.collection('users')
      .where(query)
      .orderBy('createTime', 'desc')
      .limit(data.limit || 50)
      .skip(data.skip || 0)
      .get()

    return {
      success: true,
      data: result.data,
      total: result.data.length
    }
  } catch (error) {
    console.error('获取用户列表失败', error)
    return {
      success: false,
      message: '获取用户列表失败：' + error.message
    }
  }
}

// 更新用户角色
async function updateUserRole(data, openid) {
  try {
    // 检查权限
    const userInfo = await getUserInfo(openid)
    if (userInfo.role !== 'admin') {
      return { success: false, message: '权限不足' }
    }

    // 获取目标用户当前角色
    const targetUser = await getUserInfo(data.targetOpenid)
    
    // 更新用户角色
    await db.collection('users').where({
      openid: data.targetOpenid
    }).update({
      data: {
        role: data.newRole,
        updateTime: new Date()
      }
    })

    // 记录角色变更历史
    await db.collection('role_changes').add({
      data: {
        userOpenid: data.targetOpenid,
        oldRole: targetUser.role,
        newRole: data.newRole,
        changedBy: openid,
        changeTime: new Date(),
        reason: data.reason || '管理员手动变更'
      }
    })

    return {
      success: true,
      message: '用户角色更新成功'
    }
  } catch (error) {
    console.error('更新用户角色失败', error)
    return {
      success: false,
      message: '更新角色失败：' + error.message
    }
  }
}

// 获取用户统计信息
async function getUserStats(data, openid) {
  try {
    const userInfo = await getUserInfo(openid)
    
    let stats = {}
    
    if (userInfo.role === 'user') {
      // 普通用户统计
      const repairCount = await db.collection('repair_records').where({
        reporterOpenid: openid
      }).count()
      
      const inspectionCount = await db.collection('inspection_records').where({
        inspectorOpenid: openid
      }).count()

      stats = {
        repairCount: repairCount.total,
        inspectionCount: inspectionCount.total
      }
    } else if (userInfo.role === 'maintainer') {
      // 维修人员统计
      const assignedTasks = await db.collection('repair_records').where({
        assignedTo: openid
      }).count()
      
      const completedTasks = await db.collection('repair_records').where({
        assignedTo: openid,
        status: 'completed'
      }).count()

      const maintenanceCount = await db.collection('maintenance_records').where({
        maintainerOpenid: openid
      }).count()

      stats = {
        assignedTasks: assignedTasks.total,
        completedTasks: completedTasks.total,
        maintenanceCount: maintenanceCount.total,
        completionRate: assignedTasks.total > 0 ? Math.round((completedTasks.total / assignedTasks.total) * 100) : 0
      }
    } else if (userInfo.role === 'admin') {
      // 管理员统计
      const totalUsers = await db.collection('users').count()
      const totalRepairs = await db.collection('repair_records').count()
      const pendingApplications = await db.collection('permission_applications').where({
        status: 'pending'
      }).count()

      stats = {
        totalUsers: totalUsers.total,
        totalRepairs: totalRepairs.total,
        pendingApplications: pendingApplications.total
      }
    }

    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error('获取用户统计失败', error)
    return {
      success: false,
      message: '获取统计信息失败：' + error.message
    }
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