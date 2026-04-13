const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/auth');
const taskController = require('../controllers/taskController');

// endpoiint ADMIN
router.get('/all', verifyToken, requireRole(), taskController.getListTaskAll); 

// endpoint ALL
router.get('/:id', verifyToken, requireRole("user"), taskController.getListTaskById); 
router.get('/project/:id', verifyToken, requireRole("user"), taskController.getListTaskByProject); 
router.post('/', verifyToken, requireRole("user"), taskController.addNewTask ); 
router.patch('/:id', verifyToken, requireRole("user"), taskController.editTask ); 
router.delete('/:id', verifyToken, requireRole("user"), taskController.removeTask ); 

module.exports = router;