const { 
    insertOneTask,
    checkExistingProject,
    selectListTaskByProject,
    selectTaskById,
    selectAllTask,
    deleteTask,
    updateTask
} = require("../models/taskModel");

const getListTaskByProject = async (req, res) => {
    const projectId = req.params.id;

    if(!projectId){
        return res.status(400).json({ success: false, message: "Bad request!" });
    }

    try {
        const listProject = await selectListTaskByProject(projectId);

        if (listProject.length == 0){
            res.status(200).json({
                success: false,
                message: "Task not found",
            });
        }else{
            res.status(200).json({
                success: true,
                message: "Task found",
                data: listProject,
                });
            }
    } catch (error) {
        // console.error('Task Not Found: ' + error.message);
        res.status(500).json({ error: 'Error returning task!' });
    } 
}

const getListTaskById = async (req, res) => {
    const taskId = req.params.id;

    if(!taskId){
        return res.status(400).json({ success: false, message: "Bad request!" });
    }

    try {
        const listProject = await selectTaskById(taskId);

        if (listProject.length == 0){
            res.status(200).json({
                success: false,
                message: "Task not found",
            });
        }else{
            res.status(200).json({
                success: true,
                message: "Task found",
                data: listProject,
            });
        }
    } catch (error) {
        // console.error('Task Not Found: ' + error.message);
        res.status(500).json({ error: 'Error returning task!' });
    } 
}

const getListTaskAll = async (req, res) => {
    const isAdmin = req.user.role;

    if(isAdmin != 'admin'){
        return res.status(401).json({ success: false, message: "Unauthorized!" });
    }

    try {
        const listProject = await selectAllTask();

        if (listProject.length == 0){
            res.status(200).json({
                success: false,
                message: "Task not found",
            });
        }else{
            res.status(200).json({
                success: true,
                message: "Task found",
                data: listProject,
            });
        }
    } catch (error) {
        // console.error('Task Not Found: ' + error.message);
        res.status(500).json({ error: 'Error returning task!' });
    } 
}

const addNewTask = async  (req, res) => {
    try {
        const taskData = req.body;
        const userId = req.user.user_id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!taskData || !taskData.projectId || !taskData.title || !taskData.problem) {
            return res.status(400).json({ success: false, message: "Required input not filled!" });
        }

        const checkProject = await checkExistingProject(taskData.projectId)
        if(!checkProject){
            return res.status(400).json({ success: false, message: "Project not exist!" });
        }

        await insertOneTask(taskData , userId);

        res.status(201).json({
            success: true,
            message: "Task created succesfully",
            // data: project,
        });
    } catch (error) {
        // console.error('Error adding new task: ' + error.message);
        res.status(500).json({ error: 'Error adding new task!' });
    }
}

const editTask = async  (req, res) => {
    const taskData = req.body;
    const taskId = req.params.id;

    if(!taskData || !taskId){
        return res.status(400).json({ success: false, message: "Required input not filled!" });
    }

    // harus exact type equal
    if(taskData.status === null || taskData.projectId === null || taskData.title === null || taskData.problem === null){
        return res.status(400).json({ success: false, message: "This input cannot be empty" });
    }

    try{
        const task = await updateTask(taskId,taskData);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Task edited succesfully",
            // data: project,
        });

    }catch(error){
        // console.error('Error editing project: ' + error.message);
        res.status(500).json({ error: 'Error editing task!' });
    }
}

const removeTask = async (req, res) => {
    const taskId = req.params.id

    if(!taskId || taskId <= 0){
        return res.status(400).json({ success: false, message: "Bad request" });
    }

    try {
        const deletedProject = await deleteTask(taskId);
        
        if (!deletedProject){
            return res.status(404).json({ success: false, message: "Task not found" });
        } else{
            res.status(200).json({
                success: true,
                message: "Task deleted",
                // data: deletedProject,
            });
        }


    } catch (error) {
        // console.error('Error deleting task: ' + error.message);
        res.status(500).json({ error: 'Error deleting task!' });
    } 
}

module.exports = { 
    addNewTask,
    getListTaskByProject,
    getListTaskById,
    getListTaskAll,
    removeTask,
    editTask
};