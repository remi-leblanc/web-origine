import * as express from "express"
import "reflect-metadata"
import { tokengen } from './middleware/tokengen'
import apiRouter from './routes/api'
import * as bodyParser from 'body-parser'
import 'dotenv/config'

const app = express()
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(tokengen)

app.use('/api', apiRouter)

const server = app.listen(3000)