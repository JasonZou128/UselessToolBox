# 微信云开发数据库初始化

## 需要创建的数据库集合

### 1. 用户表 (users)
```json
{
  "_id": "用户记录ID",
  "openid": "微信用户OpenID",
  "unionid": "微信UnionID（可选）",
  "name": "用户姓名",
  "role": "用户角色（user/maintainer/admin）",
  "department": "部门",
  "phone": "联系电话",
  "employeeCode": "工号",
  "status": "账号状态（active/inactive）",
  "createTime": "创建时间",
  "updateTime": "更新时间"
}
```

### 2. 维修记录表 (repair_records)
```json
{
  "_id": "维修记录ID",
  "repairNo": "报修单号",
  "deviceType": "设备类型",
  "deviceId": "设备编号",
  "faultType": "故障类型",
  "urgency": "紧急程度",
  "description": "故障描述",
  "reporter": "报修人姓名",
  "contact": "联系方式",
  "reporterOpenid": "报修人OpenID",
  "assignedTo": "分配给维修员OpenID",
  "assignedBy": "分配人OpenID",
  "assignTime": "分配时间",
  "status": "状态（pending/assigned/processing/completed）",
  "startTime": "开始维修时间",
  "completeTime": "完成时间",
  "solution": "解决方案",
  "usedParts": "使用配件",
  "workHours": "工时",
  "completedBy": "完成人OpenID",
  "maintainerNotes": "维修备注",
  "createTime": "创建时间",
  "updateTime": "更新时间"
}
```

### 3. 权限申请表 (permission_applications)
```json
{
  "_id": "申请记录ID",
  "applicantOpenid": "申请人OpenID",
  "targetRole": "申请角色",
  "reason": "申请原因",
  "status": "状态（pending/approved/rejected）",
  "approvedBy": "审批人OpenID",
  "approveTime": "审批时间",
  "approveComment": "审批意见",
  "rejectedBy": "拒绝人OpenID",
  "rejectTime": "拒绝时间",
  "rejectReason": "拒绝原因",
  "createTime": "创建时间",
  "updateTime": "更新时间"
}
```

### 4. 设备点检记录表 (inspection_records)
```json
{
  "_id": "点检记录ID",
  "deviceId": "设备编号",
  "inspectionType": "点检类型",
  "inspectorOpenid": "点检人OpenID",
  "inspectorName": "点检人姓名",
  "deviceStatus": "设备状态",
  "inspectionItems": "点检项目",
  "abnormalItems": "异常项",
  "notes": "备注",
  "photos": "现场照片",
  "createTime": "创建时间"
}
```

### 5. 保养记录表 (maintenance_records)
```json
{
  "_id": "保养记录ID",
  "deviceId": "设备编号",
  "maintenanceType": "保养类型",
  "maintainerOpenid": "保养人OpenID",
  "maintainerName": "保养人姓名",
  "maintenanceItems": "保养项目",
  "replacedParts": "更换配件",
  "notes": "备注",
  "photos": "现场照片",
  "createTime": "创建时间"
}
```

### 6. 任务转办记录表 (task_transfers)
```json
{
  "_id": "转办记录ID",
  "taskId": "任务ID",
  "fromUser": "转办人OpenID",
  "toUser": "接收人OpenID",
  "reason": "转办原因",
  "transferTime": "转办时间"
}
```

### 7. 角色变更记录表 (role_changes)
```json
{
  "_id": "变更记录ID",
  "userOpenid": "用户OpenID",
  "oldRole": "原角色",
  "newRole": "新角色",
  "changedBy": "变更人OpenID",
  "changeTime": "变更时间",
  "reason": "变更原因"
}
```

## 数据库权限设置

### 用户表 (users)
- 所有用户：读取自己的记录
- 管理员：读取、写入所有记录

### 维修记录表 (repair_records)
- 普通用户：读取自己提交的记录，创建新记录
- 维修人员：读取分配给自己的记录，更新状态
- 管理员：读取、写入所有记录

### 权限申请表 (permission_applications)
- 普通用户：创建申请，读取自己的申请
- 管理员：读取、写入所有记录

### 其他表
- 按照角色权限进行相应的读写控制

## 初始化步骤

1. 在微信云开发控制台创建以上数据库集合
2. 设置相应的数据库权限规则
3. 创建初始管理员账号
4. 部署云函数
5. 配置小程序AppID和云环境ID

## 示例数据

可以插入一些示例数据用于测试：

### 示例用户数据
```json
{
  "openid": "test_admin_openid",
  "name": "系统管理员",
  "role": "admin",
  "department": "IT部",
  "phone": "13800138000",
  "employeeCode": "ADMIN001",
  "status": "active",
  "createTime": "2024-01-01T00:00:00.000Z",
  "updateTime": "2024-01-01T00:00:00.000Z"
}
```

### 示例维修记录
```json
{
  "repairNo": "RX20240101001",
  "deviceType": "生产设备",
  "deviceId": "PKG-001",
  "faultType": "机械故障",
  "urgency": "重要",
  "description": "包装机传送带异响，需要检查",
  "reporter": "张三",
  "contact": "13900139000",
  "reporterOpenid": "test_user_openid",
  "status": "pending",
  "createTime": "2024-01-15T09:30:00.000Z",
  "updateTime": "2024-01-15T09:30:00.000Z"
}
``` 