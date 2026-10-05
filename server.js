import dotenv from "dotenv";
import app from "./app.js";
import { testConnection } from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const startServer = async () => {await testConnection();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};
startServer();