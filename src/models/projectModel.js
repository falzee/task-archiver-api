const { sequelize } = require("../connections/postgredb");
const { QueryTypes } = require("sequelize");

const insertProject = async ({ title, description, userId }) => {
    const transaction = await sequelize.transaction();

    try {
        const [result] = await sequelize.query(
            `
            INSERT INTO projects (title, description, user_id, created_at, updated_at)
            VALUES (:title, :description, :userId, NOW(), NOW())
            RETURNING project_id
            `,
            {
                replacements: { title, description, userId },
                type: QueryTypes.INSERT,
                transaction,
            }
        );

        const projectId = result[0].project_id;

        await transaction.commit();
        return projectId;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

const getAllProject = async ( projectId ) => {
    let result;
    
    if(projectId){
        result = await sequelize.query(
            `
            SELECT 
            p.project_id,
            p.title,
            p.description
            FROM projects p
            WHERE p.project_id = :projectId
            `,
            {
                replacements: { projectId },
                type: QueryTypes.SELECT,
            }
        );

    } else {
        result = await sequelize.query(
            `
            SELECT 
                p.project_id,
                p.title,
                p.description
            FROM projects p
            `,
            {
                type: QueryTypes.SELECT,
            }
        );
        
    }
    
    return result; // single user
};

const updateProject = async (projectId, updateData) => {
    const transaction = await sequelize.transaction();

    try {
        const fields = [];
        const replacements = { projectId };
        const allowedFields = ["title", "description"];

        // validasi input
        Object.entries(updateData).forEach(([key, value]) => {
            if (allowedFields.includes(key) && value !== undefined) {
                fields.push(`${key} = :${key}`);
                replacements[key] = value;
            }
        });

        // nothing to update
        if (fields.length === 0) {
            await transaction.rollback();
            return null;
        }

        fields.push("updated_at = NOW()");

        const [result] = await sequelize.query(
            `
            UPDATE projects
            SET ${fields.join(", ")}
            WHERE project_id = :projectId
            RETURNING project_id
            `,
            {
                replacements,
                transaction,
            }
        );

        await transaction.commit();

        if (!result.length) return null;

        return result[0].project_id;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteProject = async (projectId) => {
    const [project] = await sequelize.query(
        `
        DELETE FROM projects
        WHERE project_id = :projectId
        RETURNING project_id
        `,
        {
            replacements: { projectId },
            type: QueryTypes.DELETE,
        }
    );
    console.log(project ?? null);
    return project ?? null;
};

module.exports = {
    getAllProject,
    insertProject,
    updateProject,
    deleteProject
};