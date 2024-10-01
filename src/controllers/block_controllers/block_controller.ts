import { Request, Response } from "express";
import { prisma } from "../../database/prisma";


export const blockUser = async (req: Request, resp: Response) => {
    const blockerId = req.user?.id; /// ID of the user doing the blocking
    const { email } = req.body; //Email of the user to be blocked,


    if (!blockerId || !email) {
        return resp.status(400).json({
            response: "error",
            message: "Both blocker ID and blocked user's email are required",
        });
    }

    try {
        const userToBeBlocked = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!userToBeBlocked) {
            return resp.status(404).json({
                response: "error",
                message: "User with the specified email not found",
            });
        }

        const block = await prisma.block.create({
            data: {
                blockerId: blockerId,
                blockedId: userToBeBlocked.id
            }
        })

        return resp.status(201).json({
            response: "success",
            message: "User successfully blocked",
            data: block
        });

    } catch (error) {
        console.error('Error blocking user:', error);
        resp.status(500).json({
            response: "error",
            message: "Failed to block user",
        });
    }
}


export const unblockUser = async (req: Request, resp: Response) => {
    const blockerId = req.user?.id;
    const { email } = req.body;

    if (!blockerId || !email) {
        return resp.status(400).json({
            response: "error",
            message: "Both blocker ID and blocked user's email are required",
        });
    }

    try {
        const userToUnblock = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!userToUnblock) {
            return resp.status(404).json({
                response: "error",
                message: "User with the specified email not found",
            });
        }

        const block = await prisma.block.deleteMany({
            where: {
                blockerId: blockerId,
                blockedId: userToUnblock.id,
            }
        });

        if (block.count === 0) {
            return resp.status(404).json({
                response: "error",
                message: "No block found between these users",
            });
        }

        return resp.status(200).json({
            response: "success",
            message: "User successfully unblocked",
            data: block
        });
    } catch (error) {
        console.error('Error unblocking user:', error);
        resp.status(500).json({
            response: "error",
            message: "Failed to unblock user",
        });
    }
};


export const getBlockedGroups = async (req: Request, resp: Response) => {
    const currentUserId = req.user?.id;

    if (!currentUserId) {
        return resp.status(400).json({
            response: "error",
            message: "User ID is required",
        });
    }

    try {
        const blockedUsers = await prisma.block.findMany({
            where: { blockerId: currentUserId },
            select: { blockedId: true }
        });

        if (blockedUsers.length === 0) {
            return resp.status(404).json({
                response: "info",
                message: "No users have been blocked by this user",
                data: []
            });
        }

        const blockedUserIds = blockedUsers.map(b => b.blockedId);

        const groups = await prisma.group.findMany({
            where: {
                users: { some: { userId: { in: blockedUserIds } } }
            },
            include: {
                users: {
                    include: { user: true }
                }
            }
        });

        const formattedGroups = groups.map(group => {
            if (!group.isGroupChat) {
                const otherUser = group.users.find(u => u.userId !== currentUserId);
                return {
                    groupId: group.id,
                    otherUserId: otherUser?.userId,
                };
            } else {
                // Return group title and details of all members except the current user
                return {
                    groupId: group.id,
                    title: group.title,
                    members: group.users
                        .filter(u => u.userId !== currentUserId)
                        .map(u => ({
                            userId: u.user.id,
                            name: u.user.name,
                            email: u.user.email
                        }))
                };
            }
        });

        return resp.status(200).json({
            response: "success",
            message: "Retrieved all relevant group data",
            data: formattedGroups
        });

    } catch (error) {
        console.error('Error fetching group data:', error);
        resp.status(500).json({
            response: "error",
            message: "Failed to retrieve group data",
        });
    }
};
