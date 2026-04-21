const { getAllProject, insertProject, updateProject, deleteProject } = require("../models/projectModel");

const getListProject = async (req, res) => {
    const projectId = req.params.id
    try {

        const listProject = await getAllProject((projectId ? projectId : null));

        if (listProject.length == 0){
            res.status(200).json({
                success: true,
                message: "Project empty",
            });
        }else{
            res.status(200).json({
                success: true,
                message: "Project found",
                data: listProject,
            });
        }
    } catch (error) {
        // console.error('Project Not Found: ' + error.message);
        res.status(500).json({ error: 'Error returning project!' });
    } 
}

const addNewProject = async  (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, message: "Required input not filled!" });
    }

    const userId = req.user.user_id;
    // console.log("TES " + userId)
    
    try {
        const project = await insertProject({
            title,
            description,
            userId
        });

        res.status(201).json({
            success: true,
            message: "Project created succesfully",
            // data: project,
        });
    } catch (error) {
        // console.error('Error adding new project: ' + error.message);
        res.status(500).json({ error: 'Error adding new project!' });
    }
}

const editProject = async  (req, res) => {
    const { title, description } = req.body;
    const projectId = req.params.id;

    if (!title && !description) {
        return res.status(400).json({
            success: false,
            message: "No fields provided for update"
        });
    }

    try{
        const updatedData = {
            title,
            description
        };
        // console.log("TES:", updatedData);
        const project = await updateProject(projectId,updatedData);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Project edited succesfully",
            // data: project,
        });

    }catch(error){
        // console.error('Error editing project: ' + error.message);
        res.status(500).json({ error: 'Error editing project!' });
    }
}

const removeProject = async (req, res) => {
    const projectId = req.params.id
    if(!projectId || projectId <= 0){
        return res.status(400).json({ success: false, message: "Input not filled" });
    }

    try {

        const deletedProject = await deleteProject(projectId);
        if (!deletedProject){
            return res.status(404).json({ success: false, message: "Project not found" });
        } else{
            res.status(200).json({
                success: true,
                message: "Project deleted",
                // data: deletedProject,
            });
        }


    } catch (error) {
        // console.error('Error deleting project: ' + error.message);
        res.status(500).json({ error: 'Error deleting project!' });
    } 
}

module.exports = { 
    getListProject,
    addNewProject,
    editProject,
    removeProject
};