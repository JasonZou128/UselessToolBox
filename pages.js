// 页面内容管理
const pageContents = {
    // 普通用户页面
    userRepair: `
        <div class="form-container">
            <div class="form-card">
                <div class="form-title">🔧 设备故障报修</div>
                <form id="repairForm">
                    <div class="form-group">
                        <label class="form-label">设备类型</label>
                        <select class="form-select" id="deviceType" required>
                            <option value="">请选择设备类型</option>
                            <option value="生产设备">生产设备</option>
                            <option value="检测设备">检测设备</option>
                            <option value="包装设备">包装设备</option>
                            <option value="辅助设备">辅助设备</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">设备编号</label>
                        <input type="text" class="form-input" id="deviceId" placeholder="请输入设备编号" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">故障类型</label>
                        <select class="form-select" id="faultType" required>
                            <option value="">请选择故障类型</option>
                            <option value="机械故障">机械故障</option>
                            <option value="电气故障">电气故障</option>
                            <option value="软件故障">软件故障</option>
                            <option value="其他故障">其他故障</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">紧急程度</label>
                        <select class="form-select" id="urgency" required>
                            <option value="">请选择紧急程度</option>
                            <option value="紧急">🔴 紧急（影响生产）</option>
                            <option value="重要">🟡 重要（需尽快处理）</option>
                            <option value="一般">🟢 一般（正常处理）</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">故障描述</label>
                        <textarea class="form-textarea" id="description" placeholder="请详细描述故障现象、发生时间等信息..." required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">报修人</label>
                        <input type="text" class="form-input" id="reporter" placeholder="请输入您的姓名" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">联系方式</label>
                        <input type="tel" class="form-input" id="contact" placeholder="请输入手机号码" required>
                    </div>
                    
                    <button type="submit" class="form-button">提交报修单</button>
                </form>
            </div>
        </div>
    `,
    
    userTrack: `
        <div class="list-container">
            <div class="list-item">
                <div class="list-header">
                    <div class="list-title">生产线A - 包装机故障</div>
                    <span class="status-badge status-processing">处理中</span>
                </div>
                <div class="list-content">
                    设备编号：PKG-001<br>
                    故障类型：机械故障<br>
                    维修员：张师傅
                </div>
                <div class="list-time">2024-01-15 09:30</div>
            </div>
            
            <div class="list-item">
                <div class="list-header">
                    <div class="list-title">生产线B - 检测设备异常</div>
                    <span class="status-badge status-pending">待处理</span>
                </div>
                <div class="list-content">
                    设备编号：DET-002<br>
                    故障类型：电气故障<br>
                    紧急程度：重要
                </div>
                <div class="list-time">2024-01-15 08:45</div>
            </div>
            
            <div class="list-item">
                <div class="list-header">
                    <div class="list-title">生产线C - 传送带维修</div>
                    <span class="status-badge status-completed">已完成</span>
                </div>
                <div class="list-content">
                    设备编号：CVY-003<br>
                    故障类型：机械故障<br>
                    维修员：李师傅
                </div>
                <div class="list-time">2024-01-14 16:20</div>
            </div>
        </div>
    `,
    
    userInspection: `
        <div class="form-container">
            <div class="form-card">
                <div class="form-title">✅ 设备点检记录</div>
                <form id="inspectionForm">
                    <div class="form-group">
                        <label class="form-label">设备编号</label>
                        <input type="text" class="form-input" id="inspectionDeviceId" placeholder="扫描二维码或手动输入" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">点检项目</label>
                        <select class="form-select" id="inspectionItem" required>
                            <option value="">请选择点检项目</option>
                            <option value="日常点检">日常点检</option>
                            <option value="周度点检">周度点检</option>
                            <option value="月度点检">月度点检</option>
                            <option value="专项点检">专项点检</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">设备状态</label>
                        <select class="form-select" id="deviceStatus" required>
                            <option value="">请选择设备状态</option>
                            <option value="正常">✅ 正常</option>
                            <option value="异常">⚠️ 异常</option>
                            <option value="停机">🔴 停机</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">点检备注</label>
                        <textarea class="form-textarea" id="inspectionNotes" placeholder="记录点检过程中发现的问题或注意事项..."></textarea>
                    </div>
                    
                    <button type="submit" class="form-button">提交点检记录</button>
                </form>
            </div>
        </div>
    `,
    
    userProfile: `
        <div class="form-container">
            <div class="form-card">
                <div class="form-title">👤 个人中心</div>
                
                <div class="stats-section" style="margin-bottom: 20px;">
                    <div class="stats-title">📈 我的统计</div>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-number">23</span>
                            <span class="stat-label">报修单</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">156</span>
                            <span class="stat-label">点检记录</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">89</span>
                            <span class="stat-label">完成率%</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">姓名</label>
                    <input type="text" class="form-input" value="张三" readonly>
                </div>
                
                <div class="form-group">
                    <label class="form-label">工号</label>
                    <input type="text" class="form-input" value="EMP001" readonly>
                </div>
                
                <div class="form-group">
                    <label class="form-label">部门</label>
                    <input type="text" class="form-input" value="生产部" readonly>
                </div>
                
                <div class="form-group">
                    <label class="form-label">联系方式</label>
                    <input type="tel" class="form-input" value="138****8888" readonly>
                </div>
            </div>
        </div>
    `,
    
    // 维修人员页面
    maintainerWork: `
        <div class="list-container">
            <div class="stats-section">
                <div class="stats-title">🛠️ 今日工作概况</div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number">5</span>
                        <span class="stat-label">待处理</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">3</span>
                        <span class="stat-label">进行中</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">12</span>
                        <span class="stat-label">已完成</span>
                    </div>
                </div>
            </div>
            
            <div class="list-item">
                <div class="list-header">
                    <div class="list-title">🔴 紧急：生产线A包装机故障</div>
                    <button class="action-btn urgent">立即处理</button>
                </div>
                <div class="list-content">
                    设备编号：PKG-001<br>
                    故障类型：机械故障<br>
                    报修人：李操作员<br>
                    影响：生产线停机
                </div>
                <div class="list-time">2024-01-15 09:30</div>
            </div>
            
            <div class="list-item">
                <div class="list-header">
                    <div class="list-title">🟡 重要：检测设备校准</div>
                    <button class="action-btn normal">开始处理</button>
                </div>
                <div class="list-content">
                    设备编号：DET-002<br>
                    故障类型：精度偏差<br>
                    报修人：王质检员<br>
                    预计工时：2小时
                </div>
                <div class="list-time">2024-01-15 08:45</div>
            </div>
        </div>
    `,
    
    maintainerTasks: `
        <div class="list-container">
            <div class="filter-tabs">
                <button class="filter-tab active" onclick="filterTasks('all')">全部</button>
                <button class="filter-tab" onclick="filterTasks('pending')">待处理</button>
                <button class="filter-tab" onclick="filterTasks('processing')">进行中</button>
                <button class="filter-tab" onclick="filterTasks('completed')">已完成</button>
            </div>
            
            <div class="task-list">
                <div class="list-item task-item" data-status="processing">
                    <div class="list-header">
                        <div class="list-title">生产线A - 包装机维修</div>
                        <span class="status-badge status-processing">进行中</span>
                    </div>
                    <div class="list-content">
                        设备编号：PKG-001<br>
                        故障类型：机械故障<br>
                        开始时间：2024-01-15 10:00<br>
                        预计完成：2024-01-15 14:00
                    </div>
                    <div class="task-actions">
                        <button class="action-btn" onclick="updateTaskStatus('processing')">更新状态</button>
                        <button class="action-btn" onclick="completeTask()">完成任务</button>
                    </div>
                </div>
                
                <div class="list-item task-item" data-status="pending">
                    <div class="list-header">
                        <div class="list-title">生产线B - 电气检修</div>
                        <span class="status-badge status-pending">待处理</span>
                    </div>
                    <div class="list-content">
                        设备编号：ELE-003<br>
                        故障类型：电气故障<br>
                        报修时间：2024-01-15 11:30<br>
                        紧急程度：重要
                    </div>
                    <div class="task-actions">
                        <button class="action-btn" onclick="acceptTask()">接受任务</button>
                        <button class="action-btn" onclick="transferTask()">转办任务</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    maintainerMaintenance: `
        <div class="form-container">
            <div class="stats-section">
                <div class="stats-title">⚙️ 保养计划概况</div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number">8</span>
                        <span class="stat-label">本周计划</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">3</span>
                        <span class="stat-label">今日任务</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">95%</span>
                        <span class="stat-label">完成率</span>
                    </div>
                </div>
            </div>
            
            <div class="form-card">
                <div class="form-title">📝 保养记录</div>
                <form id="maintenanceForm">
                    <div class="form-group">
                        <label class="form-label">设备编号</label>
                        <input type="text" class="form-input" id="maintenanceDeviceId" placeholder="扫描设备二维码" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">保养类型</label>
                        <select class="form-select" id="maintenanceType" required>
                            <option value="">请选择保养类型</option>
                            <option value="日常保养">日常保养</option>
                            <option value="周期保养">周期保养</option>
                            <option value="年度保养">年度保养</option>
                            <option value="特殊保养">特殊保养</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">保养项目</label>
                        <textarea class="form-textarea" id="maintenanceItems" placeholder="详细记录保养项目和内容..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">更换配件</label>
                        <textarea class="form-textarea" id="replacedParts" placeholder="记录更换的配件信息..."></textarea>
                    </div>
                    
                    <button type="submit" class="form-button">提交保养记录</button>
                </form>
            </div>
        </div>
    `,
    
    maintainerStats: `
        <div class="form-container">
            <div class="stats-section">
                <div class="stats-title">📊 个人工作统计</div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number">156</span>
                        <span class="stat-label">本月维修</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">42</span>
                        <span class="stat-label">本月保养</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">98%</span>
                        <span class="stat-label">及时率</span>
                    </div>
                </div>
            </div>
            
            <div class="stats-section">
                <div class="stats-title">🏆 技能等级</div>
                <div class="skill-list">
                    <div class="skill-item">
                        <span class="skill-name">机械维修</span>
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: 85%"></div>
                        </div>
                        <span class="skill-level">高级</span>
                    </div>
                    <div class="skill-item">
                        <span class="skill-name">电气维修</span>
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: 70%"></div>
                        </div>
                        <span class="skill-level">中级</span>
                    </div>
                    <div class="skill-item">
                        <span class="skill-name">软件调试</span>
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: 60%"></div>
                        </div>
                        <span class="skill-level">初级</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    // 管理员页面
    adminSystem: `
        <div class="form-container">
            <div class="quick-actions">
                <div class="action-card" onclick="manageUsers()">
                    <span class="action-icon">👥</span>
                    <span class="action-title">用户管理</span>
                </div>
                <div class="action-card" onclick="manageEquipment()">
                    <span class="action-icon">⚙️</span>
                    <span class="action-title">设备管理</span>
                </div>
                <div class="action-card" onclick="systemSettings()">
                    <span class="action-icon">🔧</span>
                    <span class="action-title">系统设置</span>
                </div>
                <div class="action-card" onclick="viewLogs()">
                    <span class="action-icon">📋</span>
                    <span class="action-title">操作日志</span>
                </div>
            </div>
            
            <div class="stats-section">
                <div class="stats-title">🖥️ 系统状态</div>
                <div class="system-status">
                    <div class="status-item">
                        <span class="status-label">数据库连接</span>
                        <span class="status-value online">正常</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">服务器状态</span>
                        <span class="status-value online">运行中</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">存储空间</span>
                        <span class="status-value warning">78%</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">系统版本</span>
                        <span class="status-value">v3.0.1</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    adminData: `
        <div class="form-container">
            <div class="stats-section">
                <div class="stats-title">📊 数据概览</div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number">1,234</span>
                        <span class="stat-label">总维修单</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">89%</span>
                        <span class="stat-label">及时处理率</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">2.5h</span>
                        <span class="stat-label">平均响应时间</span>
                    </div>
                </div>
            </div>
            
            <div class="form-card">
                <div class="form-title">📈 数据导出</div>
                <div class="export-options">
                    <div class="form-group">
                        <label class="form-label">导出类型</label>
                        <select class="form-select" id="exportType">
                            <option value="repair">维修记录</option>
                            <option value="maintenance">保养记录</option>
                            <option value="inspection">点检记录</option>
                            <option value="all">全部数据</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">时间范围</label>
                        <select class="form-select" id="timeRange">
                            <option value="week">本周</option>
                            <option value="month">本月</option>
                            <option value="quarter">本季度</option>
                            <option value="year">本年</option>
                        </select>
                    </div>
                    
                    <button class="form-button" onclick="exportData()">导出数据</button>
                </div>
            </div>
        </div>
    `,
    
    adminUsers: `
        <div class="list-container">
            <div class="search-bar">
                <input type="text" class="search-input" placeholder="搜索用户..." onkeyup="searchUsers(this.value)">
            </div>
            
            <div class="user-list">
                <div class="list-item user-item">
                    <div class="user-info">
                        <div class="user-name">张三</div>
                        <div class="user-details">工号：EMP001 | 部门：生产部</div>
                        <div class="user-role">当前角色：普通用户</div>
                    </div>
                    <div class="user-actions">
                        <button class="action-btn" onclick="editUser('EMP001')">编辑</button>
                        <button class="action-btn" onclick="changeRole('EMP001')">变更角色</button>
                    </div>
                </div>
                
                <div class="list-item user-item">
                    <div class="user-info">
                        <div class="user-name">李师傅</div>
                        <div class="user-details">工号：EMP002 | 部门：维修部</div>
                        <div class="user-role">当前角色：维修人员</div>
                    </div>
                    <div class="user-actions">
                        <button class="action-btn" onclick="editUser('EMP002')">编辑</button>
                        <button class="action-btn" onclick="changeRole('EMP002')">变更角色</button>
                    </div>
                </div>
                
                <div class="list-item user-item">
                    <div class="user-info">
                        <div class="user-name">王管理</div>
                        <div class="user-details">工号：EMP003 | 部门：管理部</div>
                        <div class="user-role">当前角色：管理员</div>
                    </div>
                    <div class="user-actions">
                        <button class="action-btn" onclick="editUser('EMP003')">编辑</button>
                        <button class="action-btn disabled">变更角色</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    adminAudit: `
        <div class="list-container">
            <div class="filter-tabs">
                <button class="filter-tab active" onclick="filterAudits('pending')">待审核</button>
                <button class="filter-tab" onclick="filterAudits('approved')">已通过</button>
                <button class="filter-tab" onclick="filterAudits('rejected')">已拒绝</button>
            </div>
            
            <div class="audit-list">
                <div class="list-item audit-item" data-status="pending">
                    <div class="list-header">
                        <div class="list-title">权限申请 - 张三</div>
                        <span class="status-badge status-pending">待审核</span>
                    </div>
                    <div class="list-content">
                        申请角色：维修人员<br>
                        申请原因：负责生产线设备维护工作<br>
                        申请时间：2024-01-15 14:30
                    </div>
                    <div class="audit-actions">
                        <button class="action-btn approve" onclick="approveApplication('APP001')">通过</button>
                        <button class="action-btn reject" onclick="rejectApplication('APP001')">拒绝</button>
                        <button class="action-btn" onclick="viewDetails('APP001')">查看详情</button>
                    </div>
                </div>
                
                <div class="list-item audit-item" data-status="pending">
                    <div class="list-header">
                        <div class="list-title">权限申请 - 李四</div>
                        <span class="status-badge status-pending">待审核</span>
                    </div>
                    <div class="list-content">
                        申请角色：管理员<br>
                        申请原因：负责设备管理系统运维<br>
                        申请时间：2024-01-15 13:15
                    </div>
                    <div class="audit-actions">
                        <button class="action-btn approve" onclick="approveApplication('APP002')">通过</button>
                        <button class="action-btn reject" onclick="rejectApplication('APP002')">拒绝</button>
                        <button class="action-btn" onclick="viewDetails('APP002')">查看详情</button>
                    </div>
                </div>
            </div>
        </div>
    `
};

// 动态加载页面内容
function loadPageContent(pageId, content) {
    const page = document.getElementById(pageId + 'Page');
    if (page) {
        page.innerHTML = content;
        
        // 绑定表单事件
        bindFormEvents(pageId);
    }
}

// 绑定表单事件
function bindFormEvents(pageId) {
    // 报修表单
    if (pageId === 'userRepair') {
        const form = document.getElementById('repairForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                submitRepairForm();
            });
        }
    }
    
    // 点检表单
    if (pageId === 'userInspection') {
        const form = document.getElementById('inspectionForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                submitInspectionForm();
            });
        }
    }
    
    // 保养表单
    if (pageId === 'maintainerMaintenance') {
        const form = document.getElementById('maintenanceForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                submitMaintenanceForm();
            });
        }
    }
}

// 表单提交函数
function submitRepairForm() {
    const formData = {
        deviceType: document.getElementById('deviceType').value,
        deviceId: document.getElementById('deviceId').value,
        faultType: document.getElementById('faultType').value,
        urgency: document.getElementById('urgency').value,
        description: document.getElementById('description').value,
        reporter: document.getElementById('reporter').value,
        contact: document.getElementById('contact').value,
        submitTime: new Date().toLocaleString()
    };
    
    alert('✅ 报修单提交成功！\n\n' +
          '报修单号：RX' + Date.now() + '\n' +
          '设备类型：' + formData.deviceType + '\n' +
          '设备编号：' + formData.deviceId + '\n' +
          '我们会尽快安排维修人员处理！');
    
    document.getElementById('repairForm').reset();
    switchTab('userTrack');
}

function submitInspectionForm() {
    const formData = {
        deviceId: document.getElementById('inspectionDeviceId').value,
        inspectionItem: document.getElementById('inspectionItem').value,
        deviceStatus: document.getElementById('deviceStatus').value,
        inspectionNotes: document.getElementById('inspectionNotes').value,
        submitTime: new Date().toLocaleString()
    };
    
    alert('✅ 点检记录提交成功！\n\n' +
          '设备编号：' + formData.deviceId + '\n' +
          '点检项目：' + formData.inspectionItem + '\n' +
          '设备状态：' + formData.deviceStatus);
    
    document.getElementById('inspectionForm').reset();
}

function submitMaintenanceForm() {
    const formData = {
        deviceId: document.getElementById('maintenanceDeviceId').value,
        maintenanceType: document.getElementById('maintenanceType').value,
        maintenanceItems: document.getElementById('maintenanceItems').value,
        replacedParts: document.getElementById('replacedParts').value,
        submitTime: new Date().toLocaleString()
    };
    
    alert('✅ 保养记录提交成功！\n\n' +
          '设备编号：' + formData.deviceId + '\n' +
          '保养类型：' + formData.maintenanceType);
    
    document.getElementById('maintenanceForm').reset();
}

// 管理员功能
function manageUsers() {
    alert('跳转到用户管理页面');
}

function manageEquipment() {
    alert('跳转到设备管理页面');
}

function systemSettings() {
    alert('跳转到系统设置页面');
}

function viewLogs() {
    alert('跳转到操作日志页面');
}

function exportData() {
    const exportType = document.getElementById('exportType').value;
    const timeRange = document.getElementById('timeRange').value;
    alert(`正在导出${exportType}数据，时间范围：${timeRange}`);
}

function searchUsers(keyword) {
    console.log('搜索用户：', keyword);
}

function editUser(userId) {
    alert(`编辑用户：${userId}`);
}

function changeRole(userId) {
    alert(`变更用户角色：${userId}`);
}

function approveApplication(appId) {
    if (confirm('确认通过此权限申请？')) {
        alert(`申请 ${appId} 已通过`);
    }
}

function rejectApplication(appId) {
    const reason = prompt('请输入拒绝原因：');
    if (reason) {
        alert(`申请 ${appId} 已拒绝，原因：${reason}`);
    }
}

function viewDetails(appId) {
    alert(`查看申请详情：${appId}`);
}

// 维修人员功能
function filterTasks(status) {
    console.log('筛选任务：', status);
    // 实现任务筛选逻辑
}

function updateTaskStatus(status) {
    alert('更新任务状态：' + status);
}

function completeTask() {
    if (confirm('确认完成此任务？')) {
        alert('任务已完成');
    }
}

function acceptTask() {
    if (confirm('确认接受此任务？')) {
        alert('任务已接受');
    }
}

function transferTask() {
    const target = prompt('请输入转办目标（维修员姓名）：');
    if (target) {
        alert(`任务已转办给：${target}`);
    }
}

function filterAudits(status) {
    console.log('筛选审核：', status);
    // 实现审核筛选逻辑
}

// 导出页面内容管理器
window.pageContents = pageContents;
window.loadPageContent = loadPageContent; 