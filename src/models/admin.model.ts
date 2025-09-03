import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Admin {
	@ObjectIdColumn()
	_id!: ObjectId;

	@Column({ type: "text" })
	username!: string;

	@Column({ type: "text" })
	password!: string;

	@Column("boolean", { default: true })
	isActive: boolean = true;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
