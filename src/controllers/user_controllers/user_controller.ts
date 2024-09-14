import { Request, Response } from "express";
import { prisma } from "../../database/prisma";

export const blockUser = async (req: Request, resp: Response) => {
    const userID = '86444607-43aa-45b1-9025-1ced34282088'; // hardcoded for now
    const { blockedEmail } = req.body

    try {
        const userToBeBlocked = await prisma.user.findUnique({
            where: {
                email: blockedEmail
            }
        })

        if (!userToBeBlocked) {
            return resp.status(404).json({
                response: "failure",
                message: "User with the specified email not found.",
                data: {}
            });
        }

        // Check if the block record already exists
        const existingBlock = await prisma.block.findFirst({
            where: {
                blockerId: userID,
                blockedId: userToBeBlocked.id
            }
        });

        if (existingBlock) {
            return resp.status(400).json({
                response: "failure",
                message: "User is already blocked.",
                data: {}
            });
        }

        const newBlock = await prisma.block.create({
            data: {
                blockerId: userID,
                blockedId: userToBeBlocked.id,
            }
        })

        return resp.status(201).json({
            response: "success",
            message: "User blocked successfully.",
            data: newBlock
        });

    } catch (error) {
        console.error('Error blocking user:', error);
        return resp.status(500).json({
            response: "failure",
            message: "Failed to block user.",
            data: {}
        });
    }
}


export const unblockUser = async (req: Request, resp: Response) => {
    const userID = '86444607-43aa-45b1-9025-1ced34282088'; // hardcoded for now
    const { blockedEmail } = req.body

    try {

        const blockedUser = await prisma.user.findUnique({
            where: { email: blockedEmail }
        });

        if (!blockedUser) {
            return resp.status(404).json({
                response: "failure",
                message: "User with the specified email not found.",
                data: {}
            });
        }

        const deletedBlock = await prisma.block.deleteMany({
            where: {
                blockerId: userID,
                blockedId: blockedUser.id,
            }
        })
        if (deletedBlock.count === 0) {
            return resp.status(404).json({
                response: "failure",
                message: "Block record not found.",
                data: {}
            });
        }

        return resp.status(200).json({
            response: "success",
            message: "User unblocked successfully.",
            data: {}
        });

    } catch (error) {
        console.error('Error unblocking user:', error);
        return resp.status(500).json({
            response: "failure",
            message: "Failed to unblock user.",
            data: {}
        });
    }
};



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