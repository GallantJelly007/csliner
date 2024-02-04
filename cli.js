#!/usr/bin/env node

import CssCompiler from './lib/compiler.mjs'
import Logger from './lib/logger.mjs'

if(process.argv[2]){
    switch(process.argv[2].toLowerCase()){
        case 'init': CssCompiler.init(); break;
        case 'build': CssCompiler.buildCSS(); break;
        case 'watch': CssCompiler.buildCSS(true); break;
        default: Logger.error('ERR CSLINER COMMAND', new Error(`Введенная команда - "${process.argv[2].toLowerCase()}", не найдена`)); break;
    }
}else{
    Logger.error('ERR CSLINER COMMAND', new Error('Отсутствует аргумент соответствующий CSLINER команде'))
}