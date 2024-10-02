import { Request, response, Response } from "express";
import { prisma } from "../../database/prisma";

export const getMessageForGroup = async (req: Request, resp: Response) => {
    const userID = req.user?.id;
    const groupID = req.params.groupID;

    if (!groupID) {
        return resp.status(400).json({
            response: "error",
            message: "Group ID is required",
            data: {}
        });
    }

    try {
        // Check if the user has access to the group
        const group = await prisma.group.findFirst({
            where: {
                id: groupID,
                users: {
                    some: {
                        userId: userID
                    }
                }
            }
        });

        if (!group) {
            return resp.status(403).json({
                response: "error",
                message: "Access denied or group not found",
                data: {}
            });
        }

        // Retrieve all messages for the group
        const messages = await prisma.message.findMany({
            where: {
                groupId: groupID
            },
            orderBy: {
                createdAt: 'desc'
            },
        });

        if (messages.length === 0) {
            return resp.status(404).json({
                response: "failure",
                message: "No messages found for this group",
                data: {}
            });
        }

        resp.status(200).json({
            response: "success",
            message: "Retrieved messages for the group",
            data: messages
        });

    } catch (error) {
        console.error('Error fetching messages for group:', error);
        resp.status(500).json({
            response: "error",
            message: "Failed to retrieve messages for the group",
            data: {}
        });
    }
};
