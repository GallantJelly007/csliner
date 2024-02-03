//@ts-check
let progressInterval, loadingPos=null

function getCursorPos() {
    return new Promise((resolve) => {
        const termcodes = { cursorGetPosition: '\u001b[6n' }
        process.stdin.setEncoding('utf8')
        process.stdin.setRawMode(true)
        const readfx = function () {
            const buf = process.stdin.read()
            const str = JSON.stringify(buf)
            const xy = /\[(.*)/g.exec(str)
            if(xy?.length){
                let match = (xy)[0].replace(/\[|R"/g, '').split(';')
                const pos = { x: Number(match[1]), y: Number(match[0]) }
                process.stdin.setRawMode(false)
                resolve(pos)
            }else{
                resolve({x:0,y:0})
            }
        }
        process.stdin.once('readable', readfx)
        process.stdout.write(termcodes.cursorGetPosition)
    })
}

const commands = {
    async loading(start=true){
        let loadChars = '\|/—'
        let index = 0
        if(start){
            if(loadingPos==null)
                loadingPos = await getCursorPos()
            progressInterval = setInterval(()=>{
                process.stdout.cursorTo(loadingPos.x, loadingPos.y)
                process.stdout.write(`...Building ${loadChars[index++]}`)
                index = index>=loadChars.length ? 0 : index
            },100)
        }else{
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0)
            loadingPos=null
            clearInterval(progressInterval)
        }
    },
}

process.on('message',(data)=>{
    try{
        if(typeof data === 'string'){
            let obj = JSON.parse(data)
            if(typeof obj?.command === 'string' && typeof commands?.[obj?.command] === 'function'){
                commands[obj.command](...obj?.args)
            }
        }
    }catch(err){
        process.exit()
    }
})


