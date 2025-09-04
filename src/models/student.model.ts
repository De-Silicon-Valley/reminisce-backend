import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Student {
	@ObjectIdColumn()
	_id!: ObjectId;

	@Column({ type: "text" })
	name!: string;

	@Column({ type: "text" })
	nickname!: string;

	@Column({ type: "text" })
	image!: string;

	@Column({ type: "text" })
	referenceNumber!: string;

	@Column({ type: "text" })
	phoneNumber!: string;

	@Column({ type: "text" })
	quote!: string;

	@Column({ type: "text" })
	workspace!: string;

	@ObjectIdColumn()
	departmentId!: ObjectId;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
