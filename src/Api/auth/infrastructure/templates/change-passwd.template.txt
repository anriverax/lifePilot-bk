import * as React from "react";
import * as ReactDOMServer from "react-dom/server";

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text
} from "@react-email/components";

export default function ChangePasswdTemplate() {
  return (
    <Html>
      <Head />
      <Preview>Tu contraseña se ha actualizado correctamente</Preview>
      <Body>
        <Container
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            margin: "0 auto",
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            maxWidth: "600px",
            padding: "24px 42px"
          }}
        >
          <Section
            style={{
              display: "flex",
              padding: "20px 0",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Img
              src="https://res.cloudinary.com/dwdju8gzi/image/upload/v1744236682/jxsww3efugwnggetyqfq.png"
              width="100%"
              height="auto"
              alt="cintillo logo"
            />
          </Section>
          <Heading
            style={{
              fontSize: "24px",
              lineHeight: "32px",
              marginBottom: "16px",
              textAlign: "center"
            }}
          >
            Tu contraseña ha sido actualizada
          </Heading>
          <Text
            style={{
              color: "#6B7280",
              fontSize: "14px",
              lineHeight: "24px",
              margin: "0 0 25px 0"
            }}
          >
            Te confirmamos que tu contraseña fue actualizada exitosamente. Si tú realizaste este cambio,
            no necesitas hacer nada más.
          </Text>
          <Text
            style={{
              color: "#6B7280",
              fontSize: "14px",
              lineHeight: "24px",
              margin: "0 0 25px 0"
            }}
          >
            Si no reconoces esta actividad, por favor contacta con nuestro equipo de soporte
            inmediatamente para proteger tu cuenta.
          </Text>
          <Section>
            <Hr />
            <Text
              style={{
                color: "#6b7280",
                fontSize: "12px",
                fontWeight: "500",
                margin: "30px 0 0 0",
                textAlign: "center"
              }}
            >
              Por tu seguridad, nunca te solicitaremos a través de correo electrónico que compartas tu
              contraseña, datos de tarjeta de crédito o información bancaria.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const renderedChangePasswd = () => ReactDOMServer.renderToStaticMarkup(<ChangePasswdTemplate />);
