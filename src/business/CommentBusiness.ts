import { CommentDatabase } from "../database/CommentDatabase"
import { CreateCommentInput, CreateCommentOutput, GetCommentsByPostIdInput, DeleteCommentInput } from '../dtos/commentDTO';
import { BadRequestError } from "../errors/BadRequestError"
import { Comment } from "../models/Comment"
import { HashManager } from "../services/HashManager"
import { IdGenerator } from "../services/IdGenerator"
import { TokenManager, USER_ROLES } from "../services/TokenManager"
import { CommentWithCreatorDB, COMMENT_LIKE, LikeDislikeCommentDB } from '../../types'
import { LikeOrDislikePostInput } from '../dtos/postDTO';
import { UserDataBase } from '../database/UserDatabase';
import { PostDatabase } from '../database/PostDatabase';

export class CommentBusiness {
  constructor (
    private commentDatabase: CommentDatabase,
    private UserDataBase: UserDataBase,
    private PostDatabase: PostDatabase,
    private idGenerator: IdGenerator,
    private tokenManager: TokenManager,
    private hashManager: HashManager
  ) {}

  public createComment = async (input: CreateCommentInput): Promise<CreateCommentOutput> => {
    const { postId, content, token } = input

    if(!token) {
      throw new BadRequestError("O Token não foi enviado!")
    }

    const payload = this.tokenManager.getPayload(token as string)

    if(payload === null) {
      throw new BadRequestError("Este Token é inválido!")
    }

    if (typeof postId !== "string") {
      throw new BadRequestError("'postId' deve ser string")
    }

    if (typeof content !== "string") {
      throw new BadRequestError("'content' deve ser string")
    }

    const id = this.idGenerator.generate()

    const comment = new Comment(
      id,
      postId,
      content,
      0,
      0,
      new Date().toISOString(),
      new Date().toISOString(),
      payload.id,
      payload.name
    )

    const commentDB = comment.toDBModel()

    await this.commentDatabase.createComment(commentDB)

    const output: CreateCommentOutput = {
      message: "Comentário criado com sucesso!"
    }

    return output
  }

  public getComments = async (input: GetCommentsByPostIdInput) => {
    const { postId, token } = input;

    if (!token) {
      throw new BadRequestError("O Token não foi enviado!");
    }

    const payload = this.tokenManager.getPayload(token as string);

    if (payload === null) {
      throw new BadRequestError("Este Token é inválido!");
    }

    if (typeof postId !== "string") {
      throw new BadRequestError("Post id deve ser uma string");
    }

    const commentsWithCreatorDB: CommentWithCreatorDB[] = await this.commentDatabase.getCommentWithCreatorByPostId(postId);

    const comments = commentsWithCreatorDB.map((commentDB) => {
      const comment = new Comment(
        commentDB.id,
        commentDB.post_id,
        commentDB.content,
        commentDB.likes,
        commentDB.dislikes,
        commentDB.created_at,
        commentDB.updated_at,
        commentDB.creator_id,
        commentDB.creator_name
      )
      return comment.toBusinessModel()
    })

    return comments

  }

  public deleteComment = async (input: DeleteCommentInput) => {
    const { commentId, token } = input

    if(!token) {
      throw new BadRequestError("O Token não foi enviado!")
    }

    const payload = this.tokenManager.getPayload(token as string)

    if(payload === null) {
      throw new BadRequestError("Este Token é inválido!")
    }

    if (typeof commentId !== "string") {
      throw new BadRequestError("'commentId' deve ser string")
    }

    const commentDB = await this.commentDatabase.getCommentById(commentId)

    if (!commentDB) {
      throw new BadRequestError("Comentário não encontrado!")
    }
    
    if (payload.role !== USER_ROLES.ADMIN && commentDB.creator_id !== payload.id) {
      throw new BadRequestError("Somente o criador do comentário pode deletá-lo!")
    }

    await this.commentDatabase.deleteCommentById(commentId)

    const output = {
      message: "Comentário deletado com sucesso!"
    }

    return output
  }

  public likeOrDislikeComment = async (input: LikeOrDislikePostInput) => {
    const {idToLikeOrDislike, token, like} = input

    if(!token) {
      throw new BadRequestError("O Token não foi enviado!")
    }

    const payload = this.tokenManager.getPayload(token as string)

    if(payload === null) {
      throw new BadRequestError("Usuário não conectado!")
    }

    if (typeof like !== "boolean") {
      throw new BadRequestError("'like' deve ser boolean!")
    }

    const commentDB = await this.commentDatabase.getCommentById(idToLikeOrDislike)

    if (!commentDB) {
      throw new BadRequestError("Comentário não encontrado!")
    }

    const postId = await this.commentDatabase.getIdPostByCommentId(idToLikeOrDislike);    

    const likeSQLite = like ? 1 : 0

    if (commentDB.creator_id === payload.id) {
      throw new BadRequestError("O criador não pode curtir seu próprio post.")
    }

    const likeDislikeDB: LikeDislikeCommentDB = {
      user_id: payload.id,
      post_id: postId[0].post_id,
      comment_id: idToLikeOrDislike,
      like: likeSQLite
    }
    
    const comment = new Comment(
      commentDB.id,
      commentDB.post_id,
      commentDB.content,
      commentDB.likes,
      commentDB.dislikes,
      commentDB.created_at,
      commentDB.updated_at,
      commentDB.creator_id,
      commentDB.creator_name
    )

    const likeDislikeExists = await this.commentDatabase.findLikeDislike(likeDislikeDB)

    if (likeDislikeExists === COMMENT_LIKE.ALREADY_LIKED) {
      if (like) {
        await this.commentDatabase.removeLikeDislike(likeDislikeDB)
        comment.removeLike()
      } else {
        await this.commentDatabase.updateLikeDislike(likeDislikeDB)
        comment.removeLike()
        comment.addDislike()
      }
    } else if (likeDislikeExists === COMMENT_LIKE.ALREADY_DISLIKED) {
      if (like) {
        await this.commentDatabase.updateLikeDislike(likeDislikeDB)
        comment.removeDislike()
        comment.addLike()
      } else {
        await this.commentDatabase.removeLikeDislike(likeDislikeDB)
        comment.removeDislike()
      }
    } else {
      await this.commentDatabase.likeOrDislikeComment(likeDislikeDB)
  
      like ? comment.addLike() : comment.addDislike()
    }

    const updatedComment = comment.toDBModel()

    await this.commentDatabase.editComment(idToLikeOrDislike, updatedComment)
  }
}