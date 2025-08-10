import { Router } from 'express';
import { TaskController } from './task.controller.js';
import { TaskService } from './task.service.js';

// Create service instances
const taskService = new TaskService();

// Create controller instance
const taskController = new TaskController(taskService);

// Create router
const router = Router();

/**
 * @route POST /tasks
 * @desc Create a new image processing task
 * @access Public
 */
router.post('/', taskController.createTask.bind(taskController));

/**
 * @route GET /tasks/:taskId
 * @desc Get task status and results by ID
 * @access Public
 */
router.get('/:taskId', taskController.getTask.bind(taskController));

export default router;
