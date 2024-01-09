//@ts-check
import * as fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import Logger from './logger.mjs'
import url from 'url'

export default class CssCompiler{

    static #units = {
        PX:'px',
        PT:'pt',
        PC:'pc',
        CM:'cm',
        MM:'mm',
        Q:'Q',
        IN:'in',
        EM:'em',
        EX:'ex',
        REM:'rem',
        CH:'ch',
        LH:'lh',
        RLH:'rlh',
        VW:'vw',
        VH:'vh',
        VMN:'vmin',
        VMX:'vmax',
        VI:'vi',
        VB:'vb',
        SVW:'svw',
        SVH:'svh',
        LVW:'lvw',
        LVH:'lvh',
        DVW:'dvw',
        DVH:'dvh',
        PR:'%',
        NULL:null
    }

    static #standartListClasses = {
        d: { prop: 'display', unit:null, priority:1, isSetUnit:false },
        fxw: { prop: 'flex-wrap', unit:null, priority:2, isSetUnit:false },
        fd: { prop: 'flex-direction', unit:null, priority:3, isSetUnit:false },
        ai: { prop: 'align-items', unit:null, priority:4, isSetUnit:false },
        as: { prop: 'align-self', unit:null, priority:5, isSetUnit:false },
        jc: { prop: 'justify-content', unit:null, priority:6, isSetUnit:false },
        ajc: { prop:['align-items', 'justify-content'], unit:null, priority:7, isSetUnit:false},
        ["flex-grow"]: { prop: 'flex-grow', unit: '%', priority:8, isSetUnit:true, precision:0 },
        ["flex-shrink"]: { prop: 'flex-shrink', unit: '%', priority:9, isSetUnit:true, precision:0 },
        ["flex-basis"]: { prop: 'flex-basis', unit: '%', priority:10, isSetUnit:true, precision:0 },
        flex: { prop: 'flex', unit:null, priority:11, isSetUnit:true, precision:0 },
        order: { prop: 'order', unit:null, priority:12, isSetUnit:false },
        pos: { prop:'position', unit: null, priority:13, isSetUnit:false },
        ov: { prop:'overflow', unit:null, priority:14, isSetUnit:false },
        ovx: { prop:'overflow-x', unit:null, priority:15, isSetUnit:false },
        ovy: { prop:'overflow-y', unit:null, priority:16, isSetUnit:false },
        bst: { prop: 'border-top-style', unit:null, priority:17, isSetUnit:false },
        bsr: { prop: 'border-right-style', unit:null, priority:18, isSetUnit:false },
        bsb: { prop: 'border-bottom-style', unit:null, priority:19, isSetUnit:false },
        bsl: { prop: 'border-left-style', unit:null, priority:20, isSetUnit:false },
        bsh: { prop: ['border-left-style', 'border-right-style'], unit:null, priority:21, isSetUnit:false },
        bsv: { prop: ['border-top-style', 'border-bottom-style'], unit:null, priority:22, isSetUnit:false },
        bs: { prop: 'border-style', unit:null, priority:23, isSetUnit:false },
        bwt: { prop: 'border-top-width', unit:'px', priority:24, isSetUnit:true, precision:0 },
        bwr: { prop: 'border-right-width', unit:'px', priority:25, isSetUnit:true, precision:0 },
        bwb: { prop: 'border-bottom-width', unit:'px', priority:26, isSetUnit:true, precision:0 },
        bwl: { prop: 'border-left-width', unit:'px', priority:27, isSetUnit:true, precision:0 },
        bwh: { prop: ['border-left-width', 'border-right-width'], unit:'px', priority:28, isSetUnit:true, precision:0 },
        bwv: { prop: ['border-top-width', 'border-bottom-width'], unit:'px', priority:29, isSetUnit:true, precision:0 },
        bw: { prop: 'border-width', unit: 'px', priority:30, isSetUnit:true, precision:0 },
        bct: { prop: 'border-top-color', unit: 'color', priority:31, isSetUnit:false },
        bcl: { prop: 'border-left-color', unit: 'color', priority:32, isSetUnit:false },
        bcb: { prop: 'border-bottom-color', unit: 'color', priority:33, isSetUnit:false },
        bcr: { prop: 'border-right-color', unit: 'color', priority:34, isSetUnit:false },
        bch: { prop: ['border-left-color', 'border-right-color'], unit: 'color', priority:35, isSetUnit:false },
        bcv: { prop: ['border-top-color', 'border-bottom-color'], unit: 'color', priority:36, isSetUnit:false },
        bc: { prop: 'border-color', unit: 'color', priority:37, isSetUnit:false },
        brad: { prop: 'border-radius', unit: 'px', priority:38, isSetUnit:true, precision:0 },
        h: { prop: 'height', unit:'%', priority:39, isSetUnit:true, precision:0 },
        minh: { prop: 'min-height', unit:'%', priority:40, isSetUnit:true, precision:0 },
        maxh: { prop: 'max-height', unit:'%', priority:41, isSetUnit:true, precision:0 },
        w: { prop: 'max-height', unit:'%', priority:42, isSetUnit:true, precision:0 },
        minw: { prop: 'min-width', unit:'%', priority:43, isSetUnit:true, precision:0 },
        maxw: { prop: 'max-width', unit:'%', priority:44, isSetUnit:true, precision:0 },
        op: { prop: 'opacity', unit: null, priority:45, isSetUnit:false },
        ff: { prop: 'font-family', unit: null, priority:46, isSetUnit:false},
        fsz: { prop: 'font-size', unit: 'rem', priority:47, isSetUnit:true, precision:1 },
        fw: { prop: 'font-weight', unit: null, priority:48, isSetUnit:false },
        ta: { prop: 'text-align', unit: null, priority:49, isSetUnit:false },
        tt: { prop:'text-transform', unit:null, priority:50, isSetUnit:false },
        tdl: { prop: 'text-decoration-line', unit: null, priority:51, isSetUnit:false },
        tds: { prop: 'text-decoration-style', unit: null, priority:52, isSetUnit:false },
        ws: { prop:'white-space', unit: null, priority:53, isSetUnit:false },
        wb: { prop:'word-break', unit: null, priority:54, isSetUnit:false },
        lh: { prop: 'line-height', unit: null, priority:55, isSetUnit:true, precision:0 },
        m: { prop: 'margin', unit: 'rem', priority:56, isSetUnit:true },
        mh: { prop: ['margin-left', 'margin-right'], unit: 'rem', priority:57, isSetUnit:true, precision:1 },
        mv: { prop: ['margin-top', 'margin-bottom'], unit: 'rem', priority:58, isSetUnit:true, precision:1 },
        mt: { prop: 'margin-top', unit: 'rem', priority:59, isSetUnit:true, precision:1 },
        ml: { prop: 'margin-left', unit: 'rem', priority:60, isSetUnit:true, precision:1 },
        mb: { prop: 'margin-bottom', unit: 'rem', priority:61, isSetUnit:true, precision:1 },
        mr: { prop: 'margin-right', unit: 'rem', priority:62, isSetUnit:true, precision:1 },
        p: { prop: 'padding', unit: 'rem', priority:63, isSetUnit:true, precision:1 },
        ph: { prop: ['padding-left', 'padding-right'], unit: 'rem', priority:64, isSetUnit:true, precision:1 },
        pv: { prop: ['padding-top', 'padding-bottom'], unit: 'rem', priority:65, isSetUnit:true, precision:1 },
        pt: { prop: 'margin-top', unit: 'rem', priority:66, isSetUnit:true, precision:1 },
        pl: { prop: 'padding-left', unit: 'rem', priority:67, isSetUnit:true, precision:1 },
        pb: { prop: 'padding-bottom', unit: 'rem', priority:68, isSetUnit:true, precision:1 },
        pr: { prop: 'padding-right', unit: 'rem', priority:69, isSetUnit:true, precision:1 },
        t: { prop: 'top', unit:'rem', priority:70, isSetUnit:true, precision:1 },
        l: { prop: 'left', unit:'rem', priority:71, isSetUnit:true, precision:1 },
        b: { prop: 'bottom', unit:'rem', priority:72, isSetUnit:true, precision:1 },
        r: { prop: 'right', unit:'rem', priority:73, isSetUnit:true, precision:1 },
        z: { prop: 'z-index', unit: null, priority:74, isSetUnit:false } ,
        c: { prop: 'color', unit: 'color', priority:75, isSetUnit:false },
        bgc: { prop: 'background-color', unit: 'color', priority:76, isSetUnit:false },
    }

    static #listClasses = JSON.parse(JSON.stringify(this.#standartListClasses))


    static #standartConfig = {
        BUILD_PATH: path.normalize(process.cwd().split(/[\/\\]*node_modules/)[0]).replace(/\\/g, '/')+"/build/",
        HTML_PATHES:[
            path.normalize(process.cwd().split(/[\/\\]*node_modules/)[0]).replace(/\\/g, '/'),
        ],
        CSS_PATHES:[
            // { path:'string/path', priority:10 }
        ],
        IGNORE_PATHES:[
            
        ],
        SET_CLASSES: {
            // z: { rename:'z-index', unit:'em', priority:10 }
        },
        MERGE_SAME_SELECTORS: false
    }

    static #config

    static #projectPath = path.normalize(process.cwd().split(/[\/\\]*node_modules/)[0]).replace(/\\/g, '/')

    static #standartRegClasses = [
        /\s{1}(md|mdl|mdp)?-?(d)(-i)?(_[hfbdav]{1})?-(flex|block|grid|inline|inblock(:inline-block){0}|none|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(fxw)(-i)?(_[hfbdav]{1})?-(wrap|nowrap)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(fd)(-i)?(_[hfbdav]{1})?-(row|rowrs(:row-reverse){0}|col(:column){0}|colrs(column-reverse){0}|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(ai|as|ajc)(-i)?(_[hfbdav])?-(start(:flex-start){0}|center|end(:flex-end){0}|stretch|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(jc)(-i)?(_[hfbdav]{1})?-(start(:flex-start){0}|center|end(:flex-end){0}|stretch|bspace(:space-between){0}|aspace(:space-around){0}|espace(:space-evenly){0}|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(pos)(-i)?(_[hfbdav]{1})?-(static|absolute|relative|fixed|sticky|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(ov|ovy|ovx)(-i)?(_[hfbdav]{1})?-(visible|hidden|clip|scroll|auto|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(bst|bsr|bsb|bsl|bsh|bsv|bs)(-i)?(_[hfbdav]{1})?-(solid|dotted|dashed|none)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(fw)(-i)?(_[hfbdav]{1})?-(100|200|300|400|500|600|700|800|900)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(ta)(-i)?(_[hfbdav]{1})?-(left|center|right|justify)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(ff)(-i)?(_[hfbdav]{1})?-([\w\-]+|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(tt)(-i)?(_[hfbdav]{1})?-(upper(:uppercase){0}|lower(:lowercase){0}|cap(:capitalize){0}|none)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(tdl)(-i)?(_[hfbdav]{1})?-(under(:underline){0}|over(:overline){0}|linet(:line-through){0}|none)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(tds)(-i)?(_[hfbdav]{1})?-(solid|double|dotted|dashed|wavy)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(ws)(-i)?(_[hfbdav]{1})?-(normal|pre|pwrap(:pre-wrap){0}|bspace(:break-spaces){0}|nowrap|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(wb)(-i)?(_[hfbdav]{1})?-(normal|abreak(:break-all){0}|keep(:keep-all){0}|wbreak(:break-word){0}|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(flex|flex-basis|flex-grow|flex-shrink|order|h|minh|maxh|w|minw|maxw|bwt|bwr|bwb|bwl|bwh|bwv|bw|brad|op|fsz|lh)(-i)?(_[hfbdav]{1})?-(\d+(_\d+)?|auto|inherit|initial|unset|none)(px|pt|pc|cm|mm|q|in|em|rem|ex|ch|lh|rlh|vw|vw|vmn|vmx|vi|vb|svw|svh|lvw|lvh|dvw|dvh|pr)?\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(l|t|r|b|z|m|mh|mv|mt|mr|mb|ml|p|ph|pv|pt|pr|pb|pl)(-i)?(_[hfbdav]{1})?-(-?\d+(_\d+)?|auto|inherit|initial|unset|none)(px|pt|pc|cm|mm|q|in|em|rem|ex|ch|lh|rlh|vw|vw|vmn|vmx|vi|vb|svw|svh|lvw|lvh|dvw|dvh|pr)?\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(c|bgc|bct|bcl|bcb|bcr|bc|bch|bcv)(-i)?(_[hfbdav]{1})?-([a-f0-9]{6,8}|[a-z]+)\s{1}/g
    ]

    static #regClasses = [...this.#standartRegClasses]

    static #classPropsRegex = /class="([\w\s\-]+)"/g
    static #cssSelectorRegex = /([\w\s\-\*\+>\@\(\)\[\]\.,#:"=']+)\{([^\{\}]+)\}/g
    static #cssPropsRegex = /([\w\- ]+):([ \w\(\)\-\."'#%,]+);?/g
    static #mediaRegex = /(@media[^\{\}]+)\{(([\w\s\-\*\+>\@\(\)\[\]\.,#:"=']+)\{([^\{\}]+)\})+\s+\}/g
    static #isWatch=false
    static #cache = {}
    static #progressInterval

    static #mediaPrefixes={
        md: {
            media: '@media(max-width:1023px) and (max-height:1023px)',
            search:/@media\(\s*max-width:\s*1023px\s*\)\s*and\s*\(\s*max-height:\s*1023px\s*\)\s*\{(([\w\s\-\*\+>\@\(\)\[\]\.,#:"=']+)\{([^\{\}]+)\})+\s+\}/g
        },
        mdl: {
            media: '@media(max-width:1023px) and (max-height:1023px) and (orientation:landscape)',
            search:/@media\(\s*max-width:\s*1023px\s*\)\s*and\s*\(\s*max-height:\s*1023px\s*\)\s*and\s*\(\s*orientation:\s*landscape\s*\)\s*\{(([\w\s\-\*\+>\@\(\)\[\]\.,#:"=']+)\{([^\{\}]+)\})+\s+\}/g
        },
        mdp: {
            media: '@media(max-width:1023px) and (max-height:1023px) and (orientation:portrait)',
            search:/@media\(\s*max-width:\s*1023px\s*\)\s*and\s*\(\s*max-height:\s*1023px\s*\)\s*and\s*\(\s*orientation:\s*portrait\s*\)\s*\{(([\w\s\-\*\+>\@\(\)\[\]\.,#:"=']+)\{([^\{\}]+)\})+\s+\}/g
        },
    }
    
    static #pseudoClassesList = {
        h:':hover',
        f:':focus',
        b:':blur',
        d:':disabled',
        a:':active',
        v:':visited',
    }

    static #excludeValues = [
        'auto',
        'inherit',
        'initial',
        'unset',
        'none'
    ]

    /**
     * 
     * @param {string} html 
     */
    static #analyzeHttp(html){
        try{
            let matches = html.matchAll(this.#classPropsRegex)
            let allClasses = []
            if(matches){
                for(let match of matches){
                    allClasses = [...allClasses, ...match[1].split(/\s+/)]
                }
            }
            return allClasses
        }catch(err){
            Logger.error('CssCompiler.analyzeHttp()', err)
            return null
        }
    }

    static #getFiles(pathStr, ext){
        try{
            let filePathes=[]
            pathStr = path.isAbsolute(pathStr) ? pathStr : path.join(this.#projectPath, pathStr).replace(/\\/g, '/')
            const stat = fs.statSync(pathStr)
            let pathes = stat.isDirectory() ? fs.readdirSync(pathStr,{recursive:true,encoding:'utf-8'}) : [pathStr]
            let ignorePathes = this.#config?.IGNORE_PATHES?.length && Array.isArray(this.#config?.IGNORE_PATHES) ? this.#config.IGNORE_PATHES : []
            const buildPath = path.isAbsolute(this.#config.BUILD_PATH) ? this.#config.BUILD_PATH : path.join(this.#projectPath, this.#config.BUILD_PATH).replace(/\\/g, '/')
            const dir = /\.\w+$/.test(buildPath) ? path.dirname(buildPath) : buildPath
            ignorePathes.push(dir)
            if(ignorePathes.length)
                ignorePathes = ignorePathes.map(p => {
                                                    const ignorePath = path.isAbsolute(p) ? p : path.join(this.#projectPath, p).replace(/\\/g, '/')
                                                    return new RegExp('^'+(ignorePath.replace(/[\/\\]+/g,'[\\/\\\\]+')))
                                                })
            pathes = pathes.filter(p => !(/node_modules/.test(p)))
            for(let p of pathes){
                if(path.extname(p) == ext){
                    const filePath = path.isAbsolute(p) ? p : path.join(this.#projectPath, p).replace(/\\/g, '/')
                    if(ignorePathes.length){
                        let isIgnore = false
                        for(let reg of ignorePathes){
                            if(reg.test(filePath)){
                                isIgnore = true
                                break
                            }
                        }
                        if(!isIgnore)
                            filePathes.push(filePath)
                    }else{
                        filePathes.push(filePath)
                    }
                }
            }
            return filePathes
        }catch(err){
            Logger.error('CssCompiler.getHtmlFiles()', err)
            return null
        }
    }

    static async #loading(start=true){
        let loadChars = '\|/—'
        let index = 0
        if(start){
            this.#progressInterval = setInterval(()=>{
                process.stdout.cursorTo(0);
                process.stdout.write(`...Building ${loadChars[index++]}`);
                index = index>=loadChars.length ? 0 : index
            },200)
        }else{
            process.stdout.clearLine(0);
            clearInterval(this.#progressInterval)
        }
    }
     
    static async buildCSS(){
        try{
            Logger.init(path.join(this.#projectPath, '/fcss-log').replace(/\\/g, '/'))
            this.#loading()
            if(!(await this.#load()))
                throw new Error('Не удалось инициализировать CssCompiler')
            let htmlPathes = this.#config?.HTML_PATHES?.length
                ? this.#config?.HTML_PATHES
                : [process.cwd()]
            let allHtmlFiles = [], allCssFiles = []
            for (let htmlPath of htmlPathes) {
                const filePathes = this.#getFiles(htmlPath, '.html')
                if (filePathes === null)
                    continue
                allHtmlFiles = [...allHtmlFiles, ...filePathes]
            }
            if (!allHtmlFiles.length) {
                Logger.debug('CssCompiler.buildCSS()', 'Не найдено HTML файлов, файл css не будет создан')
                return false
            }

            let allClasses = []
            for (let file of allHtmlFiles) {
                try {
                    let data = fs.readFileSync(file, { encoding: 'utf-8' })
                    let result = this.#analyzeHttp(data)
                    if (result != null)
                        allClasses = [...allClasses, ...result]
                } catch (err) {
                    Logger.error(`CssCompiler.buildCSS(): readFile[${file}]`, err)
                    continue
                }
            }
            allClasses = allClasses.filter((cls, index) => allClasses.indexOf(cls) == index)
            let strClasses = ` ${allClasses.join('  ')} `
            const regReplacedValues = /([\w\-]+)\(:([\w\-]+)\)/g
            let matches = [], arrReplacedValues = []
            if (allClasses.length)
                for (let reg of this.#regClasses) {
                    matches = [...matches, ...Array.from(strClasses.matchAll(reg))]
                    arrReplacedValues = [...arrReplacedValues, ...Array.from(reg.toString().matchAll(regReplacedValues)).map(m => [m[1], m[2]])]
                }
            const replacedValues = Object.fromEntries(arrReplacedValues)
            const keysRValues = Object.keys(replacedValues)

            let classes = { standart: new Array(), media: new Array() }
            for (let key in this.#mediaPrefixes)
                classes[key] = []
            if (matches.length) {
                matches.sort((aMatch, bMatch) => (this.#listClasses[aMatch[2]].priority + (aMatch[4] != '' ? 0.5 : 0)) - (this.#listClasses[bMatch[2]].priority + (bMatch[4] != '' ? 0.5 : 0)))
                const unitKeys = Object.keys(this.#units).map(unit => unit.toLowerCase())
                for (let match of matches) {
                    let cls = match[2]
                    if (this.#listClasses?.[cls]) {
                        const p = this.#listClasses[cls]
                        let value, important = /^-i$/.test(match[3]) ? ' !important' : ''
                        if (p.unit == 'color')
                            value = /^[a-f0-9]{6,8}$/.test(match[5]) ? `#${match[5]}` : match[5]
                        else if (p.unit == null)
                            value = keysRValues.includes(match[5]) ? replacedValues[match[5]] : match[5]
                        else {
                            const unit = match?.[7] && unitKeys.includes(match[7]) ? this.#units[match[7].toUpperCase()] : p.unit
                            if (this.#excludeValues.includes(match[5])) {
                                value = match[5]
                            } else {
                                if (/_/.test(match[5]))
                                    value = `${match[5].replace('_', '.')}${unit}`
                                else if (p?.precision) {
                                    value = match[5].padStart(p.precision + 1, '0').split('')
                                    value.splice(-p.precision, 0, '.')
                                    value = `${value.join('')}${unit}`
                                } else
                                    value = `${match[5]}${unit}`
                            }
                        }
                        const pseudoClass = match?.[4] ? this.#pseudoClassesList[match[4].replace(/_/g, '')] : ''
                        let cssClass = `.${match[0].replace(/\s+/g, '')}${pseudoClass}{\n`
                        for (let prop of Array.isArray(p.prop) ? p.prop : [p.prop]) {
                            cssClass += `\t${prop}:${value}${important};\n`
                        }
                        cssClass += `}\n\n`

                        if (match[1] && this.#mediaPrefixes?.[match[1]]) {
                            if (!Array.isArray(classes?.[match[1]]))
                                classes[match[1]] = []
                            classes[match[1]].push(cssClass)
                        } else {
                            classes.standart.push(cssClass)
                        }
                    }
                }
            }
           
            let resultCSS=''
            if(this.#config?.CSS_PATHES?.length){
                let standartCssPath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../css/template.css')
                resultCSS = fs.readFileSync(standartCssPath, { encoding: 'utf-8' })
                
                const cssPathes = this.#config.CSS_PATHES
                let allCssFilesObj = []
                for (let cssPath of cssPathes) {
                    const filePathes = this.#getFiles(typeof cssPath ==='object' && cssPath?.path && cssPath?.priority ? cssPath.path : cssPath, '.css')
                    if (filePathes === null)
                        continue
                    const objPathes = {
                        pathes:filePathes,
                        priority: cssPath.priority ?? 0 
                    }
                    allCssFilesObj.push(objPathes)
                }
                if (allCssFilesObj.length) {
                    standartCssPath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../css/standart.css')
                    let allCss = fs.readFileSync(standartCssPath, { encoding: 'utf-8' })
                    for (let key in classes) {
                        let reg = new RegExp(`---${key}---`)
                        allCss = allCss.replace(reg, classes[key].join(''))
                    }
                    for (let key in classes)
                        classes[key] = []
                    
                    allCssFilesObj.sort((a,b)=>a.priority - b.priority).forEach(value=>allCssFiles = [...allCssFiles, ...value.pathes])
                    for (let file of allCssFiles) {
                        try {
                            allCss += fs.readFileSync(file, { encoding: 'utf-8' })+'\n\n'
                        } catch (err) {
                            Logger.error(`CssCompiler.buildCSS(): readFile[${file}]`, err)
                            continue
                        }
                    }

                    for(let key in this.#mediaPrefixes){
                        matches = Array.from(allCss.matchAll(this.#mediaPrefixes[key].search))
                        for(let match of matches){
                            let onlyMediaSelectors = Array.from(match[0].matchAll(this.#cssSelectorRegex))
                            classes[key] = [...classes[key], ...onlyMediaSelectors.map(m=>m[0])]
                        }
                        if(this.#config.MERGE_SAME_SELECTORS){
                            const mediaSelectors = this.#mergeSameSelectors(classes[key].join(''), 1)
                            classes[key] = [mediaSelectors]
                        }
                        allCss = allCss.replace(this.#mediaPrefixes[key].search,'')
                    }
                  
                    matches = Array.from(allCss.matchAll(this.#mediaRegex))
                
                    if(this.#config.MERGE_SAME_SELECTORS){
                        for (let match of matches) {
                            const mergeSelectors = `${match[1]}{\n${this.#mergeSameSelectors(Array.from(match[0].matchAll(this.#cssSelectorRegex)).map(m=>m[0]).join(''), 1)}}\n`
                            classes.media.push(mergeSelectors)
                        }
                    }else{
                        classes.media = [...classes.media, ...matches.map(m=>m[0])]
                    }

                    allCss = allCss.replace(this.#mediaRegex,'')
                   
                    matches = Array.from(allCss.matchAll(this.#cssSelectorRegex))
                    if(this.#config.MERGE_SAME_SELECTORS){
                        const mergeSelectors = this.#mergeSameSelectors(matches.map(m=>m[0]).join(''))
                        classes.standart.push(mergeSelectors)
                    }else{
                        classes.standart = [...classes.standart, ...matches.map(m=>m[0])]
                    }
                }
            }else{
                let standartCssPath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../css/standart.css')
                resultCSS = fs.readFileSync(standartCssPath, { encoding: 'utf-8' })
            }
            
            for (let key in classes) {
                let reg = new RegExp(`---${key}---`)
                resultCSS = resultCSS.replace(reg, classes[key].join(''))
            }
            resultCSS = resultCSS.replace(/---\w+---/g, '').replace(/[\n\r\v\f]+/g,'\n').replace(/[\n\r\v\f]+\s*[\n\r\v\f]+/g, '\n')
            let buildPath = path.isAbsolute(this.#config.BUILD_PATH) ? this.#config.BUILD_PATH : path.join(this.#projectPath, this.#config.BUILD_PATH).replace(/\\/g, '/')
            let dir = /\.\w+$/.test(buildPath) ? path.dirname(buildPath) : buildPath
            if(!fs.existsSync(dir))
                fs.mkdirSync(dir,{recursive:true})
            buildPath = /\.css$/.test(buildPath) 
                ? buildPath 
                : (/\.\w+$/.test(buildPath) 
                    ? path.join(path.dirname(buildPath),'./app.css').replace(/\\/g, '/')
                    : path.join(buildPath,'./app.css').replace(/\\/g, '/'))
            fs.writeFileSync( buildPath, resultCSS, {encoding:'utf8'} )
            if(process.argv[1] == 'watch' && !this.#isWatch){
                this.#runWatchFileChanges([...allCssFiles, ...allHtmlFiles, `${this.#projectPath}/cssj.config.json`])
                this.#isWatch = true
            }
            this.#loading(false)
            if(Logger.isDebug)
                Logger.success('CssCompiler.buildCSS','BUILD SUCCESS!')
            return true
        }catch(err){
            Logger.error('CssCompiler.buildCSS()', err)
            this.#loading(false)
            return false
        }
    }

    /**
     * 
     * @param {string} selectorsStr
     * @param {number} addTab
     */
    static #mergeSameSelectors(selectorsStr, addTab=0){
        let addT = '\t'.repeat(addTab)
        let selectors = Array.from(selectorsStr.matchAll(this.#cssSelectorRegex))
        let iterableMatchSelectors = selectors.map(m=>{m[1] = m[1].replace(/\s+/g,''); return m})

        let duplicateSelectors = {}
        for (let selector of iterableMatchSelectors) {
            if (duplicateSelectors?.[selector[1]])
                duplicateSelectors[selector[1]].push(selector)
            else
                duplicateSelectors[selector[1]] = [selector]
        }

        let cleanCss = ''
        for(let key in duplicateSelectors){
            let newProps = {}
            let propsStr = duplicateSelectors[key].map(m=>m[2].replace(/[\r\n\t\v]+/g,' ')).join('\n')
            let props = Array.from(propsStr.matchAll(this.#cssPropsRegex))
            for(let prop of props)
                newProps[prop[1].trim()] = prop[2].trim()
            propsStr=''
            for(let prop in newProps)
                propsStr+=`\r\n\t${addT}${prop}: ${newProps[prop]};`
            cleanCss += `${addT}${key}{${propsStr}\n${addT}}\n\n`
        } 
        return cleanCss
    }

    static #runWatchFileChanges(filePathes){
        try{
            for(let file of filePathes){
                fs.watch(file, {persistent:true, encoding:'utf-8'}, (event, filename)=>{
                    if(event == 'change'){
                        const keyFile = crypto.createHash('md5').update(file).digest('hex')
                        const stat = fs.statSync(file)
                        if(this.#cache?.[keyFile] && stat.mtimeMs-this.#cache?.[keyFile]?.mTime < 100)
                            return
                        else{
                            if(this.#cache?.[keyFile]){
                                this.#cache[keyFile].mTime = stat.mtimeMs
                            }else{
                                this.#cache[keyFile]={
                                    filePath:file,
                                    mTime: stat.mtimeMs
                                }
                            }   
                        }
                        this.buildCSS()
                    }
                })
            }
        }catch(err){
            Logger.error('CssCompiler.runWatchFileChanges()', err)
        }
    }

    /**
     * 
     * @param {string} cssClass 
     * @param {object} params 
     * @param {string|null} [params.unit] 
     * @param {number} [params.priority] 
     * @param {string} [params.rename] 
     */
    static #setClassProperty(cssClass, params){
        try{
            let result = false
            if (!this.#listClasses?.[cssClass])
                throw new Error('Указанный класс не существует')
            if(params?.unit){
                const allUnits = Object.values(this.#units)
                if ((typeof params.unit == 'string' || params.unit == null) && allUnits.includes(params.unit.toLowerCase()) && this.#listClasses[cssClass].isSetUnit){
                    this.#listClasses[cssClass].unit = params.unit == null ? params.unit : params.unit.toLowerCase()
                    result = true
                }
            }
            if(params?.priority && typeof params?.priority == 'number'){
                this.#listClasses[cssClass].priority = params.priority
                result = true
            }
            if(typeof params?.rename == 'string'){
                delete Object.assign(this.#listClasses, { [params.rename]: this.#listClasses[cssClass] })[cssClass]
                let reg = new RegExp(`(/)(.*\\(.*\\)\\?\\(.*)\\|(${cssClass})\\|(.*)(/)`)//проверить
                for (let i = 0; i < this.#regClasses.length; i++) {
                    if (reg.test(this.#regClasses[i].toString())) {
                        let oldReg = this.#regClasses[i].toString()
                        let newReg = new RegExp(oldReg.replace(reg, `$2${params.rename}$4`))
                        this.#regClasses[i] = newReg
                        break
                    }
                }
                result = true
            }
            return result
        }catch(err){
            Logger.error('CssCompiler.setClassProperty()',err)
            return false
        }
    }

    static async #load(){
        try{
            if (!fs.existsSync(`${this.#projectPath}/cssj.config.json`))
                throw new Error('Файл конфигурации отсутствует, для корректной работы выполните команду инициализации чтобы создать файл конфигурации')
            let data = fs.readFileSync(`${this.#projectPath}/cssj.config.json`,{encoding:'utf-8'})
            if(!data)
                throw new Error('Не удалось прочитать файл конфигурации!')
            let config = JSON.parse(data)
            this.#config = config
            if(this.#config?.SET_CLASSES){
                for(let cls in this.#config.SET_CLASSES){
                    this.#setClassProperty(cls, this.#config.SET_CLASSES[cls])
                }
            }
            return true
        }catch(err){
            Logger.error('CssCompiler.load()',err)
            return false
        }
    }   

    static init(){
        try{
            Logger.init(path.join(this.#projectPath, '/cssj-log').replace(/\\/g, '/'))
            if (fs.existsSync(this.#projectPath)) {
                if (!fs.existsSync(`${this.#projectPath}/cssj.config.json`)) {
                    fs.writeFile(`${this.#projectPath}/cssj.config.json`, JSON.stringify(this.#standartConfig, null, '\t'),(err)=>{
                        if(err)
                            Logger.error('CssCompiler.init()',err)
                        else
                            Logger.success('CssCompiler.init()','INIT SUCCESS!')
                    })
                } 
            }
            console.log('\x1b[34m%s\x1b[0m',
`             0000000000000000     0000000000000000     0000000000000000     0000000000000000
            0000000000000000     0000000000000000     0000000000000000     0000000000000000
           0000                 0000                 0000                             0000
          0000                 0000                 0000                             0000
         0000                 0000000000000000     0000000000000000                 0000
        0000                 0000000000000000     0000000000000000     0000        0000
       0000                             0000                 0000     0000        0000
      0000000000000000     0000000000000000     0000000000000000     0000000000000000
     0000000000000000     0000000000000000     0000000000000000     0000000000000000
                                                                                        `)
        }catch(err){
            Logger.error('CssCompiler.init()',err)
        }
    }
}


