import { BfError } from "packages/BfError.ts";

export class BfErrorNode extends BfError {}

export class BfErrorNodeNotFound extends BfErrorNode {
  constructor(message = "Node not found") {
    super(message);
  }
}
