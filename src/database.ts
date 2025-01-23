import mongoose from "mongoose";

mongoose.connect(process.env.DB_URI as string);

const connection = mongoose.connection;

connection.once("open", () => {
    console.log("Database MongoDB is connected");
});

connection.on("error", (err) => {
    console.log(err);
    process.exit(0);
});
