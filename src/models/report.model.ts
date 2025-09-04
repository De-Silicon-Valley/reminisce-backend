import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Report {
	@ObjectIdColumn()
	_id!: ObjectId;

	@Column({ type: "text" })
	title!: string;

	@Column({ type: "text" })
	content!: string;

	@Column({ type: "text" })
	studentName!: string;

	@Column({ type: "text" })
	studentEmail!: string;

	@Column({ type: "text" })
	referenceNumber!: string;

	@ObjectIdColumn()
	departmentId!: ObjectId;

	@Column({ type: "text" })
	workspace!: string;

	@Column("boolean", { default: false })
	resolved: boolean = false;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
