import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn } from "typeorm";

@Entity()
export class Image {
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column({ type: "text" })
    albumName!: string;

    @Column({ type: "text" })
    pictureURL!: string;

    @Column({ type: "text" })
    uploadedBy!: string;

    @Column("boolean", { default: true })
	isActive: boolean = true;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    createdAt!: Date;
}
