import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  comparePassword: (password: string) => Promise<boolean>;
}

/**
 * Esquema de usuario para MongoDB.
 */
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
});

/**
 * Middleware de Mongoose que se ejecuta antes de guardar un documento de usuario.
 * Si la contraseña ha sido modificada, se genera un hash de la contraseña.
 */
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

/**
 * Método para comparar la contraseña ingresada con la contraseña almacenada.
 * @param password - La contraseña ingresada por el usuario.
 * @returns Una promesa que resuelve en verdadero si las contraseñas coinciden, de lo contrario, falso.
 */
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

const User = model<IUser>("User", userSchema);

export default User;
