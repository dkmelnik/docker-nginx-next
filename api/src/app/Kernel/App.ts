import AppConfig from "../../config/AppConfig";
import ConnectDB from "../../database/ConnectDB";
import express from "express";
import { appConfig } from "../../config/types";
import {Express} from "express/ts4.0";
import TestController from "../Http/Controllers/TestController";
import bodyParser from "body-parser";

class App {
    protected appConfig: appConfig
    protected db: typeof import("mongoose")
    protected server: Express
    constructor() {
        this.appConfig = new AppConfig().getConfig()
        // запускам db, если успешно, запускаем сервер
        this.runDB()
            .then(() => this.run())
            .catch(e => console.log(e))
    }
    private async runDB(){
        if(typeof (this.appConfig.db) === "string"){
            this.db = await new ConnectDB(this.appConfig.db).run()
        }
    }
    private async run() {
        this.runServe()
        this.runRouter()
    }
    private runServe() {
        this.server = express()
        this.server.listen(this.appConfig.port, () => {
            console.log(`App is running at ${this.appConfig.host}:${this.appConfig.port}`);
        });
        this.server.use(bodyParser.json())
        // добавляем в глобальный объект req и res
        this.server.use((req, res, next) => {
            this.server.set('req', req)
            this.server.set('res', res)
            next();
        });
    }
    private runRouter(){
        this.server.post('/test', () => {
            new TestController(this.db, this.server).test()
        })
    }
}

export default App;