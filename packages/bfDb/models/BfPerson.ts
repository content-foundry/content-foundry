import { BfNode } from "packages/bfDb/coreModels/BfNode.ts";
import { getLogger } from "packages/logger.ts";
import {
  BfCurrentViewer,
  type StorableCredential,
} from "packages/bfDb/classes/BfCurrentViewer.ts";
import { BfError } from "packages/BfError.ts";
import {
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  type RegistrationResponseJSON,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type WebAuthnCredential,
} from "@simplewebauthn/server";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { BfErrorNodeNotFound } from "packages/bfDb/classes/BfErrorNode.ts";

import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { getConfigurationVariable } from "packages/getConfigurationVariable.ts";

const logger = getLogger(import.meta);
const rpID = getConfigurationVariable("RPID") ??
  getConfigurationVariable("REPLIT_DEV_DOMAIN");

/**
 * Helper to correctly Base64URL-decode into raw bytes.
 */
function fromBase64(base64: string): Uint8Array {
  return isoBase64URL.toBuffer(base64);
}

/**
 * Helper to correctly Base64URL-encode a byte array.
 */
function toBase64(bytes: Uint8Array): string {
  return isoBase64URL.fromBuffer(bytes);
}

// #techdebt :(
type StorableRegistrationResponse = any;
type StorableAuthenticationResponse = any;

export type BfPersonProps = {
  name: string;
  registrationOptions?: StorableRegistrationResponse;
  credential?: StorableCredential;
  authenticationOptions?: StorableAuthenticationResponse;
};

export class BfPerson extends BfNode<BfPersonProps> {
  static findCurrentViewer(cv: BfCurrentViewer): Promise<BfPerson> {
    return this.findX(cv, cv.bfGid);
  }

  static async generateRegistrationOptionsForGraphql(email: string) {
    logger.debug("Generating registration options for graphql");

    // Create a temporary BfCurrentViewer for registration
    const cv = BfCurrentViewer
      .__DANGEROUS_USE_IN_REGISTRATION_ONLY__createCvForRegistration(
        import.meta,
        email,
      );

    const person = await BfPerson.__DANGEROUS__createUnattached(cv, {
      name: email,
    });

    const userID = new Uint8Array(new TextEncoder().encode(email));
    if (!rpID || !userID) {
      throw new BfError(
        "Can't generate registration options for graphql: missing rpID or userID",
      );
    }

    logger.debug("Generating registration options for graphql", {
      rpID,
      userID,
    });

    const userName = person.props.name;
    const result = await generateRegistrationOptions({
      rpName: "Content Foundry",
      rpID,
      userName,
      userID, // Make sure we pass userID so the authenticator knows who we're registering
    });

    const registrationOptions = JSON.parse(JSON.stringify(result));

    // Store the generated options for later verification
    person.props = { ...person.props, registrationOptions };
    await person.save();

    return { regOptions: result, person };
  }

  static async register(
    registrationResponse: RegistrationResponseJSON,
    email: string,
  ) {
    if (!rpID) {
      throw new BfError("Implement rpID please!");
    }

    // Rebuild a viewer for the (not-yet-existing) user
    const currentViewer = BfCurrentViewer
      .__DANGEROUS_USE_IN_REGISTRATION_ONLY__createCvForRegistration(
        import.meta,
        email,
      );

    // Find the newly-created Person that stored the registrationOptions
    const person = await BfPerson.findByEmail(currentViewer, email);
    if (!person || !person.props.registrationOptions) {
      throw new BfErrorNodeNotFound(
        "Missing Person or Person’s registration options",
      );
    }

    const priorOptions = person.props.registrationOptions;
    const verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: priorOptions.challenge as string,
      expectedOrigin: `https://${rpID}`,
      expectedRPID: rpID,
    });

    const { verified, registrationInfo } = verification;
    if (!verified || !registrationInfo) {
      logger.error("Registration verification failed", verification);
      throw new BfError("Registration failed!");
    }

    // registrationInfo contains important credential data
    const { credential, credentialBackedUp } = registrationInfo;

    // Convert the raw credential's publicKey from a Buffer into a base64 string
    const storableCredential: StorableCredential = {
      id: credential.id,
      publicKey: toBase64(credential.publicKey),
      transports: credential.transports,
      counter: credential.counter,
      backedUp: credentialBackedUp,
    };

    person.props = { ...person.props, credential: storableCredential };

    logger.debug("Saving newly registered person", {
      personPropsBefore: person.props,
    });
    await person.save();
    logger.debug("Saved person", {
      personPropsAfter: person.props,
    });

    // Return a fresh instance of the person with the updated CV
    return person;
  }

  static async generateAuthenticationOptionsForGraphql(email: string) {
    if (!rpID) {
      throw new BfError(
        "Can't generate authentication options for graphql: missing rpID",
      );
    }

    // Look up the Person so we can retrieve the existing credential ID, if any
    const cv = BfCurrentViewer
      .__DANGEROUS_USE_IN_REGISTRATION_ONLY__createCvForRegistration(
        import.meta,
        email,
      );
    const person = await BfPerson.findByEmail(cv, email);

    if (!person?.props.credential) {
      throw new BfError(
        "Can't generate authentication options for graphql: no credential available",
      );
    }

    let allowCredentials: {
      id: string;
      type: "public-key";
      transports?: AuthenticatorTransportFuture[];
    }[] = [];
    if (person?.props.credential?.id) {
      // Base64URL-decode the credential ID so the client can select the correct credential
      allowCredentials = [{
        id: person.props.credential.id,
        type: "public-key",
        transports: person.props.credential.transports ?? [],
      }];
    }

    const result = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
    });

    person.props = { ...person.props, authenticationOptions: result };
    await person.save();

    return result;
  }

  static async verifyLogin(
    cv: BfCurrentViewer,
    email: string,
    response: AuthenticationResponseJSON,
  ) {
    const person = await BfPerson.findByEmail(cv, email);
    if (!person?.props.authenticationOptions || !rpID) {
      throw new BfError("No authentication options found or missing rpID");
    }

    const currentOptions = person.props.authenticationOptions;
    const credentialFromProps = person.props.credential;
    if (!credentialFromProps) {
      throw new BfError("No credential found for user");
    }

    // Decode the stored public key from base64
    const storedPublicKey = fromBase64(credentialFromProps.publicKey as string);

    const credential: WebAuthnCredential = {
      publicKey: storedPublicKey,
      transports: credentialFromProps.transports as AuthenticatorTransport[],
      counter: credentialFromProps.counter as number,
      id: credentialFromProps.id as string,
    };

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: currentOptions.challenge as string,
        expectedOrigin: `https://${rpID}`,
        expectedRPID: rpID,
        credential,
      });
    } catch (e) {
      logger.error("Authentication verification error:", e);
      return false;
    }

    const { verified, authenticationInfo } = verification;
    if (verified && authenticationInfo) {
      // Update the counter to help detect cloned credentials
      credentialFromProps.counter = authenticationInfo.newCounter;
      person.props.credential = credentialFromProps;
      await person.save();
    }

    return person;
  }

  static async findByEmail(
    cv: BfCurrentViewer,
    email: string,
  ): Promise<BfPerson | null> {
    const results = await this.query(cv, { bfCid: toBfGid(email) });
    return results[0] ?? null;
  }
}
