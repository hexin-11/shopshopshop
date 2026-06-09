import { randomUUID } from "crypto";

// 内存中简单的任务状态管理
const tasks = new Map();

/**
 * 创建一个新任务
 * @param {string} type 任务类型，如 'generate-video', 'generate-clip'
 * @param {object} payload 任务有效载荷
 * @returns {string} taskId
 */
export function createTask(type, payload) {
  const taskId = randomUUID();
  tasks.set(taskId, {
    taskId,
    type,
    status: "pending", // pending, processing, completed, failed
    progress: 0,
    message: "任务已创建",
    result: null,
    error: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return taskId;
}

/**
 * 更新任务状态
 * @param {string} taskId 
 * @param {object} updates 包含 status, progress, message, result, error 等字段
 */
export function updateTask(taskId, updates) {
  const task = tasks.get(taskId);
  if (task) {
    Object.assign(task, updates, { updatedAt: Date.now() });
    tasks.set(taskId, task);
  }
}

/**
 * 获取任务状态
 * @param {string} taskId 
 * @returns {object|null}
 */
export function getTask(taskId) {
  return tasks.get(taskId) || null;
}
