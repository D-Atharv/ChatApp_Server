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


export const sendMessage = async (req: Request, resp: Response) => {
    const userID = req.user?.id;
    const { groupID } = req.params;
    const { content } = req.body;

    if (!content || !userID || !groupID) {
        return resp.status(400).json({
            response: "failure",
            message: "Missing required fields",
            data: {}
        });
    }

    try {
        //to determine if it's a group chat or one-on-one
        const group = await prisma.group.findUnique({
            where: {
                id: groupID
            },
            include: {
                users: true
            }
        })

        if (!group) {
            return resp.status(400).json({
                response: "failure",
                message: "Group not found",
                data: {}
            });
        }

        const isUserInGroup = await prisma.groupUsers.findFirst({
            where: {
                groupId: groupID,
                userId: userID
            }
        })

        if (!isUserInGroup) {
            return resp.status(400).json({
                response: "failure",
                message: "User does not belong to this group",
                data: {}
            });
        }

        const blockedByOthers = await prisma.block.findFirst({
            where: {
                blockedId: userID,
                blockerId: { in: group.users.map(user => user.userId) },
            },
        });

        if (blockedByOthers) {
            return resp.status(400).json({
                response: "failure",
                message: "User is blocked by a member of this group",
                data: {}
            });
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
                })

                if (hasBlockingIssues) {
                    return resp.status(400).json({
                        response: "failure",
                        message: "Either the current user have the blocked the other user or the other user has blocked the current user",
                        data: {}
                    });
                }
            }


            const message = await prisma.message.create({
                data: {
                    content,
                    sender: {
                        connect: {
                            id: userID
                        }
                    },
                    group: {
                        connect: {
                            id: groupID
                        }
                    },
                    createdAt: new Date(),
                }
            })

            if (!message) {
                return resp.status(400).json({
                    response: "failure",
                    message: "Error creating message",
                    data: {}
                });
            }

            return resp.status(400).json({
                response: "success",
                message: "User sends the message",
                data: { message }
            });

        }

    } catch (error) {
        console.log(error)
        return resp.status(400).json({
            response: "error",
            message: "Error in sending message",
            data: {}
        });
    }

}