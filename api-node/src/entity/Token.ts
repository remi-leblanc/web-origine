import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Token {

    @PrimaryGeneratedColumn()
    id: number

    @Column("varchar", { length: 255 })
    name: string

	@Column("varchar", { length: 255 })
	headerKey: string

	@Column("varchar", { length: 255 })
	headerValue: string

    @Column("datetime")
    expiresAt: Date

	@Column("datetime")
    updatedAt: Date
}
