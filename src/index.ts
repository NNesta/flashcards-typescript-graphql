import express, { Express } from "express";

const PORT = process.env.PORT || 4000;
const main = async () => {
    const app = express();
    app.get('/', (_req: any, res: { send: (arg0: string) => any; }) => res.send("Hello World"));
    app.listen(PORT, ()=>console.log(`Server started on port ${PORT}`))
    
}
main().catch((err) =>console.error(err))