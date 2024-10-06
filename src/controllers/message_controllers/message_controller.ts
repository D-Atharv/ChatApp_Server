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
                createdAt: 'asc'
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


export const sendMessage = async (userID: string, groupID: string, content: string) => {
    if (!content || !userID || !groupID) {
        return {
            response: "failure",
            message: "Missing required fields",
            data: {}
        };
    }

    try {
        const group = await prisma.group.findUnique({
            where: { id: groupID },
            include: { users: true }
        });

        if (!group) {
            return {
                response: "failure",
                message: "Group not found",
                data: {}
            };
        }

        const isUserInGroup = await prisma.groupUsers.findFirst({
            where: { groupId: groupID, userId: userID }
        });

        if (!isUserInGroup) {
            return {
                response: "failure",
                message: "User does not belong to this group",
                data: {}
            };
        }

        const blockedByOthers = await prisma.block.findFirst({
            where: {
                blockedId: userID,
                blockerId: { in: group.users.map(user => user.userId) },
            },
        });

        if (blockedByOthers) {
            return {
                response: "failure",
                message: "User is blocked by a member of this group",
                data: {}
            };
        }

        if (!group.isGroupChat) {
            const otherUser = group.users.find(user => user.userId !== userID);

            if (otherUser) {
                const hasBlockingIssues = await prisma.block.findFirst({
                    where: {
                        OR: [
                            { blockedId: userID, blockerId: otherUser.userId },
                            { blockedId: otherUser.userId, blockerId: userID },
                        ],
                    },
                });

                if (hasBlockingIssues) {
                    return {
                        response: "failure",
                        message: "One of the users is blocked by the other",
                        data: {}
                    };
                }
            }
        }

        const message = await prisma.message.create({
            data: {
                content,
                sender: {
                    connect: { id: userID }
                },
                group: {
                    connect: { id: groupID }
                },
                createdAt: new Date(),
            }
        });

        if (!message) {
            return {
                response: "failure",
                message: "Error creating message",
                data: {}
            };
        }

        return {
            response: "success",
            message: "Message sent successfully",
            data: { message }
        };

    } catch (error) {
        console.error(error);
        return {
            response: "error",
            message: "Error in sending message",
            data: {}
        };
    }
};
