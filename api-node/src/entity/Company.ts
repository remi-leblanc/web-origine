import { ifError } from "assert"
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm"
import { Address } from "./Address"
import { Person } from "./Person"

@Entity()
export class Company {

    @PrimaryGeneratedColumn()
    id: number

    @Column("varchar", { length: 9 })
    siren: number

	@Column("varchar", { length: 14, nullable: true })
	siret: string
	
	@Column("varchar", { length: 255, nullable: true })
	name: string

	@Column("varchar", { length: 2, nullable: true })
	country: string

	@Column("datetime")
	createdAt: Date

	@Column("datetime")
	updatedAt: Date

    @Column("varchar", { length: 255 })
    website: string

	@ManyToMany(() => Address, (address) => address.companies)
    @JoinTable()
	addresses: Address[]

	@ManyToMany(() => Person, (person) => person.companies)
    @JoinTable()
	owners: Person[]

}
