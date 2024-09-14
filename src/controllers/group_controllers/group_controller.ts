import { Request, Response } from "express";
import { prisma } from "../../database/prisma";

export const getAllUserGroups = async (req: Request, resp: Response) => {
    const userID = '3871e4a5-ee63-4b7a-abb4-bcd65316656f'; // hardcoded for now

    try {
        const groups = await prisma.group.findMany({
            where: {
                users: {
                    some: {
                        userId: userID
                    }
                }
            },
            include: {
                users: {
                    select: {
                        userId: true,
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        const formattedGroups = groups.map(group => {
            if (!group.isGroupChat) {
                const otherUser = group.users.find(user => user.userId !== userID);

                return {
                    id: group.id,
                    title: otherUser ? otherUser.user.name : null,
                    isGroupChat: group.isGroupChat,
                    creatorId: group.creatorId,
                    createdAt: group.createdAt.toISOString(),
                    users: group.users.map(user => ({
                        userId: user.userId,
                        name: user.user.name
                    }))
                };
            }
            return {
                id: group.id,
                title: group.title,
                isGroupChat: group.isGroupChat,
                creatorId: group.creatorId,
                createdAt: group.createdAt.toISOString(),
                users: group.users.map(user => ({
                    userId: user.userId,
                    name: user.user.name
                }))
            };
        });

        resp.status(200).json({
            response: "success",
            message: "Retrieved all groups",
            data: formattedGroups
        });

    } catch (error) {
        console.error('Error fetching user groups:', error);
        resp.status(500).json({
            response: "error",
            message: "Failed to retrieve user groups",
        });
    }
};

//handle in frontend
