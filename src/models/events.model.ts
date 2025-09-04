import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Event {
	@ObjectIdColumn()
	_id!: ObjectId;

    @Column({ type: "text" })
	title!: string;

	@Column({ type: "text" })
	description!: string;

    @Column({ type: "text" })
	venue!: string;

	@Column({ type: "date" })
    eventDate!: Date;

    @Column({ 
        type: "enum", 
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], 
        default: 'upcoming' 
    })
    status!: string;

    @Column({ type: "text" })
    createdBy!: string;

    @ObjectIdColumn()
    departmentId!: ObjectId;

    @Column({ type: "text" })
    workspace!: string;

	@CreateDateColumn()
    createdAt!: Date;

	@UpdateDateColumn()
    updatedAt!: Date;
}
