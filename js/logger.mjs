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
     * @param {string} text 
     * @param {any} obj 
     * @param {string} url 
     * @param {string} color 
     * @returns 
     */
    static #baseDebug(name,text,obj=null,url='',color, messageName){
        return new Promise((resolve,reject)=>{
            try{
                let textObj = ''
                try {
                    textObj = obj && obj != null ? JSON.stringify(obj) : ''
                } catch (err) {
                    textObj = obj && obj != null ? obj.toString() : ''
                }
                let time = new Time()
                let t = time.format('${H:m:S}')
                if (Logger.isDebug)
                    console.log(color, `[PID - ${process.pid}] ${name}:\n${messageName} - ${t}\n${(url != '' ? `URL: ${url}\n` : '')}-----------------------------------------------------------------\n${text != '' ? `${text}` : ''}${textObj != '' ? `\nOBJECT:\n${textObj}` : ''}\n`)
                if (Logger.#logFolder == '' || !Logger.#isInit)
                    return resolve(false)
                let fileName = `log-${time.format('${D.M.Y}')}.txt`
                let logFilePath = path.join(Logger.#logFolder, `/${fileName}`).replace(/\\/g, '/')
                if (!fs.existsSync(logFilePath)) {
                    fs.writeFile(logFilePath, `[PID - ${process.pid}] ${name}:\n${messageName} - ${t}\n${(url != '' ? `URL: ${url}\n` : '')}-----------------------------------------------------------------\n${text != '' ? `${text}` : ''}${textObj != '' ? `\nOBJECT:\n${textObj}` : ''}\n`, (err) => {
                        if (err != null) reject(err)
                        resolve(true)
                    })
                } else {
                    fs.appendFile(logFilePath, `[PID - ${process.pid}] ${name}:\n${messageName} - ${t}\n${(url != '' ? `URL: ${url}\n` : '')}-----------------------------------------------------------------\n${text != '' ? `${text}` : ''}${textObj != '' ? `\nOBJECT:\n${textObj}` : ''}\n`, (err) => {
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
     * @param {string} url 
     * Адрес входящего запроса (необязательно)
     * @returns 
     */
    static debug(name,text,obj=null,url=''){
        return this.#baseDebug(name,text,obj,url,'\x1b[36m%s\x1b[0m', 'DEBUG')
    }

    /**
     * Метод для вывода сообщения в файл и консоль (жёлтый цвет) (при условии что Logger.isDebug = true)
     * @param {string} name 
     * Имя модуля или приложения откуда вызывается logger
     * @param {string} text 
     * Текст сообщения
     * @param {any} obj 
     * Объект данных (необязательно)
     * @param {string} url 
     * Адрес входящего запроса (необязательно)
     * @returns 
     */
    static warning(name,text,obj=null,url=''){
        return this.#baseDebug(name,text,obj,url,'\x1b[33m%s\x1b[0m', 'WARNING')
    }

    /**
     * Метод для вывода сообщения в файл и консоль (зелёный цвет) (при условии что Logger.isDebug = true)
     * @param {string} name 
     * Имя модуля или приложения откуда вызывается logger
     * @param {string} text 
     * Текст сообщения
     * @param {any} obj 
     * Объект данных (необязательно)
     * @param {string} url 
     * Адрес входящего запроса (необязательно)
     * @returns 
     */
    static success(name,text,obj=null,url=''){
        return this.#baseDebug(name,text,obj,url,'\x1b[32m%s\x1b[0m', 'SUCCESS')
    }

    /**
     * Метод для вывода ошибки в файл и консоль (при условии что Logger.isDebug = true)
     * @param {string} name 
     * Название (функции, модуля, и др. информация) откуда вызывается logger
     * @param {Error} err 
     * Объект данных (необязательно)
     * @param {string} url 
     * Адрес входящего запроса (необязательно)
     * @returns 
     */
    static error(name,err,url=''){
        return new Promise((resolve,reject)=>{
            try{
                let time = new Time()
                let t = time.format('${H:m:S}')
                if (Logger.isDebug)
                    console.log('\x1b[31m%s\x1b[0m', `[PID - ${process.pid}] ${name}:\nERROR - ${t} (${err?.name ?? ''})\n${url != '' ? `, URL: ${url}\n` : ''}---------------------------STACK-TRACE---------------------------\n${err?.stack ?? ''}\n-----------------------------------------------------------------\n\n`)
                if (Logger.#logFolder == '' || !Logger.#isInit)
                    return resolve(false)
                let fileName = `log-${time.format('${D.M.Y}')}.txt`
                let logFilePath = path.join(Logger.#logFolder, `/${fileName}`).replace(/\\/g, '/')
                if (!fs.existsSync(logFilePath)) {
                    fs.writeFile(logFilePath, `[PID - ${process.pid}] ${name}:\nERROR - ${t} (${err?.name ?? ''})\n${url != '' ? `, URL: ${url}\n` : ''}---------------------------STACK-TRACE---------------------------\n${err?.stack ?? ''}\n--------------------------------------------------------------\n\n`, (err) => {
                        if (err != null) reject(err)
                        resolve(true)
                    })
                } else {
                    fs.appendFile(logFilePath, `[PID - ${process.pid}] ${name}:\nERROR - ${t} (${err?.name ?? ''})\n${url != '' ? `, URL: ${url}\n` : ''}---------------------------STACK-TRACE---------------------------\n${err?.stack ?? ''}\n--------------------------------------------------------------\n\n`, (err) => {
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
}

export class UrlError extends Error{
    constructor(message,url){
        super(message)
        this.url=url
    }
}