const { sequelize } = require("../connections/postgredb");
const { QueryTypes } = require("sequelize");
const convertCamelToSnake = require("../utils/camelToSnakeCase");

// AI genereated erd can only be generated if task is in archive state
// cl can be added from the insertion only if it exist in req body
// generated erd is text base
// 
// 

const insertOneTask = async (taskData , userId) => {
    const transaction = await sequelize.transaction();

    try {
        const [result] = await sequelize.query(
            `
            INSERT INTO tasks (
                project_id, assignee_id, created_by, 
                title, description, 
                problem, "result", problem_img, 
                proof_img, link_proof, status, progress_percent, 
                erd_ai_enabled, created_at, updated_at
            )
            VALUES (
                :projectId,:assigneeId,:createdBy,
                :title,:description,
                :problem,:result,:problemImg,
                :proofImg,:linkProof,:status,:progressPercent,
                :erdAiEnabled,NOW(),NOW()
            )
            RETURNING task_id
            `,
            {
                replacements: {
                    assigneeId: taskData.assigneeId ?? null,
                    projectId: taskData.projectId,
                    createdBy: userId,
                    title: taskData.title,
                    description: taskData.description ?? null,
                    problem: taskData.problem,
                    result: taskData.result ?? null,
                    problemImg: taskData.problemImg ?? null,
                    proofImg: taskData.proofImg ?? null,
                    linkProof: taskData.linkProof ?? null,
                    status: taskData.status ?? "created",
                    progressPercent: taskData.progressPercent ?? 0,
                    erdAiEnabled: taskData.erdAiEnabled ?? false,
                },
                type: QueryTypes.INSERT,
                transaction,
            }
        );

        const taskId = result[0].task_id;

        await transaction.commit();
        return taskId;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

const selectListTaskByProject = async ( projectId ) => {
    
    const result = await sequelize.query(
        `
        SELECT t.*
        FROM tasks t
        LEFT JOIN cl_task ct on ct.task_id = t.task_id
        WHERE t.project_id = :projectId
        `,
        {
            replacements: { projectId },
            type: QueryTypes.SELECT,
        }
    );

    return result;
};

const selectTaskById = async ( taskId ) => {
    
    const result = await sequelize.query(
        `
            SELECT t.* 
            FROM tasks t
            LEFT JOIN cl_task ct on ct.task_id = t.task_id
            WHERE t.task_id = :taskId
        `,
        // LEFT JOIN task_ai_generations tag  on tag.task_id  = t.task_id
        {
            replacements: { taskId },
            type: QueryTypes.SELECT,
        }
    );

    return result;
};
const selectAllTask = async ( ) => {
    
    const result = await sequelize.query(
        `
            SELECT t.* , p.title as project_name
            FROM tasks t
            LEFT JOIN cl_task ct on ct.task_id = t.task_id
            LEFT JOIN projects p on p.project_id = t.project_id
        `,
        // LEFT JOIN task_ai_generations tag  on tag.task_id  = t.task_id
        {
            replacements: { },
            type: QueryTypes.SELECT,
        }
    );

    return result;
};

const checkExistingProject = async ( projectId ) => {
    
    const result = await sequelize.query(
        `
        SELECT 1 
        FROM projects p
        WHERE p.project_id = :projectId
        `,
        // LEFT JOIN task_ai_generations tag  on tag.task_id  = t.task_id
        {
            replacements: { projectId },
            type: QueryTypes.SELECT,
        }
    );
    if (result.length <= 0){
        return false
    }
    return true;
};

const updateTask = async (taskId, taskData) => {
    const transaction = await sequelize.transaction();

    try {
        const fields = [];
        const replacements = { taskId };

        Object.entries(taskData).forEach(([key, value]) => {
            if (value !== undefined) {
                const newKey = convertCamelToSnake(key);
                fields.push(`${newKey} = :${newKey}`);
                replacements[newKey] = value;
            }
        });

        // nothing to update
        if (fields.length === 0) {
            await transaction.rollback();
            return null;
        }

        fields.push("updated_at = NOW()");
        // console.log(...fields);
        const [result] = await sequelize.query(
            `
                UPDATE tasks
                SET ${fields.join(", ")}
                WHERE task_id = :taskId
                RETURNING task_id
            `,
            {
                replacements,
                transaction,
            }
        );

        await transaction.commit();

        if (!result.length) return null;

        return result[0].task_id;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteTask = async (taskId) => {
    const [task] = await sequelize.query(
        `
            DELETE FROM tasks
            WHERE task_id = :taskId
            RETURNING task_id
        `,
        {
            replacements: { taskId },
            type: QueryTypes.DELETE,
        }
    );
    return task ?? null;
};

module.exports = {
    selectListTaskByProject,
    selectTaskById,
    insertOneTask,
    checkExistingProject,
    selectAllTask,
    deleteTask,
    updateTask
};