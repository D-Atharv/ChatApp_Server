import { Request, Response } from "express";
import { prisma } from "../../database/prisma";


export const createGroup = async (req: Request, resp: Response) => {
    const userID = req.user?.id;
    const { otherUserEmail } = req.body;

    if (!userID) {
        return resp.status(400).json({
            response: "failure",
            message: "User ID not provided",
        });
    }

    try {
        const otherUser = await prisma.user.findUnique({
            where: {
                email: otherUserEmail
            },
            select: {
                id: true, name: true, image: true
            } // Include name and image for response
        });

        if (!otherUser) {
            return resp.status(404).json({
                response: "failure",
                message: "User with this email does not exist."
            });
        }

        const existingGroup = await prisma.group.findFirst({
            where: {
                isGroupChat: false,
                users: {
                    every: {
                        userId: {
                            in: [userID, otherUser.id]
                        }
                    }
                }
            },
            include: {
                users: {
                    include: {
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

        if (existingGroup) {
            const responseData = existingGroup.isGroupChat ? {
                id: existingGroup.id,
                title: existingGroup.title,
                members: existingGroup.users.map(u => ({
                    userId: u.user.id,
                    name: u.user.name,
                }))
            } : {
                id: existingGroup.id,
                otherUserName: otherUser.name,
                otherUserImage: otherUser.image
            };
            return resp.status(200).json({
                response: "success",
                message: "A group between these users already exists.",
                data: responseData
            });
        }

        const createNewGroup = await prisma.group.create({
            data: {
                isGroupChat: false, // Assuming always false for direct creation
                creatorId: userID,
                users: {
                    create: [
                        { userId: userID },
                        { userId: otherUser.id }
                    ]
                }
            },
            include: {
                users: {
                    include: {
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

        const responseData = createNewGroup.isGroupChat ? {
            id: createNewGroup.id,
            title: createNewGroup.title,
            members: createNewGroup.users.map(u => ({
                userId: u.user.id,
                name: u.user.name,
            }))
        } : {
            id: createNewGroup.id,
            otherUserName: otherUser.name,
            otherUserImage: otherUser.image
        };

        return resp.status(201).json({
            response: "success",
            message: "Group created successfully.",
            data: responseData
        });

    } catch (error) {
        console.error('Error creating group:', error);
        resp.status(500).json({
            response: "failure",
            message: "Failed to create group"
        });
    }
};



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
                    select: {
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
                image: u.user.image
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



