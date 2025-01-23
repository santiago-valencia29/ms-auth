
import { Strategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import User from "../models/user.model";
import dotenv from "dotenv";

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

/**
 * Opciones para la estrategia JWT.
 * - `jwtFromRequest`: Especifica cómo se debe extraer el JWT de la solicitud. En este caso, se extrae del encabezado de autorización como un token Bearer.
 * - `secretOrKey`: La clave secreta utilizada para firmar el JWT, obtenida de las variables de entorno.
 */
const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

/**
 * Exporta una nueva instancia de la estrategia JWT.
 * - `opts`: Las opciones configuradas para la estrategia.
 * - Función de verificación: Se ejecuta cuando se recibe un JWT. Busca al usuario por ID en la carga útil del JWT.
 *   - Si el usuario es encontrado, se llama a `done` con el usuario.
 *   - Si no se encuentra el usuario, se llama a `done` con `false`.
 *   - Si ocurre un error, se registra en la consola.
 */
export default new Strategy(opts, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    console.log(error);
  }
});