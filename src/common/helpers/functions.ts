import { AES, enc } from "crypto-js";

export function firstCapitalLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function decryptTextTransformer(value: string): string {
  if (process.env.PLAIN_TEXT) {
    try {
      const result = AES.decrypt(value, process.env.PLAIN_TEXT);
      return result.toString(enc.Utf8);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error("Error de descifrado: " + error.message);
      }
      throw new Error("Error de descifrado desconocido.");
    }
  }

  throw new Error("El descifrado no está habilitado.");
}

export function generateCode(length = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
