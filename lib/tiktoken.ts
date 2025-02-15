import { python } from "@denosaurs/python";
const tiktoken = python.import("tiktoken");

export class Tiktoken {
  private static instance: any;

  private static getInstance(): any {
    if (!this.instance) {
      this.instance = python.import("tiktoken");
    }
    return this.instance;
  }

  static getEncoding(encodingName: string = "cl100k_base"): any {
    const tiktoken = this.getInstance();
    // Cache encoding instance to ensure consistency
    if (!this._encodings) {
      this._encodings = {};
    }
    if (!this._encodings[encodingName]) {
      this._encodings[encodingName] = tiktoken.get_encoding(encodingName);
    }
    return this._encodings[encodingName];
  }

  private static _encodings: Record<string, any>;

  static encode(text: string, encodingName: string = "cl100k_base"): number[] {
    const encoding = this.getEncoding(encodingName);
    // Ensure consistent array conversion from Python object
    const tokens = encoding.encode(text);
    return Array.from(tokens).map(Number);
  }

  static decode(
    tokens: number[],
    encodingName: string = "cl100k_base",
  ): string {
    const encoding = this.getEncoding(encodingName);
    // Convert Python bytes to string and remove any quotes
    const decoded = String(encoding.decode(tokens));
    return decoded.replace(/^"|"$/g, '');
  }

  static countTokens(
    text: string,
    encodingName: string = "cl100k_base",
  ): number {
    const tokens = this.encode(text, encodingName);
    return tokens.length;
  }
}
