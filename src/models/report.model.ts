import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn } from "typeorm";

@Entity()
export class Report {
	@ObjectIdColumn()
	_id!: ObjectId;

	@Column({ type: "text" })
	title!: string;

	@Column({ type: "text" })
	workspaceName!: string;

	@Column({ type: "text" })
	content!: string;

	@Column({ type: "text" })
	studentName!: string;

	@Column({ type: "text" })
	studentEmail!: string;

	@Column({ type: "text" })
	referenceNumber!: string;

	@Column("boolean", { default: false })
	resolved: boolean = false;

	@CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
	createdAt!: Date;
}
