import { getLogger } from "packages/logger.ts";
import { type BfGid, toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
  WebAuthnCredential,
} from "@simplewebauthn/server";
// deno-lint-ignore no-external-import
import { Buffer } from "node:buffer";
import { BfPerson } from "packages/bfDb/models/BfPerson.ts";
import jwt from "jsonwebtoken";

const JWT_SECRET = Buffer.from("content-foundry-secret-key");
const JWT_EXPIRES_IN = "1h";
const REFRESH_TOKEN_EXPIRES_IN = "7d"; // Example refresh token expiration

function generateToken(sub: string, expiresIn: string): string {
  return jwt.sign({ sub }, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export type StorableCredential = Omit<WebAuthnCredential, "publicKey"> & {
  publicKey: string;
  backedUp: boolean;
};

function generateTokens(
  sub: string,
): { accessToken: string; refreshToken: string } {
  const accessToken = generateToken(sub, JWT_EXPIRES_IN);
  const refreshToken = generateToken(sub, REFRESH_TOKEN_EXPIRES_IN);
  return { accessToken, refreshToken };
}

function verifyAccessToken(token: string): { sub: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string };
  } catch {
    return null;
  }
}

function verifyRefreshToken(token: string): { sub: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string };
  } catch {
    return null;
  }
}

export type CurrentViewerTypenames =
  | "BfCurrentViewerLoggedIn"
  | "BfCurrentViewerLoggedOut";

const logger = getLogger(import.meta);

export abstract class BfCurrentViewer {
  __typename: CurrentViewerTypenames;

  static setLoginSuccessHeaders(responseHeaders: Headers, bfGid: string) {
    const { accessToken, refreshToken } = generateTokens(bfGid);
    responseHeaders.set(
      "Set-Cookie",
      `bfgat=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=900`,
    );
    responseHeaders.set(
      "Set-Cookie",
      `bfgrt=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${604800}`,
    ); //7 days in seconds
  }

  get id() {
    return `${this.constructor.name}#${this.bfGid}⚡️${this.bfOid}`;
  }
  static createFromRequest(
    importMeta: ImportMeta,
    request: Request,
    responseHeaders: Headers,
  ) {
    logger.debug("Creating viewer from request");
    const accessToken = request.headers.get("Cookie")?.match(/bfgat=([^;]+)/)
      ?.[1];
    const refreshToken = request.headers.get("Cookie")?.match(/bfgrt=([^;]+)/)
      ?.[1];

    logger.debug("Found tokens", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });
    let tokenResult = accessToken ? verifyAccessToken(accessToken) : null;
    logger.debug("Verified access token result", {
      hasTokenResult: !!tokenResult,
    });

    if (!tokenResult && refreshToken) {
      const refreshResult = verifyRefreshToken(refreshToken);
      if (refreshResult) {
        // Generate new tokens if refresh token is valid
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          generateTokens(refreshResult.sub);
        responseHeaders.set(
          "Set-Cookie",
          `bfgat=${newAccessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=900`,
        );
        responseHeaders.set(
          "Set-Cookie",
          `bfgrt=${newRefreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${604800}`,
        ); //7 days in seconds

        tokenResult = refreshResult;
      }
    }

    const userLoggedIn = !!tokenResult;

    if (!userLoggedIn) {
      responseHeaders.set(
        "Set-Cookie",
        "bfgat=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
      );
      responseHeaders.set(
        "Set-Cookie",
        "bfgrt=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
      );
    }

    if (userLoggedIn) {
      const userId = tokenResult!.sub;
      const cv = BfCurrentViewerLoggedIn
        .__PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(
          importMeta,
          toBfGid(userId),
          toBfGid(userId),
        );

      return cv;
    }
    return BfCurrentViewerLoggedOut.__PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(
      importMeta,
    );
  }

  static async createFromLoginOptions(
    importMeta: ImportMeta,
    email: string,
    options: AuthenticationResponseJSON,
    responseHeaders: Headers,
  ) {
    return await BfCurrentViewerLoggedIn.createFromLoginOptions(
      importMeta,
      email,
      options,
      responseHeaders,
    );
  }

  static async createFromRegistrationResponse(
    importMeta: ImportMeta,
    registrationResponseJSON: RegistrationResponseJSON,
    email: string,
    responseHeaders: Headers,
  ) {
    return await BfCurrentViewerLoggedIn.createFromRegistrationResponse(
      importMeta,
      registrationResponseJSON,
      email,
      responseHeaders,
    );
  }

  static createForDemo(importMeta: ImportMeta, responseHeaders: Headers) {
    const id = toBfGid("DEMO");

    BfCurrentViewer.setLoginSuccessHeaders(
      responseHeaders,
      id,
    );
    return BfCurrentViewerLoggedIn.__PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(
      importMeta,
      id,
      id,
    );
  }
  static __DANGEROUS_USE_IN_SCRIPTS_ONLY__createOmni(importMeta: ImportMeta) {
    logger.warn(`Creating omnivc from: ${importMeta.url}`);
    return BfCurrentViewer__DANGEROUS__OMNI__
      .__PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(importMeta);
  }
  static __DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
    importMeta: ImportMeta,
    bfGid: string | BfGid,
    bfOid: string | BfGid,
  ) {
    logger.warn(`Creating Logged in user: ${importMeta.url}`);
    return BfCurrentViewerLoggedIn.__PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(
      importMeta,
      toBfGid(bfGid),
      toBfGid(bfOid),
    );
  }
  static __DANGEROUS_USE_IN_REGISTRATION_ONLY__createCvForRegistration(
    importMeta: ImportMeta,
    email: string,
  ) {
    return BfCurrentViewerForRegistration
      .__PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(
        importMeta,
        toBfGid(email),
      );
  }

  static createLoggedOut(
    importMeta: ImportMeta,
  ) {
    logger.warn(`Creating Logged in user: ${import.meta.url}`);
    return BfCurrentViewerLoggedOut.__PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(
      importMeta,
    );
  }
  static __DANGEROUS__createFromEmail(
    importMeta: ImportMeta,
    email: string,
  ) {
    return BfCurrentViewerLoggedIn
      .__PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(
        importMeta,
        toBfGid(email),
        toBfGid(email),
      );
  }
  static __DANGEROUS__createFromBfGid(
    importMeta: ImportMeta,
    bfGid: string,
    bfOid: string,
  ) {
    return BfCurrentViewerLoggedIn.__PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(
      importMeta,
      toBfGid(bfGid),
      toBfGid(bfOid),
    );
  }
  clear() {}

  protected constructor(
    readonly creator: ImportMeta, // the import.meta of the module that created the current viewer
    readonly bfGid: BfGid, // person for whom the access token was created
    readonly bfOid: BfGid, // always an owner, used to determine access control
  ) {
    this.__typename = this.constructor.name as CurrentViewerTypenames;
  }

  toGraphql() {
    return {
      __typename: this.constructor.name as CurrentViewerTypenames,
      id: this.bfGid,
    };
  }

  toString() {
    return this.id;
  }
  get isLoggedIn(): boolean {
    return false;
  }
}

export class BfCurrentViewerLoggedOut extends BfCurrentViewer {
  protected constructor(
    override readonly creator: ImportMeta, // the import.meta of the module that created the current viewer
  ) {
    super(creator, toBfGid("ANON"), toBfGid("ANON"));
  }

  static __PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(creator: ImportMeta) {
    return new this(creator);
  }
  override get isLoggedIn(): boolean {
    return false;
  }
}

class BfCurrentViewerLoggedIn extends BfCurrentViewer {
  static __PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(
    creator: ImportMeta,
    bfGid: BfGid,
    bfOid: BfGid,
  ) {
    return new this(creator, bfGid, bfOid);
  }

  static override async createFromLoginOptions(
    creator: ImportMeta,
    email: string,
    response: AuthenticationResponseJSON,
    responseHeaders: Headers,
  ) {
    const cv = BfCurrentViewer
      .__DANGEROUS_USE_IN_REGISTRATION_ONLY__createCvForRegistration(
        creator,
        email,
      );
    const person = await BfPerson.verifyLogin(cv, email, response);

    if (!person) {
      responseHeaders.set(
        "Set-Cookie",
        "bfgat=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
      );
      responseHeaders.set(
        "Set-Cookie",
        "bfgrt=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
      );
      return BfCurrentViewerLoggedOut
        .__PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(creator);
    }
    const nextCv = new this(
      creator,
      person.metadata.bfGid,
      person.metadata.bfOid,
    );
    BfCurrentViewer.setLoginSuccessHeaders(
      responseHeaders,
      person.metadata.bfGid,
    );
    return nextCv;
  }
  static override async createFromRegistrationResponse(
    creator: ImportMeta,
    registrationResponseJSON: RegistrationResponseJSON,
    email: string,
    responseHeaders: Headers,
  ) {
    const bfGid = toBfGid(email);

    const person = await BfPerson.register(registrationResponseJSON, email);

    if (!person) {
      responseHeaders.set(
        "Set-Cookie",
        "bfgat=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
      );
      responseHeaders.set(
        "Set-Cookie",
        "bfgrt=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
      );
      return BfCurrentViewerLoggedOut
        .__PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(creator);
    }
    const nextCv = new this(
      creator,
      person.metadata.bfGid,
      person.metadata.bfOid,
    );
    BfCurrentViewer.setLoginSuccessHeaders(responseHeaders, bfGid);
    return nextCv;
  }
  override get isLoggedIn(): boolean {
    return true;
  }
}

export class BfCurrentViewerForRegistration extends BfCurrentViewerLoggedIn {
  static override __PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(
    creator: ImportMeta,
    emailString: string,
  ) {
    const bfGid = toBfGid(emailString);
    return new this(creator, bfGid, bfGid);
  }
  override get isLoggedIn(): boolean {
    return false;
  }
}

class BfCurrentViewer__DANGEROUS__OMNI__ extends BfCurrentViewer {
  static __PROBABLY_DONT_USE_THIS_VERY_OFTEN__create(creator: ImportMeta) {
    return new this(creator, toBfGid("OMNI"), toBfGid("OMNI"));
  }
  override get isLoggedIn(): boolean {
    return true;
  }
}
