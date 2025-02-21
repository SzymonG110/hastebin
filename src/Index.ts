import ex from 'express'
import {connect, Model, model, Schema} from 'mongoose'

interface PasteSchema {
    code: string
    text: string
}

export class IndexWebsite {

    app: ex.Express = ex()
    port: number = 6969
    token: string = 'TItnFINMYUVitymubtyIVB'
    baseUrl: string = 'localhost:' + this.port
    databaseUrl: string = 'mongodb://localhost:27017/wklej'
    pasteSchema: Model<PasteSchema> | undefined

    constructor() {

        this.database()
        this.setup()
        this.routes()
        this.listen()

    }

    private makeid(length: number) {

        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;

    }

    private database() {

        connect(this.databaseUrl)
        this.pasteSchema = model('paste', new Schema({
            code: {
                type: String, required: true, unique: true
            },
            text: {
                type: String, required: true
            }
        }))

    }

    private setup(): void {

        this.app.use(ex.json())
        this.app.use(ex.urlencoded({extended: false}))

    }

    private routes(): void {

        this.app.post('/', async (req, res) => {

            const token = req.header('token')
            if (!token || token != this.token)
                return res.status(401).send('Unauthorized')

            const message = req.body.message
            if (!message || !(typeof message === 'string') || message.length == 0)
                return res.status(400).send('Bad Request')

            const code = this.makeid(10)

            const fixedMessage = message.replace(/\n/g, '<br>')
            await this.pasteSchema?.create({
                code,
                text: fixedMessage
            })

            console.log(`[${new Date().toLocaleString()}] New paste: ${code}`)

            res.send({
                message: message,
                code: code,
                url: `${this.baseUrl}/${code}`
            })

        })

        this.app.get('/:code', async (req, res, next) => {

            if (!await this.pasteSchema?.findOne({code: req.params.code}))
                return next()

            res.send((await this.pasteSchema?.findOne({code: req.params.code}) as PasteSchema).text)

        })

        this.app.get('/', (req, res) => {
            res.send('No witaj! Nie użyjesz sobie tego bo to prywatne, no sorry')
        })

    }

    private listen(): void {

        this.app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`)
        })

    }

}

new IndexWebsite()