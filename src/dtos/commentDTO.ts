export interface CreateCommentInput {
    postId: string,
    content: string,
    token: string | undefined
}

export interface CreateCommentOutput {
    message: string
}

export interface DeleteCommentInput {
    commentId: string,
    token: string | undefined
}

export interface GetCommentsByPostIdInput {
    postId: string,
    token: string | undefined
}