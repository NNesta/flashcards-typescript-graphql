import express from "express";
import { createUser } from "./utils"

const PORT = process.env.PORT || 4000;
const main = async () => {
    const app = express();
    app.get('/', (_req, res) => res.send("Hello world"));
    app.listen(PORT, ()=>console.log(`Server started on port ${PORT}`))
    
}
main().catch((err) =>console.error(err))