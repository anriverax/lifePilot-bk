import { AES, enc } from "crypto-js";

export function firstCapitalLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function decryptTextTransformer(value: string): string {
  const secret = process.env.PLAIN_TEXT;

  if (!secret) {
    throw new Error("El descifrado no está habilitado.");
  }

  try {
    const decrypted = AES.decrypt(value, secret).toString(enc.Utf8);

    if (!decrypted) {
      throw new Error("El resultado del descifrado está vacío. Verifique la clave o el valor cifrado.");
    }

    return decrypted;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error("Error de descifrado: " + error.message, { cause: error });
    }
    throw new Error("Error de descifrado desconocido.", { cause: error });
  }
}

export function encryptText(value: string): string {
  const secret = process.env.PLAIN_TEXT;

  if (!secret) {
    throw new Error("El cifrado no está habilitado: PLAIN_TEXT no definido.");
  }

  return AES.encrypt(value, secret).toString();
}
