import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm"
import { Company } from "./Company"

@Entity()
export class Person {

	@PrimaryGeneratedColumn()
	id: number

	@Column("varchar", { length: 255 })
	firstName: string

	@Column("varchar", { length: 255 })
	lastName: string

	@Column("datetime")
	createdAt: Date

	@Column("datetime")
	updatedAt: Date

    @ManyToMany(() => Company, (company) => company.addresses)
    companies: Company[]
}
