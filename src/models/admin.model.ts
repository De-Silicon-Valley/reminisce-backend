import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Admin {
	@ObjectIdColumn()
	_id!: ObjectId;

	@Column({ type: "text", unique: true })
	username!: string;

	@Column({ type: "text" })
	password!: string;

	@ObjectIdColumn()
	departmentId!: ObjectId; // Links admin to department using department ObjectId

	@Column({ type: "text" })
	workspace!: string; // Department ID as string for consistent querying

	@Column("boolean", { default: true })
	isActive: boolean = true;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
