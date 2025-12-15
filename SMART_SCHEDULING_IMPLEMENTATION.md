# 智能排期系统实现指南

## 功能概述
根据项目工期、工人资源自动优化施工排期，避免冲突，提高资源利用率。

## 实现步骤

### 1. 数据库设计

```sql
-- 工人资源表
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 水电工、木工、油漆工等
  skills TEXT[], -- 技能标签
  availability JSONB, -- { "weekdays": true, "weekends": false, "hours": "8:00-18:00" }
  max_concurrent_projects INTEGER DEFAULT 1, -- 最多同时参与项目数
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 项目排期表
CREATE TABLE IF NOT EXISTS project_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
  task_type VARCHAR(50) NOT NULL, -- 水电、木工、油漆等
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  estimated_days INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, delayed
  priority INTEGER DEFAULT 5, -- 1-10, 10最高
  dependencies UUID[], -- 依赖的其他任务ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_project_schedules_project ON project_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_project_schedules_worker ON project_schedules(worker_id);
CREATE INDEX IF NOT EXISTS idx_project_schedules_dates ON project_schedules(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_project_schedules_status ON project_schedules(status);
```

### 2. 排期算法

实现智能排期算法（`admin/src/lib/scheduling.ts`）：

```typescript
interface Task {
  id: string
  projectId: string
  taskType: string
  estimatedDays: number
  priority: number
  dependencies: string[]
  requiredSkills: string[]
}

interface Worker {
  id: string
  name: string
  role: string
  skills: string[]
  maxConcurrent: number
  currentTasks: Task[]
}

// 主排期函数
function scheduleTasks(tasks: Task[], workers: Worker[]): ScheduleResult {
  // 1. 按优先级和依赖关系排序任务
  const sortedTasks = topologicalSort(tasks)
  
  // 2. 为每个任务分配工人
  const schedule: Schedule[] = []
  
  for (const task of sortedTasks) {
    // 找到合适的工人
    const availableWorker = findAvailableWorker(
      task,
      workers,
      schedule,
      task.startDate
    )
    
    if (availableWorker) {
      schedule.push({
        taskId: task.id,
        workerId: availableWorker.id,
        startDate: calculateStartDate(task, schedule),
        endDate: calculateEndDate(task, schedule)
      })
    } else {
      // 无法分配，标记为冲突
      schedule.push({
        taskId: task.id,
        workerId: null,
        startDate: null,
        endDate: null,
        conflict: true
      })
    }
  }
  
  return { schedule, conflicts: detectConflicts(schedule) }
}

// 拓扑排序（处理依赖关系）
function topologicalSort(tasks: Task[]): Task[] {
  const sorted: Task[] = []
  const visited = new Set<string>()
  const visiting = new Set<string>()
  
  function visit(task: Task) {
    if (visiting.has(task.id)) {
      throw new Error("循环依赖检测到")
    }
    if (visited.has(task.id)) return
    
    visiting.add(task.id)
    
    // 先处理依赖
    task.dependencies.forEach(depId => {
      const depTask = tasks.find(t => t.id === depId)
      if (depTask) visit(depTask)
    })
    
    visiting.delete(task.id)
    visited.add(task.id)
    sorted.push(task)
  }
  
  tasks.forEach(task => {
    if (!visited.has(task.id)) {
      visit(task)
    }
  })
  
  return sorted
}

// 查找可用工人
function findAvailableWorker(
  task: Task,
  workers: Worker[],
  schedule: Schedule[],
  proposedStartDate: Date
): Worker | null {
  return workers.find(worker => {
    // 检查技能匹配
    const hasSkills = task.requiredSkills.every(skill =>
      worker.skills.includes(skill)
    )
    if (!hasSkills) return false
    
    // 检查并发限制
    const currentTasks = getWorkerTasks(worker.id, schedule, proposedStartDate)
    if (currentTasks.length >= worker.maxConcurrent) return false
    
    // 检查时间冲突
    const hasConflict = currentTasks.some(existingTask => {
      const taskEndDate = addDays(proposedStartDate, task.estimatedDays)
      return datesOverlap(
        proposedStartDate,
        taskEndDate,
        existingTask.startDate,
        existingTask.endDate
      )
    })
    
    return !hasConflict
  }) || null
}
```

### 3. 可视化日历

使用 FullCalendar 或 React Big Calendar 显示排期：

```typescript
// 日历事件数据格式
const calendarEvents = schedules.map(schedule => ({
  id: schedule.id,
  title: `${schedule.workerName} - ${schedule.taskType}`,
  start: schedule.startDate,
  end: schedule.endDate,
  color: getStatusColor(schedule.status),
  resourceId: schedule.workerId
}))
```

### 4. 冲突检测与解决

```typescript
function detectConflicts(schedules: Schedule[]): Conflict[] {
  const conflicts: Conflict[] = []
  
  // 检查工人时间冲突
  const workerSchedules = groupBy(schedules, 'workerId')
  
  Object.entries(workerSchedules).forEach(([workerId, workerTasks]) => {
    for (let i = 0; i < workerTasks.length; i++) {
      for (let j = i + 1; j < workerTasks.length; j++) {
        if (datesOverlap(workerTasks[i], workerTasks[j])) {
          conflicts.push({
            type: 'worker_conflict',
            workerId,
            task1Id: workerTasks[i].taskId,
            task2Id: workerTasks[j].taskId,
            suggestedSolution: '调整时间或分配其他工人'
          })
        }
      }
    }
  })
  
  // 检查依赖关系冲突
  schedules.forEach(schedule => {
    const task = tasks.find(t => t.id === schedule.taskId)
    if (task?.dependencies) {
      task.dependencies.forEach(depId => {
        const depSchedule = schedules.find(s => s.taskId === depId)
        if (depSchedule && depSchedule.endDate > schedule.startDate) {
          conflicts.push({
            type: 'dependency_conflict',
            taskId: schedule.taskId,
            dependencyId: depId,
            suggestedSolution: '调整任务开始时间'
          })
        }
      })
    }
  })
  
  return conflicts
}
```

### 5. 实现建议

1. **创建排期页面**：`/scheduling`
2. **添加工人管理**：CRUD 操作
3. **自动排期按钮**：一键生成最优排期
4. **手动调整**：拖拽日历事件调整时间
5. **冲突提示**：高亮显示冲突任务
6. **资源利用率统计**：显示工人工作负荷

### 6. 技术栈

- **日历组件**：FullCalendar 或 React Big Calendar
- **算法库**：自定义实现或使用 `@algorithm/scheduler`
- **可视化**：D3.js 或 Recharts 显示资源利用率

