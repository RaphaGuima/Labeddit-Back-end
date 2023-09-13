import express from "express"
import cors from "cors"
import { postRouter } from "./src/routers/postRouter"
import dotenv from 'dotenv'
import { userRouter } from "./src/routers/userRouter"
import { commentRouter } from "./src/routers/commentRouter"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.listen(Number(process.env.PORT), () => {
console.log(`Servidor rodando na porta ${process.env.PORT}`)
})

app.use("/posts", postRouter)
app.use("/user", userRouter)
app.use("/posts/comment", commentRouter)