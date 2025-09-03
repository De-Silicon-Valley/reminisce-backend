import { DataSource } from "typeorm";
import { Department } from "./models/department.model";
import { Student } from "./models/student.model";
import { Event } from "./models/events.model";
import { Album } from "./models/album.model";
import { Image } from "./models/image.model";

export const dataSource = new DataSource({
	type: "mongodb",
	url: process.env.DB_URL,
	// useUnifiedTopology: true,
	// useNewUrlParser: true,
	synchronize: true,
	logging: true,
	entities: [Department, Student, Event, Album, Image],
	// port: Number(process.env.DB_PORT),
	database: "Reminisce",
});
