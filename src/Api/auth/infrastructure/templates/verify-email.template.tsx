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

interface AWSVerifyEmailProps {
  verifyCode: string;
  passwd: string;
}

export default function VerifyEmailTemplate({ verifyCode, passwd }: AWSVerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verifica tu correo electrónico y accede con tu contraseña temporal.</Preview>
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
              marginBottom: "16px"
            }}
          >
            Por favor, verifica tu dirección de correo electrónico.
          </Heading>
          <Text
            style={{
              color: "#6B7280",
              fontSize: "14px",
              lineHeight: "24px",
              margin: "0 0 25px 0"
            }}
          >
            Gracias por iniciar el proceso de creación de tu cuenta. Para garantizar que eres tú quien
            está realizando esta acción, por favor introduce el siguiente código de verificación cuando
            se te solicite:
          </Text>
          <Section style={{ margin: "12px 0 24px 0" }}>
            <Text
              style={{
                fontWeight: "bold",
                textAlign: "center"
              }}
            >
              Código de verificación
            </Text>
            <Text
              style={{
                height: "100%",
                width: "100%",
                padding: "20px 0",
                backgroundColor: "#4f46e5",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "36px",
                margin: "10px 0",
                textAlign: "center"
              }}
            >
              {verifyCode}
            </Text>
            <Text style={{ margin: "0px", textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
              (Este código es válido durante los próximos 3 días. )
            </Text>
            <Text style={{ margin: "0px", textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
              Si no has solicitado la creación de una cuenta, puedes ignorar este mensaje de forma
              segura.
            </Text>
          </Section>
          <Section style={{ margin: "12px 0 24px 0" }}>
            <Text
              style={{
                fontWeight: "bold",
                textAlign: "center"
              }}
            >
              Contraseña temporal
            </Text>
            <Text
              style={{
                height: "100%",
                width: "100%",
                padding: "20px 0",
                backgroundColor: "#2ecc71",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "36px",
                margin: "10px 0",
                textAlign: "center"
              }}
            >
              {passwd}
            </Text>
            <Text style={{ margin: "0px", textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
              (Te recomendamos cambiarla una vez que inicies sesión.)
            </Text>
          </Section>
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

export const renderedVerifyEmail = (code: string, passwd: string) =>
  ReactDOMServer.renderToStaticMarkup(<VerifyEmailTemplate verifyCode={code} passwd={passwd} />);