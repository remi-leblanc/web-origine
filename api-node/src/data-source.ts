import "reflect-metadata"
import { DataSource } from "typeorm"
import { Address } from "./entity/Address"
import { Company } from "./entity/Company"
import { Person } from "./entity/Person"
import { Token } from "./entity/Token"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "remileblanc.fr",
    port: 3306,
    username: "cxtr8005_remi",
    password: "[eGX,{CZNxdA",
    database: "cxtr8005_web-origine",
    synchronize: true,
    entities: [__dirname + '/entity/*.ts'],
})

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })