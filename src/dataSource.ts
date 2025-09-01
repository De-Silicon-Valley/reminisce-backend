import { DataSource } from "typeorm";
import path from "path";

export const dataSource = new DataSource({
	type: "mongodb",
	url: process.env.DB_URL,
	// useUnifiedTopology: true,
	// useNewUrlParser: true,
	synchronize: false,
	logging: true,
	entities: [path.join(__dirname, "models", "*.{ts,js}")],
	// port: Number(process.env.DB_PORT),
	database: "Reminisce",
});
