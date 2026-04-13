const { sequelize } = require("../connections/postgredb");
const { QueryTypes } = require("sequelize");

const regisUser = async ( { username, password, name, email, }) => {

    const transaction = await sequelize.transaction();

    try {
        // insert user
        const [user] = await sequelize.query(
            `
            INSERT INTO users (username, password, role, created_at, updated_at)
            VALUES (:username, :password, 'user', NOW(), NOW())
            RETURNING user_id, username
            `,
            {
                replacements: { username, password },
                type: QueryTypes.INSERT,
                transaction,
            }
        );

        const userId = user[0].user_id;

        // insert profile
        await sequelize.query(
            `
            INSERT INTO profiles (user_id, name, email, created_at, updated_at)
            VALUES (:user_id, :name, :email, NOW(), NOW())
            `,
            {
                replacements: {
                    user_id: userId,
                    name,
                    email,
                },
                type: QueryTypes.INSERT,
                transaction,
            }
        );

        await transaction.commit();

        return user[0];

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const findUserByUsername = async (username) => {
    const result = await sequelize.query(
        `
        SELECT 
            u.user_id,
            u.username,
            u.password,
            u.role,
            p.name,
            p.email,
            p.pp_img
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.user_id
        WHERE u.username = :username
        LIMIT 1
        `,
        {
            replacements: { username },
            type: QueryTypes.SELECT,
        }
    );

  return result[0]; // single user
};

module.exports = {
    regisUser,
    findUserByUsername
};