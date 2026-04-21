const express = require("express");
const cors = require("cors");
const authRoute = require('./src/routes/authRoute');
const projectRoute = require('./src/routes/projectRoute');
const taskRoute = require('./src/routes/taskRoute');
const { sequelize } = require('./src/connections/postgredb');
const cookieParser = require("cookie-parser");
require('dotenv').config();

const app = express();
const PORT_SERVER = process.env.PORT_SERVER || 3000;
// Middleware
app.use(cors({
    origin: process.env.FE_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({ message: "API running" });
});

app.use('/v1/auth',authRoute);
app.use('/v1/project',projectRoute);
app.use('/v1/task',taskRoute);

async function startServer() {
    try {
        // Test DB connection
        await sequelize.authenticate();
        console.log("✅ PostgreSQL connected");

        // Start Express server
        app.listen(PORT_SERVER, () => {
            console.log(`Server is running`);
        });

        } catch (error) {
        console.error("❌ Unable to connect to database:", error);
        process.exit(1);
    }
}

startServer();
