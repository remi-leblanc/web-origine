import "reflect-metadata"
import { DataSource } from "typeorm"
import { Address } from "./entity/Address"
import { Company } from "./entity/Company"
import { Person } from "./entity/Person"
import { Token } from "./entity/Token"
import 'dotenv/config'

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
    entities: [__dirname + '/entity/*.ts'],
	synchronize: true,
})

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })