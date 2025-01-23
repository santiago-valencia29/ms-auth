import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from './routes/auth.routes';
import specialRoutes from './routes/special.routes';
import passport from "passport";
import passportMiddleware from "./middlewares/passport";

dotenv.config();

// Initializations
const app = express();

// Settings
app.set("port", process.env.PORT || 3000);


//middlewares
app.use(morgan("dev"));
app.use(cors({ origin: ["http://localhost:4200", "https://front-end-3a3b1.web.app"] }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
passport.use(passportMiddleware);

//routes
app.get("/", (req, res) => {
    res.send(`The MicroService Auth is running on port ${app.get("port")}`);
});

app.use("/ms/auth", authRoutes);
app.use("/ms/auth", specialRoutes);

export default app;