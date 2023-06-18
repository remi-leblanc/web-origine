import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm"
import { Company } from "./Company"

@Entity()
export class Address {

	@PrimaryGeneratedColumn()
	id: number

	@Column("int", { nullable: true })
	number: number

	@Column("varchar", { length: 255, nullable: true })
	streetType: string

	@Column("varchar", { length: 255 })
	streetName: string

	@Column("varchar", { length: 255 })
	city: string

	@Column("varchar", { length: 5 })
	postalCode: string

	@Column("varchar", { length: 2 })
	regionCode: string

	@Column("datetime")
	createdAt: Date

	@ManyToMany(() => Company, (company) => company.addresses)
	companies: Company[]

}
