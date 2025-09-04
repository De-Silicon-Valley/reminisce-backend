import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Image {
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column({ type: "text" })
    albumName!: string;

    @ObjectIdColumn()
    albumId!: ObjectId;

    @Column({ type: "text" })
    pictureURL!: string;

    @Column({ type: "text" })
    uploadedBy!: string;

    @Column({ type: "text" })
    referenceNumber!: string;

    @ObjectIdColumn()
    departmentId!: ObjectId;

    @Column({ type: "text" })
    workspace!: string;

    @Column("boolean", { default: true })
	isActive: boolean = true;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
