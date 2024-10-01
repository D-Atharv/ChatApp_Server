import { Request, Response } from "express";
import { prisma } from "../../database/prisma";
import { group } from "console";
import { title } from "process";


export const createGroup = async (req: Request, resp: Response) => {
    const userID = '3871e4a5-ee63-4b7a-abb4-bcd65316656f'; // hardcoded for now

    const { otherUserEmail } = req.body;

    try {
        const otherUser = await prisma.user.findUnique({
            where: {
                email: otherUserEmail
            }
        });

        if (!otherUser) {
            return resp.status(404).json({
                response: "failure",
                message: "User with this email does not exist.",
                data: {}
            });
        }

        const checkExistingGroup = await prisma.group.findFirst({
            where: {
                isGroupChat: false,
                AND: [
                    { users: { some: { userId: userID } } },
                    { users: { some: { userId: otherUser.id } } }
                ]
            }, include: {
                users: true
            }
        })

        if (checkExistingGroup) {
            return resp.status(200).json({
                response: "success",
                message: "A group between these users already exists.",
                data: {}
            });
        }

        const createNewGroup = await prisma.group.create({
            data: {
                isGroupChat: false,
                creatorId: userID,

                users: {
                    create: [
                        { userId: userID },
                        { userId: otherUser.id }
                    ]
                }
            },
            include: {
                users: true
            }
        })

        return resp.status(201).json({
            response: "success",
            message: "Group created successfully.",
            data: createNewGroup
        });

    } catch (error) {
        console.error('Error creating group:', error);
        resp.status(500).json({
            response: "failure",
            message: "Failed to create group",
            data: {}
        })
    }
}


//handle in frontend
export const getAllUserGroups = async (req: Request, resp: Response) => {
    const userID = '3871e4a5-ee63-4b7a-abb4-bcd65316656f'; // hardcoded for now

    if(!userID) {
        return resp.status(400).json({
            response: "failure",
            message: "User ID not provided",
        })
    }

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

        const formattedGroups = groups.map(group => ({
            id: group.id,
            title : group.isGroupChat ? group.title : undefined,
            isGroupChat : group.isGroupChat,
            users: group.users.map(user => ({
                userId : user.userId,
                name:user.user.name
            }))
        }))

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



