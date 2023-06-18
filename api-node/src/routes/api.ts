import * as express from "express"
import * as franceController from '../controller/franceController';

const apiRouter = express.Router()

apiRouter.post('/checkcompany/fr', franceController.companyCheck)

export default apiRouter