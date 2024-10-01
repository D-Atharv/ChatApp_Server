import { Request, Response } from "express";
import { prisma } from "../../database/prisma";


export const createGroup = async (req: Request, resp: Response) => {

    const userID = req.user?.id;

    const { otherUserEmail } = req.body;

    try {
        const otherUser = await prisma.user.findUnique({
            where: {
                email: otherUserEmail
            },
            select: {
                id: true,
                image: true
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
                users: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                image: true
                            }
                        }
                    }
                }
            }
        })

        if (checkExistingGroup) {
            return resp.status(200).json({
                response: "success",
                message: "A group between these users already exists.",
                data: {
                    id: checkExistingGroup.id,
                    users: checkExistingGroup.users.map(u => ({
                        userId: u.user.id,
                        image: u.user.image
                    }))
                }
            });
        }

        //hardcoded for one-one chat
        const createNewGroup = await prisma.group.create({
            data: {
                isGroupChat: false,
                creatorId: userID ?? '',

                users: {
                    create: [
                        { userId: userID ?? '' },
                        { userId: otherUser.id }
                    ]
                }
            },
            include: {
                users: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                image: true
                            }
                        }
                    }
                }
            }
        })

        return resp.status(201).json({
            response: "success",
            message: "Group created successfully.",
            data: {
                id: createNewGroup.id,
                users: createNewGroup.users.map(u => ({
                    userId: u.user.id,
                    image: u.user.image
                }))
            }
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

export const getAllUserGroups = async (req: Request, resp: Response) => {
    const userID = req.user?.id;

    if (!userID) {
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
                    where: {
                        userId: {
                            not: userID //removing currentUserID
                        }
                    },
                    select : {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });

        const formattedGroups = groups.map(group => ({
            id: group.id,
            title: group.isGroupChat ? group.title : undefined,
            isGroupChat: group.isGroupChat,
            users: group.users.map(u => ({
                userId: u.user.id, //other userID
                name: u.user.name,
                image : u.user.image
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



