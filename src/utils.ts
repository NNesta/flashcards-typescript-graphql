import { PrismaClient } from "@prisma/client";

export const createUser = async () => {
    const prisma = new PrismaClient();
    const createRes = await prisma.user.createMany({
        
        data: {email: "ngabonest@gmail.com",
        password: "Hello123"}
    })
    console.log(createRes);
    console.log("createRes");
    return createRes;
}

