import { Request, Response } from "express";
import { prisma } from "../../database/prisma";
import { UUID } from "crypto";
import { User } from "@prisma/client";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt"
import { setTokenCookie } from "../../utils/cookie_utils";

export const loginUser = async (req: Request, resp: Response) => {

    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
        });

        if (!user) {
            return resp.status(404).json({
                response: "failure",
                message: "User with the specified email not found.",
                data: {}
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return resp.status(400).json({
                response: "failure",
                message: "Incorrect password.",
                data: {}
            })
        }

        const token = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_SECRET as string, {
            expiresIn: '15m'
        });

        setTokenCookie(resp, token);

        return resp.status(200).json({
            response: "success",
            message: "User logged in successfully.",
            data: {
                token,
                user
            }
        });

    } catch (error) {
        return resp.status(500).json({
            response: "failure",
            message: "Login failed.",
            data: {}
        });
    }
}



export const signIn = async (req: Request, resp: Response) => {

    try {
        // const { name, email, password, image } = req.body;
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return resp.status(400).json({
                response: "failure",
                message: "Please provide all required fields.",
                data: {}
            })
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (user) {
            return resp.status(400).json({
                response: "failure",
                message: "User with the specified email already exists.",
                data: {}
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // const newUser = await prisma.user.create({
        //     data: {
        //         name: name,
        //         email: email,
        //         password: hashPassword,
        //         image: image
        //     }
        // })

        
        const newUser = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashPassword,
            }
        })

        if (!newUser) {
            return resp.status(500).json({
                response: "failure",
                message: "Failed to create user.",
                data: {}
            })
        }

        const token = jwt.sign({
            id: newUser.id,
            email: newUser.email
        }, process.env.JWT_SECRET as string, {
            expiresIn: '15m'
        })

        setTokenCookie(resp, token);

        return resp.status(200).json({
            response: "success",
            message: "User created successfully.",
            data: {
                user: newUser
            }
        })

    } catch (error) {
        console.error('Error in signIn:', error);
        return resp.status(500).json({
            response: "failure",
            message: "Failed to create user.",
            data: {}
        });
    }
}


export const logOut = async (req: Request, resp: Response) => {
    
    try {
        resp.clearCookie('jwt');
        return resp.status(200).json({
            response: "success",
            message: "Logged out successfully.",
            data: {}
        });
    } catch (error) {
        return resp.status(500).json({
            response: "failure",
            message: "Failed to log out.",
            data: {}
        });
    }
}


export const blockUser = async (req: Request, resp: Response) => {
    const userID: UUID = '86444607-43aa-45b1-9025-1ced34282088'; // hardcoded for now
    const { blockedEmail } = req.body

    try {
        const userToBeBlocked: User | null = await prisma.user.findUnique({
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