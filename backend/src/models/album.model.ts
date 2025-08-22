import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn } from "typeorm";

@Entity()
export class Album{
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column({ type: "text" })
    albumName!: string;

    @Column({ type: "text" })
    workspaceName!: string;

    @Column("boolean", { default: true })
    isActive: boolean = true;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    createdAt!: Date;
}
