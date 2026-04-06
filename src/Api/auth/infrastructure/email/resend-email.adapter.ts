import { BadRequestException, Logger } from "@nestjs/common";
import { IEmailPort } from "./email.port";
import { Resend } from "resend";
import { generateCode } from "@/common/helpers/functions";
import { ConfigService } from "@nestjs/config";
import { getSharedRedisClient } from "@/services/redis/redis-singleton";
import { renderedVerifyEmail } from "../templates/verify-email.template";
import { renderedChangePasswd } from '../templates/change-passwd.template';

export class ResendEmailAdapter implements IEmailPort {
  private readonly logger = new Logger(ResendEmailAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async verifyEmail(email: string, passwd: string): Promise<void> {
    try {
      const resend = new Resend(this.config.get<string>("resend"));
      const code = generateCode(6);

      await resend.emails.send({
        from: "Docentes Primera Infancia <anriverax@codear.dev>",
        to: [email],
        subject: "Verifica tu correo electrónico - Docentes Primera Infancia",
        html: renderedVerifyEmail(code, passwd)
      });

      await getSharedRedisClient().set("verifyEmailCode", code, "EX", 3 * 24 * 60 * 60); // TTL de 3 días
    } catch (error) {
      this.logger.error(`❌ Se produjo un error: `, error);
      throw new BadRequestException(
        "Se ha producido un error al intentar enviar el correo electrónico. Por favor, inténtelo nuevamente más tarde."
      );
    }
  }

  async changePasswd(email: string): Promise<void> {
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
}
