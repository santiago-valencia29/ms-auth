import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";

/**
 * Crea un token JWT para un usuario.
 * @param user - El usuario para el cual se creará el token.
 * @returns El token JWT.
 */
function createToken(user: IUser): string {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    {
      expiresIn: 86400, // El token expira en 24 horas.
    }
  );
}

/**
 * Controlador para registrar un nuevo usuario.
 * @param req - La solicitud HTTP.
 * @param res - La respuesta HTTP.
 * @param next - La función de siguiente middleware.
 */
export const singUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ msg: "Please send your email and password" });
      return;
    }

    const user = await User.findOne({ email });

    if (user) {
      res.status(400).json({ msg: "User already exists" });
      return;
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res
      .status(201)
      .json({ msg: `User registered successfully`, user: newUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para iniciar sesión de un usuario.
 * @param req - La solicitud HTTP.
 * @param res - La respuesta HTTP.
 * @param next - La función de siguiente middleware.
 */
export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ msg: "Please send your email and password" });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ msg: "Email does not exist" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      const payload = {name: user.name, email: user.email, sub: user.id}
      res.status(200).json({ payload, access_token: createToken(user) });
    } else {
      res.status(400).json({ msg: "The email or password is incorrect" });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para validar un token JWT.
 * @param req - La solicitud HTTP.
 * @param res - La respuesta HTTP.
 * @param next - La función de siguiente middleware.
 */
export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ msg: "No token provided or invalid token format" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; 
    res
      .status(200)
      .json({ success: true, msg: "Token is valid", user: req.user });
  } catch (error) {
  
    const errorMessage = (error as Error).message;
    res.status(401).json({
      success: false,
      msg: "Invalid or expired token",
      error: errorMessage,
    });
  }
};