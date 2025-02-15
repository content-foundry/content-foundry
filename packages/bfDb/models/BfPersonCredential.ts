import { getLogger } from "packages/logger.ts";
import { BfNode } from "packages/bfDb/coreModels/BfNode.ts";

const _logger = getLogger(import.meta);

type Base64URLString = string;

export type BfPersonCredentialProps = {
  id: Base64URLString;
  // publicKey: Uint8Array;
  // user: UserModel;
  webauthnUserID: Base64URLString;
  counter: number;
  // deviceType: CredentialDeviceType;
  backedUp: boolean;
  // transports?: Array<AuthenticatorTransportFuture>;
};

export class BfPersonCredential extends BfNode<BfPersonCredentialProps> {}
