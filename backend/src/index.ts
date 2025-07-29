import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { dataSource } from "./dataSource";
import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import reportRoutes from "./routes/report.routes";

dataSource
	.initialize()
	.then(() => {
		console.log("[+] Data Source initialized.");
		// console.log(process.env.DB_URL);
	})
	.catch((error) => {
		console.error("Error during Data Source initialization:\n", error);
	});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "src/public")));

app.use(authRoutes);
app.use("/student", studentRoutes);
app.use("/report", reportRoutes);

app.get("/", (req: Request, res: Response) => {
	res.send({
		msg: "Welcome to the digital phonebook!!",
	});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`---- App is listening on port ${PORT}`);
});
