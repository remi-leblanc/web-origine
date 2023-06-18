import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { TokenType } from "../enum/TokenType"

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

	@Column({type: "enum", enum: TokenType, default: TokenType.AUTH})
	type: TokenType

    @Column("datetime", {nullable: true})
    expiresAt: Date

	@Column("datetime")
    updatedAt: Date
}
