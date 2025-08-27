import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn } from "typeorm";


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

    @Column({ 
        type: "date",
        default: () => "CURRENT_TIMESTAMP"
    })
    createdAt!: Date;

    @Column({ 
        type: "date",
        default: () => "CURRENT_TIMESTAMP"
    })
    updatedAt!: Date;
}
