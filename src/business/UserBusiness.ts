import { UserDataBase } from "../database/UserDatabase";
import {
  LoginInput,
  LoginOutput,
  SignupInput,
  SignupOutput,
} from "../dtos/userDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { User } from "../models/User";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { TokenPayload, USER_ROLES } from "../types";

export class UserBusiness {
  constructor(
    private userDatabase: UserDataBase,
    private idGenerator: IdGenerator,
    private tokenManager: TokenManager,
    private hashManager: HashManager
  ) {}

  public signup = async (input: SignupInput): Promise<SignupOutput> => {
    const { name, email, password } = input;

    if (typeof name !== "string") {
      throw new BadRequestError("'name' deve ser string");
    }

    if (typeof email !== "string") {
      throw new BadRequestError("'email' deve ser string");
    }

    if (typeof password !== "string") {
      throw new BadRequestError("'password' deve ser string");
    }

    if (name.length < 3) {
      throw new BadRequestError("'name' deve possuir no mínimo 3 caracteres");
    }

    if (email.length < 3 || !email.includes("@")) {
      throw new BadRequestError(
        "'email' deve possuir no mínimo 3 caracteres e ter @"
      );
    }

    const userEmailDB = await this.userDatabase.findUserByEmail(email);

    if (userEmailDB) {
      throw new BadRequestError("Email já cadastrado");
    }

    if (password.length < 3) {
      throw new BadRequestError(
        "'password' deve possuir no mínimo 3 caracteres"
      );
    }

    const hashedPassword = await this.hashManager.hash(password);

    const id = this.idGenerator.generate();

    const newUser = new User(
      id,
      name,
      email,
      hashedPassword,
      USER_ROLES.NORMAL,
      new Date().toISOString()
    );

    const newUserDB = newUser.toDBModel();
    await this.userDatabase.insertUser(newUserDB);
    //já foi criado o usuario
    //vamos criar token
    const tokenPayload: TokenPayload = {
      id: newUser.getId(),
      name: newUser.getName(),
      role: newUser.getRole(),
    };

    const token = this.tokenManager.createToken(tokenPayload);

    const output: SignupOutput = {
      message: "Cadastro realizado com sucesso",
      token,
    };

    return output;
  };

  public login = async (input: LoginInput): Promise<LoginOutput> => {
    const { email, password } = input;

    if (typeof email !== "string") {
      throw new Error("'email' deve ser string");
    }

    if (typeof password !== "string") {
      throw new Error("'password' deve ser string");
    }

    const userDB = await this.userDatabase.findUserByEmail(email);

    if (!userDB) {
      throw new NotFoundError("'email' não encontrado!");
    }

    const isPasswordCorrect = await this.hashManager.compare(
      password,
      userDB.password
    );

    if (!isPasswordCorrect) {
      throw new BadRequestError("'Email' ou 'senha' incorretos");
    }

    // if (password !== userDB.password) {
    //     throw new BadRequestError("'email' ou 'password' incorretos")
    // }

    const user = new User(
      userDB.id,
      userDB.name,
      userDB.email,
      userDB.password,
      userDB.role,
      userDB.created_at
    );

    const payload: TokenPayload = {
      id: user.getId(),
      name: user.getName(),
      role: user.getRole(),
    };

    const token = this.tokenManager.createToken(payload);

    const output: LoginOutput = {
      message: "Login realizado com sucesso",
      token,
    };

    return output;
  };
}