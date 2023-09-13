import express from "express";
import { CommentBusiness } from "../business/CommentBusiness";
import { CommentController } from "../controller/CommentController";
import { CommentDatabase } from "../database/CommentDatabase";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from '../services/TokenManager';
import { UserDataBase } from '../database/UserDatabase';
import { PostDatabase } from '../database/PostDatabase';

export const commentRouter = express.Router()

const commentController = new CommentController(
  new CommentBusiness(
    new CommentDatabase(),
    new UserDataBase(),
    new PostDatabase(),
    new IdGenerator(),
    new TokenManager(),
    new HashManager()
  )
)

commentRouter.get("/:id", commentController.getComments)
commentRouter.post("/:id", commentController.createComment)
commentRouter.delete("/:id", commentController.deleteComment)
commentRouter.put("/:id/like", commentController.LikeOrDislikeComment)