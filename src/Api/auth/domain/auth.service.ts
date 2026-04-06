
import { Injectable, Logger } from '@nestjs/common';
import * as argon from "argon2";

@Injectable({})
export class AuthService {
  private readonly logger = new Logger("AuthService");
  constructor() {}

  async hashPassword(password: string): Promise<string> {
    return argon.hash(password);
  }
  /*
  async verifyPasswd(hashedPassword: string, passwd: string): Promise<void> {
    const pwdMatch = await argon.verify(hashedPassword, passwd);

    if (!pwdMatch)
      throw new UnauthorizedException(
        "Credenciales incorrectas. Por favor, verifique su usuario y contraseña e intente nuevamente."
      );
  }

  async sendVerificationEmail(email: string, passwd: string): Promise<void> {
    try {
      const resend = new Resend(this.config.get<string>("resend"));
      const code = generateCode(6);

      await resend.emails.send({
        from: "Docentes Primera Infancia <anriverax@codear.dev>",
        to: [email],
        subject: "Verifica tu correo electrónico - Docentes Primera Infancia",
        html: renderedVerifyEmail(code, passwd)
      });

      await this.redisService.set("verifyEmailCode", code, 3 * 24 * 60 * 60); // TTL de 3 días
    } catch (error) {
      this.logger.error(`❌ Se produjo un error: `, error);
      throw new BadRequestException(
        "Se ha producido un error al intentar enviar el correo electrónico. Por favor, inténtelo nuevamente más tarde."
      );
    }
  }

  async sendChangePasswd(email: string): Promise<void> {
    try {
      const resend = new Resend(this.config.get<string>("resend"));

      await resend.emails.send({
        from: "Docentes Primera Infancia <anriverax@codear.dev>",
        to: [email],
        subject: "Cambio de contraseña - Docentes Primera Infancia",
        html: renderedChangePasswd()
      });
    } catch (error) {
      this.logger.error(`❌ Se produjo un error: `, error);
      throw new BadRequestException(
        "Se ha producido un error al intentar enviar el correo electrónico. Por favor, inténtelo nuevamente más tarde."
      );
    }
  }

  async logout(id: number, accessToken: string): Promise<boolean> {
    try {
      // Remove the Redis refreshToken
      const refreshTokenKey = `auth:refresh:${id}`;
      await this.redisService.del(refreshTokenKey);

      if (accessToken) {
        const publicKey = getPublicKey(this.config);

        const accessTokenPayload = await this.jwtService.verifyAsync(accessToken, {
          publicKey: publicKey,
          algorithms: ["RS256"]
        });

        const accessTokenKey = `auth:access:${accessTokenPayload.tokenId}`;

        await this.redisService.del(accessTokenKey);
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        "El token de sesión es inválido. Por favor, inicie sesión nuevamente.",
        error
      );
    }
  }

  async verifyEmailCode(code: string): Promise<boolean> {
    try {
      const storedCode = await this.redisService.get("verifyEmailCode");

      if (storedCode && storedCode === code) {
        // Remove the verification code after use
        await this.redisService.del("verifyEmailCode");

        return true;
      } else throw new BadRequestException("El código de verificación es incorrecto o ha expirado.");
    } catch (error) {
      this.logger.error(`❌ Error al verificar el código de correo electrónico: `, error);

      if (error instanceof BadRequestException) throw error;

      throw new BadRequestException(
        "Se ha producido un error al verificar el código de correo electrónico."
      );
    }
  }

  getData(
    accessToken: string,
    refreshToken: string,
    user: IUser,
    userPermissions: string[]
  ): ILoginResponse {
    const {
      isVerified,
      email,
      avatar,
      Role: { name }
    } = user;

    const firstName = user.Person ? user.Person.firstName : "";
    const lastName = user.Person ? user.Person.lastName1 : "";
    const fullName = `${firstName} ${lastName}`;

    return {
      accessToken,
      refreshToken,
      user: {
        email,
        isVerified,
        name: fullName,
        picture: avatar,
        role: name
      },
      permissions: userPermissions
    };
  }*/
}
