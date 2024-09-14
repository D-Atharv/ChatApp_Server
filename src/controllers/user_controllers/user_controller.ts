import { Request, Response } from "express";
import { prisma } from "../../database/prisma";

export const updateUser = async (req: Request, resp: Response) => {
    const userID = '86444607-43aa-45b1-9025-1ced34282088'; // hardcoded for now
    const { email, name, image, } = req.body;

    try {
        if (!email && !name && !image) {
            return resp.status(400).json({
                response: "failure",
                message: "No fields to update. Please provide at least one field to update.",
                data: {}
            });
        }

        const userExists = await prisma.user.findUnique({
            where: { id: userID }
        });

        if (!userExists) {
            return resp.status(404).json({
                response: "failure",
                message: "User not found.",
                data: {}
            });
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: userID
            },
            data: {
                email: email ? email : userExists.email, // Only update if provided
                name: name ? name : userExists.name,
                image: image ? image : userExists.image
            }
        });

        return resp.status(200).json({
            response: "success",
            message: "User updated successfully.",
            data: updatedUser
        });
    }
    catch (error) {
        console.error('Error updating user:', error);
        resp.status(500).json({
            response: "failure",
            message: "Failed to update user",
            data: {}
        });
    }

}