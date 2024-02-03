//@ts-check
import * as fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import Logger from './logger.mjs'
import url from 'url'
import child_process, { ChildProcess } from 'child_process'

export default class CssCompiler{

    static #units = {
        numeric:{
            PX:{unit:'px', precision:0},
            PT:{unit:'pt', precision:0},
            PC:{unit:'pc', precision:0},
            CM:{unit:'cm', precision:1},
            MM:{unit:'mm', precision:0},
            Q:{unit:'Q', precision:0},
            IN:{unit:'in', precision:0},
            EM:{unit:'em', precision:1},
            EX:{unit:'ex', precision:1},
            REM:{unit:'rem', precision:1},
            CH:{unit:'ch', precision:0},
            LH:{unit:'lh', precision:0},
            RLH:{unit:'rlh', precision:0},
            VW:{unit:'vw', precision:0},
            VH:{unit:'vh', precision:0},
            VMN:{unit:'vmin', precision:0},
            VMX:{unit:'vmax', precision:0},
            VI:{unit:'vi', precision:0},
            VB:{unit:'vb', precision:0},
            SVW:{unit:'svw', precision:0},
            SVH:{unit:'svh', precision:0},
            LVW:{unit:'lvw', precision:0},
            LVH:{unit:'lvh', precision:0},
            DVW:{unit:'dvw', precision:0},
            DVH:{unit:'dvh', precision:0},
            PR:{unit:'%', precision:0},
            NONE:{unit:'', precision:1},
        },
        nonNumeric:{
            NULL:{unit:null},
            COLOR:{unit:'color'}
        }
    }

    static #listClasses = {
        d: { prop: 'display', unit:this.#units.nonNumeric.NULL, priority:1, isSetUnit:false },
        fxw: { prop: 'flex-wrap', unit:this.#units.nonNumeric.NULL, priority:2, isSetUnit:false },
        fd: { prop: 'flex-direction', unit:this.#units.nonNumeric.NULL, priority:3, isSetUnit:false },
        ai: { prop: 'align-items', unit:this.#units.nonNumeric.NULL, priority:4, isSetUnit:false },
        as: { prop: 'align-self', unit:this.#units.nonNumeric.NULL, priority:5, isSetUnit:false },
        jc: { prop: 'justify-content', unit:this.#units.nonNumeric.NULL, priority:6, isSetUnit:false },
        ajc: { prop:['align-items', 'justify-content'], unit:this.#units.nonNumeric.NULL, priority:7, isSetUnit:false},
        basis: { prop: 'flex-basis', unit: this.#units.numeric.PR, priority:8, isSetUnit:true },
        grow: { prop: 'flex-grow', unit: this.#units.numeric.PR, priority:9, isSetUnit:true },
        shrink: { prop: 'flex-shrink', unit: this.#units.numeric.PR, priority:10, isSetUnit:true },
        flex: { prop: 'flex', unit:this.#units.nonNumeric.NULL, priority:11, isSetUnit:true },
        order: { prop: 'order', unit:this.#units.nonNumeric.NULL, priority:12, isSetUnit:false },
        pos: { prop:'position', unit: this.#units.nonNumeric.NULL, priority:13, isSetUnit:false },
        ov: { prop:'overflow', unit:this.#units.nonNumeric.NULL, priority:14, isSetUnit:false },
        ovx: { prop:'overflow-x', unit:this.#units.nonNumeric.NULL, priority:15, isSetUnit:false },
        ovy: { prop:'overflow-y', unit:this.#units.nonNumeric.NULL, priority:16, isSetUnit:false },
        bst: { prop: 'border-top-style', unit:this.#units.nonNumeric.NULL, priority:17, isSetUnit:false },
        bsr: { prop: 'border-right-style', unit:this.#units.nonNumeric.NULL, priority:18, isSetUnit:false },
        bsb: { prop: 'border-bottom-style', unit:this.#units.nonNumeric.NULL, priority:19, isSetUnit:false },
        bsl: { prop: 'border-left-style', unit:this.#units.nonNumeric.NULL, priority:20, isSetUnit:false },
        bsh: { prop: ['border-left-style', 'border-right-style'], unit:this.#units.nonNumeric.NULL, priority:21, isSetUnit:false },
        bsv: { prop: ['border-top-style', 'border-bottom-style'], unit:this.#units.nonNumeric.NULL, priority:22, isSetUnit:false },
        bs: { prop: 'border-style', unit:this.#units.nonNumeric.NULL, priority:23, isSetUnit:false },
        bwt: { prop: 'border-top-width', unit:this.#units.numeric.PX, priority:24, isSetUnit:true },
        bwr: { prop: 'border-right-width', unit:this.#units.numeric.PX, priority:25, isSetUnit:true },
        bwb: { prop: 'border-bottom-width', unit:this.#units.numeric.PX, priority:26, isSetUnit:true },
        bwl: { prop: 'border-left-width', unit:this.#units.numeric.PX, priority:27, isSetUnit:true },
        bwh: { prop: ['border-left-width', 'border-right-width'], unit:this.#units.numeric.PX, priority:28, isSetUnit:true},
        bwv: { prop: ['border-top-width', 'border-bottom-width'], unit:this.#units.numeric.PX, priority:29, isSetUnit:true},
        bw: { prop: 'border-width', unit: this.#units.numeric.PX, priority:30, isSetUnit:true},
        bct: { prop: 'border-top-color', unit: this.#units.nonNumeric.COLOR, priority:31, isSetUnit:false },
        bcr: { prop: 'border-right-color', unit: this.#units.nonNumeric.COLOR, priority:32, isSetUnit:false },
        bcb: { prop: 'border-bottom-color', unit: this.#units.nonNumeric.COLOR, priority:33, isSetUnit:false },
        bcl: { prop: 'border-left-color', unit: this.#units.nonNumeric.COLOR, priority:34, isSetUnit:false },
        bch: { prop: ['border-left-color', 'border-right-color'], unit: this.#units.nonNumeric.COLOR, priority:35, isSetUnit:false },
        bcv: { prop: ['border-top-color', 'border-bottom-color'], unit: this.#units.nonNumeric.COLOR, priority:36, isSetUnit:false },
        bc: { prop: 'border-color', unit: this.#units.nonNumeric.COLOR, priority:37, isSetUnit:false },
        brad: { prop: 'border-radius', unit: this.#units.numeric.REM, priority:38, isSetUnit:true},
        bradtl: { prop: 'border-top-left-radius', unit: this.#units.numeric.REM, priority:39, isSetUnit:true},
        bradtr: { prop: 'border-top-right-radius', unit: this.#units.numeric.REM, priority:40, isSetUnit:true},
        bradbr: { prop: 'border-bottom-right-radius', unit: this.#units.numeric.REM, priority:41, isSetUnit:true},
        bradbl: { prop: 'border-bottom-left-radius', unit: this.#units.numeric.REM, priority:42, isSetUnit:true},
        h: { prop: 'height', unit:this.#units.numeric.PR, priority:43, isSetUnit:true},
        minh: { prop: 'min-height', unit:this.#units.numeric.PR, priority:44, isSetUnit:true},
        maxh: { prop: 'max-height', unit:this.#units.numeric.PR, priority:45, isSetUnit:true},
        w: { prop: 'max-height', unit:this.#units.numeric.PR, priority:46, isSetUnit:true},
        minw: { prop: 'min-width', unit:this.#units.numeric.PR, priority:47, isSetUnit:true},
        maxw: { prop: 'max-width', unit:this.#units.numeric.PR, priority:48, isSetUnit:true},
        op: { prop: 'opacity', unit: this.#units.numeric.NONE, priority:49, isSetUnit:false},
        ff: { prop: 'font-family', unit: this.#units.nonNumeric.NULL, priority:50, isSetUnit:false},
        fsz: { prop: 'font-size', unit: this.#units.numeric.REM, priority:51, isSetUnit:true},
        fw: { prop: 'font-weight', unit: this.#units.nonNumeric.NULL, priority:52, isSetUnit:false },
        ta: { prop: 'text-align', unit: this.#units.nonNumeric.NULL, priority:53, isSetUnit:false },
        tt: { prop:'text-transform', unit:this.#units.nonNumeric.NULL, priority:54, isSetUnit:false },
        tdl: { prop: 'text-decoration-line', unit: this.#units.nonNumeric.NULL, priority:55, isSetUnit:false },
        tds: { prop: 'text-decoration-style', unit: this.#units.nonNumeric.NULL, priority:56, isSetUnit:false },
        ws: { prop:'white-space', unit: this.#units.nonNumeric.NULL, priority:57, isSetUnit:false },
        wb: { prop:'word-break', unit: this.#units.nonNumeric.NULL, priority:58, isSetUnit:false },
        lh: { prop: 'line-height', unit: this.#units.numeric.NONE, priority:59, precision:0, isSetUnit:true},
        m: { prop: 'margin', unit: this.#units.numeric.REM, priority:60, isSetUnit:true},
        mh: { prop: ['margin-left', 'margin-right'], unit: this.#units.numeric.REM, priority:61, isSetUnit:true },
        mv: { prop: ['margin-top', 'margin-bottom'], unit: this.#units.numeric.REM, priority:62, isSetUnit:true },
        mt: { prop: 'margin-top', unit: this.#units.numeric.REM, priority:63, isSetUnit:true },
        ml: { prop: 'margin-left', unit: this.#units.numeric.REM, priority:64, isSetUnit:true },
        mb: { prop: 'margin-bottom', unit: this.#units.numeric.REM, priority:65, isSetUnit:true },
        mr: { prop: 'margin-right', unit: this.#units.numeric.REM, priority:66, isSetUnit:true },
        p: { prop: 'padding', unit: this.#units.numeric.REM, priority:67, isSetUnit:true },
        ph: { prop: ['padding-left', 'padding-right'], unit: this.#units.numeric.REM, priority:68, isSetUnit:true },
        pv: { prop: ['padding-top', 'padding-bottom'], unit: this.#units.numeric.REM, priority:69, isSetUnit:true },
        pt: { prop: 'padding-top', unit: this.#units.numeric.REM, priority:70, isSetUnit:true },
        pl: { prop: 'padding-left', unit: this.#units.numeric.REM, priority:71, isSetUnit:true },
        pb: { prop: 'padding-bottom', unit: this.#units.numeric.REM, priority:72, isSetUnit:true },
        pr: { prop: 'padding-right', unit: this.#units.numeric.REM, priority:73, isSetUnit:true },
        t: { prop: 'top', unit: this.#units.numeric.REM, priority:74, isSetUnit:true },
        l: { prop: 'left', unit:this.#units.numeric.REM, priority:75, isSetUnit:true },
        b: { prop: 'bottom', unit:this.#units.numeric.REM, priority:76, isSetUnit:true },
        r: { prop: 'right', unit:this.#units.numeric.REM, priority:77, isSetUnit:true },
        z: { prop: 'z-index', unit: this.#units.numeric.NONE, priority:78, isSetUnit:false } ,
        c: { prop: 'color', unit: this.#units.nonNumeric.COLOR, priority:79, isSetUnit:false },
        bgc: { prop: 'background-color', unit: this.#units.nonNumeric.COLOR, priority:80, isSetUnit:false },
    }

    static #atRulesList=[
        {name:'@namespace', priority:-11, compare:'all'},
        {name:'@import', priority:-10, compare:'all'},
        {name:'@charset', priority:-9, compare:'all'},
        {name:'@font-face', priority:-8, compare:/src:([ \w\(\)\-\.\\\/"'#%,]+);?/, replace:true},
        {name:'@font-feature-values',priority:-7},
        {name:'@character-variant', priority:-7, parent:'@font-feature-values'},
        {name:'@styleset', priority:-7, parent:'@font-feature-values'},
        {name:'@stylistic', priority:-7, parent:'@font-feature-values'},
        {name:'@ornaments', priority:-7, parent:'@font-feature-values'},
        {name:'@annotation', priority:-7, parent:'@font-feature-values'},
        {name:'@swash', priority:-7, parent:'@font-feature-values'},
        {name:'@font-palette-values', priority:-6},
        {name:'@page', priority:-5},
        {name:'@color-profile', priority:-4},
        {name:'@container', priority:-3},
        {name:'@property', priority:-2},
        {name:'@starting-style',priority:-1},
        {name:'@keyframes', priority:1, replace:true},
        {name:'@counter-style', priority:2},
        {name:'@supports', priority:3},
        {name:'@scope', priority:4},
        {name:'@layer', priority:5},
        {name:'@media', priority:6}
    ]
   
    static #atRulesCompare=[
        { 
            type:String, 
            value:new String('all'), 
            callback:(rule, originalCss, compare)=>originalCss.replace(/\s+/g, '')
        },
        { 
            type:RegExp,
            callback:(rule, originalCss, compare)=>{
                let matches = originalCss.match(compare)
                let result = ''
                if(matches.length>1){
                    for(let i = 1; i < matches.length; i++)
                        result+=matches[i].replace(/\s+/,'')
                }
                return rule.replace(/\s+/,'')+result
            } 
        }
    ]

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
        SET_UNITS_PRECISION:{
            // px:1
        },
        MERGE_SAME_SELECTORS: false,
    }

    static #config

    static #projectPath = path.normalize(process.cwd().split(/[\/\\]*node_modules/)[0]).replace(/\\/g, '/')
    static #modulePath = path.dirname(url.fileURLToPath(import.meta.url))

    static #regClasses = [
        /\s{1}(md|mdl|mdp)?-?(d)(-i)?pseudo-(flex|inflex(:inline-flex){0}|block|inblock(:inline-block){0}|grid|ingrid(:inline-grid){0}|table|rtable(:table-row){0}|inline|none|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(fxw)(-i)?pseudo-(wrap|nowrap)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(fd)(-i)?pseudo-(row|row-rs(:row-reverse){0}|col(:column){0}|col-rs(column-reverse){0}|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(ai|as|ajc)(-i)?(_{1,2}[hfbdav])?-(start(:flex-start){0}|center|end(:flex-end){0}|stretch|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(jc)(-i)?pseudo-(start(:flex-start){0}|center|end(:flex-end){0}|stretch|bspace(:space-between){0}|aspace(:space-around){0}|espace(:space-evenly){0}|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(pos)(-i)?pseudo-(static|absolute|relative|fixed|sticky|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(ov|ovy|ovx)(-i)?pseudo-(visible|hidden|clip|scroll|auto|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(bst|bsr|bsb|bsl|bsh|bsv|bs)(-i)?pseudo-(solid|dotted|dashed|none)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(fw)(-i)?pseudo-(100|200|300|400|500|600|700|800|900)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(ta)(-i)?pseudo-(left|center|right|justify)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(ff)(-i)?pseudo-([\w\-]+|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(tt)(-i)?pseudo-(upper(:uppercase){0}|lower(:lowercase){0}|cap(:capitalize){0}|none)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(tdl)(-i)?pseudo-(under(:underline){0}|over(:overline){0}|linet(:line-through){0}|none)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(tds)(-i)?pseudo-(solid|double|dotted|dashed|wavy)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(ws)(-i)?pseudo-(normal|pre|pwrap(:pre-wrap){0}|bspace(:break-spaces){0}|nowrap|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(wb)(-i)?pseudo-(normal|abreak(:break-all){0}|keep(:keep-all){0}|wbreak(:break-word){0}|inherit|initial)\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(flex|basis|grow|shrink|h|minh|maxh|w|minw|maxw|bwt|bwr|bwb|bwl|bwh|bwv|bw|brad|op|fsz|lh)(-i)?pseudo-(\d+(_\d+)?|auto|inherit|initial|unset|none)units.numeric\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(order|l|t|r|b|z|m|mh|mv|mt|mr|mb|ml|p|ph|pv|pt|pr|pb|pl)(-i)?pseudo-(-?\d+(_\d+)?|auto|inherit|initial|unset|none)units.numeric\s{1}/g,
        /\s{1}(md|mdl|mdp)?-?(c|bgc|bct|bcl|bcb|bcr|bc|bch|bcv)(-i)?pseudo-([a-f0-9]{3,8}|[a-z]+)\s{1}/g
    ]

    static #classPropsRegex = /class="([\w\s\-]+)"/g
    static #cssSelectorRegex = /([\w\s\-\*\+>\(\)\[\]\.,#:"='\^\$\~]+)\{([^\{\}]+)\}/g
    static #cssPropsRegex = /([\w\- ]+):([ \w\(\)\-\.\\\/!"'#%,]+);?/g
    static #allCssContructRegex = /((@)?[^@\{\}\;]+)(\{)|(@[^\{\}\;]+(;))/
    static #mediaRegex = /(@media[^\{\}]+)\{(([\w\s\-\*\+>\@\(\)\[\]\.,#:"='\^\$\~]+)\{([^\{\}]+)\})+[\s\w-]+\}/g
    static #isStartWatch=false
    static #cache = {}
    static #loadingProcess

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
        act:':active',
        blr:':blur',
        chk:':checked',
        dis:':disabled',
        enb:':enabled',
        emp:':empty',
        fcs:':focus',
        fch:':first-child',
        fls:':fullscreen',
        hvr:':hover',
        inv:':invalid',
        lch:':last-child',
        lnk:':link',
        rdo:':read-only',
        rdw:':read-write',
        rqd:':required',
        opt:':optional',
        tgt:':target',
        vst:':visited',
        val:':valid'
    }

    static #excludeValues = [
        'auto',
        'inherit',
        'initial',
        'unset',
        'none'
    ]

    static #analyzeHttp(html){
        try{
            let matches = html.matchAll(this.#classPropsRegex)
            let allClasses = []
            if(matches)
                for(let match of matches)
                    allClasses = [...allClasses, ...match[1].split(/\s+/)]
            return allClasses
        }catch(err){
            Logger.error('CssCompiler.analyzeHttp()', err)
            return null
        }
    }

    static #analyzeCss(css, isInner = false) {
        let rules = []
        let props = css
        while(CssCompiler.#allCssContructRegex.test(props)){
            let matchRule = props.match(CssCompiler.#allCssContructRegex)
            switch (matchRule[3] ?? matchRule[5]) {
                case '{':
                    let selectRules = props.slice(matchRule.index)
                    let matches = Array.from(selectRules.matchAll(/[\{\}]/g))
                    let lastIndex = 0, startIndex = -1, counter = 0
                    for (let item of matches) {
                        counter += item[0] == '{' ? 1 : -1
                        startIndex = startIndex == -1 ? item.index + 1 : startIndex
                        if (counter == 0) {
                            lastIndex = item.index
                            break
                        }
                    }
                    selectRules = selectRules.slice(0, lastIndex + 1)
                    props = props.replace(selectRules, '')
                    let innerCss = selectRules.slice(startIndex, lastIndex)
                    let rule = matchRule[1].replace(/\s+/g,' ').trim()
                    if (CssCompiler.#allCssContructRegex.test(innerCss)) {
                        let res = CssCompiler.#analyzeCss(innerCss, true)
                        rules.push({ rule, original:selectRules.trim(), innerCss: res })
                    } else {
                        rules.push({ rule, original:selectRules.trim(), innerCss: innerCss })
                    }
                    break
                case ';':
                    props = props.replace(matchRule[4], '')
                    rules.push(matchRule[4].trim())
                    break
            }
        }
        rules.sort((a,b)=>{
            let ruleA = typeof a == 'object' ? a.rule : a
            let ruleB = typeof b == 'object' ? b.rule : b
            let setA = this.#atRulesList.find(el=>new RegExp(`^${el.name}`).test(ruleA))
            let setB = this.#atRulesList.find(el=>new RegExp(`^${el.name}`).test(ruleB))
            let priorityA = setA !== undefined ? setA.priority : 0
            let priorityB = setB !== undefined ? setB.priority : 0
            return priorityA-priorityB
        })
        if(/^\s+$/.test(props))
            props=null
        if(isInner)
            return { rules, props }
        return this.#config.MERGE_SAME_SELECTORS ? this.#mergeSameRules(rules) : this.#concatAllRules(rules)
    }

    static #getFiles(pathStr, ext){ 
        try{
            pathStr = path.isAbsolute(pathStr) ? pathStr : path.join(this.#projectPath, pathStr).replace(/\\/g, '/')
            const stat = fs.statSync(pathStr)
            let pathes = stat.isDirectory() ? fs.readdirSync(pathStr,{recursive:true,encoding:'utf-8'}) : [pathStr]
            let ignorePathes = Array.isArray(this.#config?.IGNORE_PATHES) ? this.#config.IGNORE_PATHES : []
            const buildPath = path.isAbsolute(this.#config.BUILD_PATH) ? this.#config.BUILD_PATH : path.join(this.#projectPath, this.#config.BUILD_PATH)
            const buildDir = /\.\w+$/.test(buildPath) ? path.dirname(buildPath) : buildPath

            ignorePathes = [...(ignorePathes.map(p => path.isAbsolute(p) ? p : path.join(this.#projectPath, p))), buildDir]
            pathes = pathes.map(p=>path.isAbsolute(p) ? p : path.join(this.#projectPath, p).replace(/\\/g, '/'))
                            .filter(p => !(/node_modules/.test(p))
                                        && ignorePathes.reduce((res,cur)=>res &&= !(new RegExp(cur.replace(/[\\\/]+/g,'[\\\\\\/]+').replace('.','\\.'))).test(p),true)
                                        && path.extname(p) == ext)
            return pathes
        }catch(err){
            Logger.error('CssCompiler.getHtmlFiles()', err)
            return null
        }
    }

    static #loading(start=true){
        try{
            if(start && !this.#loadingProcess){
                let pathLoading = path.resolve(this.#modulePath, './loading.mjs')
                this.#loadingProcess = child_process.fork(pathLoading)
                this.#loadingProcess.send(JSON.stringify({command:'loading', args:[true]}))
            }else{
                if(this.#loadingProcess instanceof ChildProcess){
                    this.#loadingProcess.send(JSON.stringify({command:'loading', args:[false]}))
                    this.#loadingProcess.kill()
                    this.#loadingProcess = null
                }
            }  
        }catch(err){
            Logger.error('CssCompiler.loading()',err)
            this.#loadingProcess = null
        }
    }
     
    static async buildCSS(isWatch = false){
        try{
            this.#loading()
            if(!(await this.#load()))
                throw new Error('Не удалось инициализировать CssCompiler')
            Logger.init(path.join(this.#projectPath, '/csliner-log').replace(/\\/g, '/'))
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
            let classes = { standart: new Array() }
            for (let key in this.#mediaPrefixes)
                classes[key] = []
            if (matches.length) {
                matches.sort((aMatch, bMatch) => {
                    const isSetUnitA = aMatch?.[8] && unitKeys.includes(aMatch[8])
                    const isSetUnitB = bMatch?.[8] && unitKeys.includes(bMatch[8])
                    const addAPriority = (aMatch[5] != '' ? 0.5 : 0) + (isSetUnitA ? 0.25 : 0)
                    const addBPriority = (bMatch[5] != '' ? 0.5 : 0) + (isSetUnitB ? 0.25 : 0)
                    return (this.#listClasses[aMatch[2]].priority + addAPriority ) - (this.#listClasses[bMatch[2]].priority + addBPriority)
                })
                const unitKeys = Object.keys(this.#units.numeric).map(unit => unit.toLowerCase())
                for (let match of matches) {
                    let cls = match[2]
                    if (this.#listClasses?.[cls]) {
                        const p = this.#listClasses[cls]
                        let value, important = /^-i$/.test(match[3]) ? ' !important' : ''

                        if (p.unit == this.#units.nonNumeric.COLOR)
                            value = /^[a-f0-9]{3,8}$/.test(match[6]) ? `#${match[6]}` : match[6]
                        else if (Object.values(this.#units.nonNumeric).includes(p.unit))
                            value = keysRValues.includes(match[6]) ? replacedValues[match[6]] : match[6]
                        else {
                            if(match?.[8] && unitKeys.includes(match[8]) && !p.isSetUnit)
                                continue
                            const unit = match?.[8] && unitKeys.includes(match[8]) ? this.#units.numeric[match[8].toUpperCase()] : p.unit
                            const precision = typeof p?.precision === 'number' ? p.precision : (typeof unit?.precision == 'number' ? unit.precision : 0)
                           
                            if (this.#excludeValues.includes(match[6])) {
                                value = match[6]
                            } else {
                                if (/_/.test(match[6]))
                                    value = `${match[6].replace('_', '.')}${unit.unit}`
                                else if (precision) {
                                    value = match[6].padStart(precision + 1, '0').split('')
                                    value.splice(-precision, 0, '.')
                                    value = `${value.join('')}${unit.unit}`
                                } else
                                    value = `${match[6]}${unit.unit}`
                            }
                        }
                        const pseudoClass = match?.[5] ? this.#pseudoClassesList[match[5]] : ''
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
            let standartCssPath = path.resolve(this.#modulePath, '../css/standart.css')
            resultCSS = fs.readFileSync(standartCssPath, { encoding: 'utf-8' })
            for (let key in classes) {
                let reg = new RegExp(`---${key}---`)
                resultCSS = resultCSS.replace(reg, classes[key].join(''))
            }
            resultCSS = resultCSS.replace(/---\w+---/g, '').replace(/[\n\r\v\f]+/g,'\n').replace(/[\n\r\v\f]+\s*[\n\r\v\f]+/g, '\n')

            if(this.#config?.CSS_PATHES?.length){
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
                    allCssFilesObj.sort((a,b)=>a.priority - b.priority).forEach(value=>allCssFiles = [...allCssFiles, ...value.pathes])
                    for (let file of allCssFiles) {
                        try {
                            resultCSS += fs.readFileSync(file, { encoding: 'utf-8' })+'\n\n'
                        } catch (err) {
                            Logger.error(`CssCompiler.buildCSS(): readFile[${file}]`, err)
                            continue
                        }
                    }
                    resultCSS = this.#analyzeCss(resultCSS)
                }else{
                    Logger.warning('CssCompiler.buildCSS()', 'По указанным в CSS_PATHES путям не найдено CSS файлов')
                }
            }
            
            
            let buildPath = path.isAbsolute(this.#config.BUILD_PATH) ? this.#config.BUILD_PATH : path.join(this.#projectPath, this.#config.BUILD_PATH).replace(/\\/g, '/')
            let buildDir = /\.\w+$/.test(buildPath) ? path.dirname(buildPath) : buildPath
            if(!fs.existsSync(buildDir))
                fs.mkdirSync(buildDir,{recursive:true})
            buildPath = /\.css$/.test(buildPath) 
                ? buildPath 
                : (/\.\w+$/.test(buildPath) 
                    ? path.join(path.dirname(buildPath),'./app.css').replace(/\\/g, '/')
                    : path.join(buildPath,'./app.css').replace(/\\/g, '/'))
            fs.writeFileSync( buildPath, resultCSS, {encoding:'utf8'} )
            if(isWatch && !this.#isStartWatch){
                this.#runWatchFileChanges()
                this.#isStartWatch = true
            }
            this.#loading(false)
            if(Logger.isDebug)
                Logger.success('CssCompiler.buildCSS()','BUILD SUCCESS!')
            return true
        }catch(err){
            Logger.error('CssCompiler.buildCSS()', err)
            this.#loading(false)
            return false
        }
    }

    static #mergeSameRules(rulesArr, addTab=0){
        let addT = '\t'.repeat(addTab)
        let duplicateRules = {}, currentRule, currentKey, currentValue, settings, mergedCss = ''
        for (let item of rulesArr) {
            settings = item !== 'string' ? CssCompiler.#atRulesList.find(el => new RegExp(`^${el.name}`).test(item.rule)) : undefined
            if(typeof item != 'string'){
                currentKey = item.rule
                if(settings?.compare){
                    let compare = this.#atRulesCompare.find(el=>settings.compare instanceof el.type && (el?.value ? el.value==settings.compare : true))
                    if(compare)
                        currentKey = compare.callback(currentKey, item.original, settings.compare)
                }
            }else{
                currentKey = item
            }
            currentRule = typeof item === 'string' ? item : item.rule
            currentValue = typeof item === 'string' ? null : item.innerCss
            if (duplicateRules?.[currentKey])
                if(settings?.replace)
                    duplicateRules[currentKey].values = [currentValue]
                else 
                    duplicateRules[currentKey].values.push(currentValue)
            else
                duplicateRules[currentKey] = currentValue === null ? null : { rule: currentRule, values: [currentValue] }
        }
        for (let key in duplicateRules) {
            if (Array.isArray(duplicateRules[key]?.values) && duplicateRules[key]?.values?.length) {
                const isObj = duplicateRules[key].values.reduce((acc,cur)=> acc &&= typeof cur === 'object', true)
                let resultProps='',newProps = {}, propsStr='',innerRules = ''
                if(isObj){
                    innerRules = CssCompiler.#mergeSameRules(duplicateRules[key].values.reduce((arr,el)=>arr = [...arr,...el.rules] ,[]), addTab+1)
                    propsStr = duplicateRules[key].values.reduce((acc,el)=>acc += typeof el.props === 'string' ? el.props.replace(/[\r\n\t\v\s]+/g,' ') : '', '')
                }else{
                    propsStr = duplicateRules[key].values.map(prop=>prop.replace(/[\r\n\t\v\s]+/g,' ')).join('\n')
                }
                let props = Array.from(propsStr.matchAll(CssCompiler.#cssPropsRegex))
                for(let prop of props)
                    newProps[prop[1].trim()] = prop[2].trim()
                for(let prop in newProps)
                    resultProps+=`\r\n\t${addT}${prop}: ${newProps[prop]};`
                mergedCss += (mergedCss.length ? '\n\n' : '') + `${addT}${duplicateRules[key].rule.replace(/,\s*/g,',\n')}{${resultProps}${innerRules.length ? '\n'+innerRules: ''}\n${addT}}`
            } else if (duplicateRules[key] == null) {
                mergedCss += (mergedCss.length ? '\n\n' : '')+`${addT}${key}`
            }
        }
        return mergedCss
    }

    static #concatAllRules(rulesArr, addTab=0){
        let concatCss = ''
        let addT = '\t'.repeat(addTab)
        for (let item of rulesArr) {
            if(typeof item === 'object'){
                let resultProps='',newProps = {}, propsStr='',innerRules = ''
                if(typeof item?.innerCss === 'string'){
                    propsStr = item.innerCss.replace(/[\r\n\t\v\s]+/g,' ')
                }else{
                    innerRules = CssCompiler.#concatAllRules(item.innerCss.rules, addTab+1)
                    propsStr = typeof item.innerCss.props === 'string' ? item.innerCss.props.replace(/[\r\n\t\v\s]+/g,' ') : ''
                }
                let props = Array.from(propsStr.matchAll(CssCompiler.#cssPropsRegex))
                for(let prop of props)
                    newProps[prop[1].trim()] = prop[2].trim()
                for(let prop in newProps)
                    resultProps+=`\r\n\t${addT}${prop}: ${newProps[prop]};`
                concatCss+=(concatCss.length ? '\n\n' : '') + `${addT}${item.rule.replace(/,\s*/g,',\n')}{${resultProps}${innerRules.length ? '\n'+innerRules: ''}\n${addT}}`
            }else if(typeof item === 'string'){
                concatCss += (concatCss.length ? '\n\n' : '')+`${addT}${item}`
            }
        }
        return concatCss
    }

    static #runWatchFileChanges(){
        try{
            const buildPath = path.isAbsolute(this.#config.BUILD_PATH) ? this.#config.BUILD_PATH : path.join(this.#projectPath, this.#config.BUILD_PATH).replace(/\\/g, '/')
            const buildDir = /\.\w+$/.test(buildPath) ? path.dirname(buildPath) : buildPath
            let ignorePathes = Array.isArray(this.#config?.IGNORE_PATHES) ? this.#config.IGNORE_PATHES : []
            ignorePathes = [...(ignorePathes.map(p=>path.isAbsolute(p) ? p : path.join(this.#projectPath,p))), buildDir]     
            let pathes = fs.readdirSync(this.#projectPath, {recursive:true, encoding:'utf-8'})
            .map(p=>path.isAbsolute(p) ? p : path.join(this.#projectPath, p).replace(/[\\\/]+/g, '/'))
            .filter(p=>{
                return !/node_modules/.test(p) 
                       && /(\.html|\.css)$/.test(p)
                       && ignorePathes.reduce((res,cur)=>res &&= !(new RegExp(cur.replace(/[\\\/]+/g,'[\\\\\\/]+').replace('.','\\.'))).test(p),true)
            })
            pathes.push(path.join(this.#projectPath, './csliner.config.json').replace(/[\\\/]+/g, '/'))

            for(const p of pathes){
                if(fs.existsSync(p)){
                    const keyFile = crypto.createHash('md5').update(p).digest('hex')
                    const stat = fs.statSync(p)
                    this.#cache[keyFile] = {
                        filePath: p,
                        pathRegex: new RegExp(p.replace(/[\\\/]+/g,'[\\\\\\/]+').replace('.','\\.')),
                        fileName: path.basename(p),
                        mTime: stat.mtimeMs
                    }
                }
            }
            
            fs.watch(this.#projectPath, { persistent: true, recursive:true, encoding: 'utf-8' }, (event, filename) => {
                try{
                    if (typeof filename === 'string' && (/(\.html|\.css|\.json)$/.test(filename))) {
                        const fullPath = path.join(this.#projectPath,filename).replace(/[\\\/]+/g, '/')
                        const cacheFilePair = Object.entries(this.#cache).find(obj=>obj[1].pathRegex.test(fullPath))
                        const cacheFile = cacheFilePair?.[1]
                        const cacheKey = cacheFilePair?.[0]
                        const stat = fs.existsSync(fullPath) ? fs.statSync(fullPath) : undefined
                        let isRebuild = false
                        if(event=='change' && cacheFile && stat){
                            if(Math.abs(stat.mtimeMs - cacheFile.mTime) > 100){
                                cacheFile.mTime = stat.mtimeMs
                                isRebuild = true
                            } 
                        }else if(event=='rename'){
                            if((cacheFile && stat && path.basename(filename) != cacheFile.fileName) || (stat && !cacheFile)){
                                const newCacheKey = crypto.createHash('md5').update(fullPath).digest('hex')
                                this.#cache[newCacheKey] = {
                                    filePath: fullPath,
                                    pathRegex: new RegExp(fullPath.replace(/[\\\/]+/g,'[\\\\\\/]+').replace('.','\\.')),
                                    fileName: path.basename(fullPath),
                                    mTime: stat.mtimeMs
                                }
                            }
                            if((cacheFile && stat && path.basename(filename) != cacheFile.fileName) || (cacheFile && !stat))
                                delete this.#cache[cacheKey]
                            if((stat && !cacheFile)||(cacheFile && !stat))
                                isRebuild = true
                        }
                        if(isRebuild)
                            this.buildCSS()
                    }
                }catch(err){
                    Logger.error('CssCompiler.runWatchFileChanges[fs.watch]()', err)
                }
            })
        }catch(err){
            Logger.error('CssCompiler.runWatchFileChanges()', err)
        }
    }

    /**
     * @param {string} cssClass 
     * @param {object} params 
     * @param {string|null} [params.unit] 
     * @param {number} [params.priority]
     * @param {number} [params.precision]  
     * @param {string} [params.rename] 
     */
    static #setClassProperty(cssClass, params){
        try{
            let result = false
            if (!this.#listClasses?.[cssClass])
                throw new Error('Указанный класс не существует')
            if(params?.unit){
                let allUnits = {...this.#units.numeric, ...this.#units.nonNumeric}
                if ((typeof params.unit == 'string' || params.unit == null) && allUnits?.[params.unit.toUpperCase()] && this.#listClasses[cssClass].isSetUnit){
                    this.#listClasses[cssClass].unit = allUnits?.[params.unit.toUpperCase()]
                    result = true
                }
            }
            if(params?.priority && typeof params?.priority == 'number'){
                this.#listClasses[cssClass].priority = params.priority
                result = true
            }
            if(params?.precision && typeof params?.precision == 'number' && params?.precision >= 0 && this.#listClasses[cssClass].isSetUnit){
                this.#listClasses[cssClass].precision = params.precision
                result = true
            }
            if(typeof params?.rename == 'string'){
                if(Object.keys(this.#listClasses).includes(params.rename))
                Logger.warning('CssCompiler.setClassProperty()','Имя заданное для переименования класса уже существует, класс не будет переименован.', params)
                else{
                    delete Object.assign(this.#listClasses, { [params.rename]: this.#listClasses[cssClass] })[cssClass]
                    let reg = new RegExp(`^\\/([\\w\\W]+\\([\\w\\W]+\\|)(${cssClass})(\\|[\\w\\W]+\\)[\\w\\W]+)\\/g`)
                    for (let i = 0; i < this.#regClasses.length; i++) {
                        if (reg.test(this.#regClasses[i].toString())) {
                            let oldReg = this.#regClasses[i].toString()
                            let newReg = new RegExp(oldReg.replace(reg, `$1${params.rename}$3`), 'g')
                            this.#regClasses[i] = newReg
                            break
                        }
                    }
                    result = true
                }
            }
            return result
        }catch(err){
            Logger.error('CssCompiler.setClassProperty()',err)
            return false
        }
    }

    static #setUnitPrecision(unitName, precision){
        try{
            if(typeof precision !='number' || precision<0)
                throw new Error('Установлено неверное значение для precision параметра!')
            if(!this.#units.numeric?.[unitName.toUpperCase()])
                throw new Error('Указанная единица измерения не найдена')
            this.#units.numeric[unitName.toUpperCase()].precision=precision
            for(let cls of Object.values(this.#listClasses)){
                if(cls.unit.unit==unitName.toLowerCase())
                    cls.unit = this.#units.numeric[unitName.toUpperCase()]
            }
            return true
        }catch(err){
            Logger.error('CssCompiler.setUnitPrecision()',err)
            return false
        }
    }

    static async #load(){
        try{
            if (!fs.existsSync(`${this.#projectPath}/csliner.config.json`))
                throw new Error('Файл конфигурации отсутствует, для корректной работы выполните команду инициализации чтобы создать файл конфигурации')
            let data = fs.readFileSync(`${this.#projectPath}/csliner.config.json`,{encoding:'utf-8'})
            if(!data)
                throw new Error('Не удалось прочитать файл конфигурации!')
            this.#loadRegClasses()
            let config = JSON.parse(data)
            this.#config = config
            if(this.#config?.SET_CLASSES){
                for(let cls in this.#config.SET_CLASSES){
                    this.#setClassProperty(cls, this.#config.SET_CLASSES[cls])
                }
            }
            if(this.#config?.SET_UNITS_PRECISION){
                for(let unitName in this.#config.SET_UNITS_PRECISION){
                    this.#setUnitPrecision(unitName, this.#config.SET_UNITS_PRECISION[unitName])
                }
            }
            return true
        }catch(err){
            Logger.error('CssCompiler.load()',err)
            return false
        }
    }   

    static async #loadRegClasses(){
        let regPseudo = `(_{1,2}(${Object.keys(this.#pseudoClassesList).join('|')}){1})?`
        let regNum = `(${Array.from(Object.entries(this.#units.numeric)).filter(el=>el[1].unit!='').map(el=>el[0].toLowerCase()).join('|')})?`
        for(let i = 0; i<this.#regClasses.length; i++){
            let newReg = this.#regClasses[i].toString().replace(/^\//,'').replace(/\/g$/,'').replace('pseudo',regPseudo)
            newReg = newReg.replace('units.numeric', regNum)
            this.#regClasses[i] = new RegExp(newReg,'g')
        }
    }

    static init(){
        try{
            Logger.init(path.join(this.#projectPath, '/csliner-log').replace(/\\/g, '/'))
            if (fs.existsSync(this.#projectPath)) {
                if (!fs.existsSync(`${this.#projectPath}/csliner.config.json`)) {
                    fs.writeFile(`${this.#projectPath}/csliner.config.json`, JSON.stringify(this.#standartConfig, null, '\t'),(err)=>{
                        if(err)
                            Logger.error('CssCompiler.init()',err)
                        else
                            Logger.success('CssCompiler.init()','INIT SUCCESS!')
                    })
                } 
            }
            console.log('\x1b[34m%s\x1b[0m',
`             0000000000000000     0000000000000000     0000
            0000000000000000     0000000000000000     0000
           0000                 0000                 0000
          0000                 0000                 0000
         0000                 0000000000000000     0000
        0000                 0000000000000000     0000        
       0000                             0000     0000        
      0000000000000000     0000000000000000     0000000000000000
     0000000000000000     0000000000000000     0000000000000000
                                                                `)
        }catch(err){
            Logger.error('CssCompiler.init()',err)
        }
    }
}


