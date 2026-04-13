const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/auth');
const projectController = require('../controllers/projectController');

router.get('/', verifyToken, projectController.getListProject); 
router.get('/:id', verifyToken, requireRole("user"), projectController.getListProject);
router.post('/', verifyToken, requireRole(), projectController.addNewProject); 
router.patch('/:id', verifyToken, requireRole(), projectController.editProject); 
router.delete('/:id', verifyToken, requireRole(), projectController.removeProject); 

// read = all ,create, update, delete = admin 

module.exports = router;