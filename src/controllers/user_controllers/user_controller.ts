import { Request, Response } from "express";
import { prisma } from "../../database/prisma";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt"
import { setTokenCookie } from "../../utils/cookie_utils";

export const loginUser = async (req: Request, resp: Response) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return resp.status(400).json({
                response: "failure",
                message: "Please provide all required fields.",
                data: {}
            })
        }

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

        setTokenCookie(resp, token,user.id);

        return resp.status(200).json({
            response: "success",
            message: "User logged in successfully.",
            data: {
                token: token,
                userID: user.id
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

        setTokenCookie(resp, token,newUser.id);

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
    const userID = req.user?.id;

    try {
        if (userID) {
            const cookieName = `jwt_${userID}`;
            resp.clearCookie(cookieName); 
        }
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

export const updateUser = async (req: Request, resp: Response) => {
    const userID = req.user?.id;
    const { name, newPassword } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        if (!name && !image && !newPassword) {
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
                name: name ? name : userExists.name,
                image: image ? image : userExists.image,
                password: newPassword ? await bcrypt.hash(newPassword, 10) : userExists.password,
            }
        });

        return resp.status(200).json({
            response: "success",
            message: "User updated successfully.",
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        resp.status(500).json({
            response: "failure",
            message: "Failed to update user",
            data: {}
        });
    }
}

export const getMe = async (req: Request, resp: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user?.id,
            }
        })

        if (!user) {
            return resp.status(404).json({
                error: "User not found"
            });
        }

        const imageUrl = user.image ? `${req.protocol}://${req.get('host')}${user.image}` : null;

        resp.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            image: imageUrl 
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("error in getMe controller", error.message)
            resp.status(500).json({ error: "Internal Server Error" });
        }
    }
}
