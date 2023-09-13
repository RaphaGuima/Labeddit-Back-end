import { UserBusiness } from "../../src/business/UserBusiness"
import { LoginInput } from "../../src/dtos/userDTO"
import { HashManagerMock } from "../mocks/HashManagerMock"
import { IdGeneratorMock } from "../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../mocks/UserDatabaseMock"

describe("login", () => {
    const userBusiness = new UserBusiness(
        new UserDatabaseMock(),
        new IdGeneratorMock(),
        new TokenManagerMock(),
        new HashManagerMock()
    )
    
    test("login bem-sucedido em conta normal retorna o token", async () => {
        const input: LoginInput = {
            email: "normal@email.com",
            password: "bananinha"
        }

        const response = await userBusiness.login(input)
        expect(response.token).toBe("token-mock-normal")
    })

    test("login bem-sucedido em conta admin retorna o token", async () => {
        const input: LoginInput = {
            email: "admin@email.com",
            password: "bananinha"
        }

        const response = await userBusiness.login(input)
        expect(response.token).toBe("token-mock-admin")
    })

    test("Deve retornar erro por login incorreto", async () => {
        const input: LoginInput = {
            email: "nanana@gmail.com",
            password: "hash-bananinha"
        }

        expect(async()=>{
            await userBusiness.login(input)
        }).rejects.toThrow("'email' não encontrado!")

    })

    test("Deve retornar erro por senha incorreta", async () => {
        const input: LoginInput = {
            email: "normal@email.com",
            password: "bananinha2",
        }

        expect(async()=>{
            await userBusiness.login(input)
        }).rejects.toThrow("'Email' ou 'senha' incorreto")

    })
})