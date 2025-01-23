import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

export class UserService {

    /**
   * Registra un nuevo usuario en el sistema.
   * 
   * @param userName - El nombre de usuario.
   * @param email - El correo electrónico del usuario.
   * @param password - La contraseña del usuario.
   * @returns Una promesa que se resuelve cuando el usuario ha sido registrado.
   * @throws Error si el usuario ya existe o si ocurre un error durante el registro.
   */
  static async registerUser(
    userName: string,
    email: string,
    password: string
  ): Promise<void> {
    try {

      // Verifica si el usuario ya existe en la base de datos
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("El usuario ya existe");
      }

      // Hashea la contraseña del usuario
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crea un nuevo usuario con los datos proporcionados
      const newUser = new User({
        userName,
        email,
        password: hashedPassword,
      });
      
      // Guarda el nuevo usuario en la base de datos
      await newUser.save();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Error al registrar el usuario: " + error.message);
      } else {
        throw new Error("Error al registrar el usuario");
      }
    }
  }

  // Autenticar un usuario
  static async loginUser(
    email: string,
    password: string
  ): Promise<string | null> {
    try {
      // Buscar el usuario por correo electrónico
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("Credenciales inválidas");
      }

      // Verificamos la contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Credenciales inválidas");
      }

      // Generamos un token JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" } // Expiración del token
      );

      return token;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Error al autenticar el usuario: " + error.message);
      } else {
        throw new Error("Error al autenticar el usuario");
      }
    }
  }
}

export default UserService;
