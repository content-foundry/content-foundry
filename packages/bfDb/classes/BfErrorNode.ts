import { BfError } from "packages/BfError.ts";

export class BfErrorNode extends BfError {}

export class BfErrorNodeNotFound extends BfErrorNode {
  constructor() {
    super("Node not found");
  }
}
