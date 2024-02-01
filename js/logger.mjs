//@ts-check
import * as fs from 'fs'
import Time from 'timelex'
import path from 'path'

export default class Logger{

    static #logFolder = path.normalize(process.cwd()).replace(/\\/g, '/')+'/log'
    static #isInit = false
    static isDebug = true

    static get isInit(){
        return Logger.#isInit
    }
    
    static init(pathLogFolder){
        try{
            if (!fs.existsSync(pathLogFolder))
                fs.mkdirSync(pathLogFolder, { recursive: true })
            if (fs.lstatSync(pathLogFolder).isDirectory()){
                Logger.#logFolder = pathLogFolder
                Logger.#isInit = true
                return true
            }else{
                throw new Error('Указанный путь не является каталогом, инициализация не удалась!')
            } 
        }catch(err){
            console.error(err)
            return false
        }
    }

    /**
     * Базовый метод вывода для логера
     * @param {string} name 
     * @param {string|Error} text 
     * @param {any} obj 
     * @param {string} color 
     * @returns 
     */
    static #baseDebug(name,text,obj=null,color, messageName){
        return new Promise((resolve,reject)=>{
            try{
                let time = new Time()
                let t = time.format('${H:m:S}')
                let message = `[PID - ${process.pid}] ${name}:\n${messageName} - ${t}\n------------------------------MESSAGE------------------------------\n` 

                if(text instanceof Error)
                    message +=`ERROR NAME: ${text.name}\n----------------------------STACK-TRACE----------------------------\n${text.stack}`
                else
                    message += text
                message += '\n------------------------------OBJECT-------------------------------\n'
                try {
                    message += (obj && obj != null ? JSON.stringify(obj,null,'    ') : 'NO OBJECT')
                } catch (err) {
                    message = (obj && obj != null ? obj.toString() : 'NO OBJECT')+'\n\n'
                }
                if (Logger.isDebug)
                    console.log(color, message)
                if (Logger.#logFolder == '' || !Logger.#isInit)
                    return resolve(false)
                let fileName = `log-${time.format('${D.M.Y}')}.txt`
                let logFilePath = path.join(Logger.#logFolder, `/${fileName}`).replace(/\\/g, '/')
                if (!fs.existsSync(logFilePath)) {
                    fs.writeFile(logFilePath, message, (err) => {
                        if (err != null) reject(err)
                        resolve(true)
                    })
                } else {
                    fs.appendFile(logFilePath, message, (err) => {
                        if (err != null) reject(err)
                        resolve(true)
                    })
                } 
            }catch(err){
                console.error(err)
                resolve(false)
            }
        })
    }

    /**
     * Метод для вывода сообщения в файл и консоль (при условии что Loger.isDebug = true)
     * @param {string} name 
     * Имя модуля или приложения откуда вызывается logger
     * @param {string} text 
     * Текст сообщения
     * @param {any} obj 
     * Объект данных (необязательно)
     * @returns 
     */
    static debug(name,text,obj=null){
        return this.#baseDebug(name,text,obj,'\x1b[36m%s\x1b[0m', 'DEBUG')
    }

    /**
     * Метод для вывода сообщения в файл и консоль (жёлтый цвет) (при условии что Logger.isDebug = true)
     * @param {string} name 
     * Имя модуля или приложения откуда вызывается logger
     * @param {string} text 
     * Текст сообщения
     * @param {any} obj 
     * Объект данных (необязательно)
     * @returns 
     */
    static warning(name,text,obj=null,url=''){
        return this.#baseDebug(name,text,obj,'\x1b[33m%s\x1b[0m', 'WARNING')
    }

    /**
     * Метод для вывода сообщения в файл и консоль (зелёный цвет) (при условии что Logger.isDebug = true)
     * @param {string} name 
     * Имя модуля или приложения откуда вызывается logger
     * @param {string} text 
     * Текст сообщения
     * @param {any} obj 
     * Объект данных (необязательно)
     * @returns 
     */
    static success(name,text,obj=null){
        return this.#baseDebug(name,text,obj,'\x1b[32m%s\x1b[0m', 'SUCCESS')
    }

    /**
     * Метод для вывода ошибки в файл и консоль (при условии что Logger.isDebug = true)
     * @param {string} name 
     * Название (функции, модуля, и др. информация) откуда вызывается logger
     * @param {Error} err 
     * Объект класса Error
     * @param {any} obj 
     * Объект данных (необязательно)
     * @returns 
     */
    static error(name,err,obj=null){
        return this.#baseDebug(name,err,obj,'\x1b[31m%s\x1b[0m', 'ERROR')
    }
}