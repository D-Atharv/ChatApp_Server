import {prisma} from "./prisma";
import 'dotenv/config';
export async function connectDB() {
    try {
        console.log("Attempting to connect to Prisma...");
        await prisma.$connect();
        console.log("Connected to Prisma");
    } catch (error) {
        console.error("Error connecting to Prisma:", error);
        process.exit(1);  
    }
}

export { prisma };
