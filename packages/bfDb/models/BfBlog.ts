import {
  BfNodeBase,
  type BfNodeBaseProps,
} from "packages/bfDb/classes/BfNodeBase.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import type {
  BfMetadataBase,
  BfNodeCache,
} from "packages/bfDb/classes/BfNodeBase.ts";
import type { BfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { BfErrorNotImplemented } from "packages/BfError.ts";
import { getLogger } from "packages/logger.ts";

const _logger = getLogger(import.meta);

export type BfBlogProps = {
  name: string;
};

export class BfBlog extends BfNodeBase<BfBlogProps> {
  static override findX<
    TProps extends BfNodeBaseProps,
    TThis extends typeof BfNodeBase<TProps>,
  >(
    this: TThis,
    cv: BfCurrentViewer,
    id: BfGid,
    _cache?: BfNodeCache,
  ): Promise<InstanceType<TThis>> {
    const props: BfBlogProps = {
      name: "Content Foundry blog",
    };
    if (cv.isLoggedIn) {
      props.name = "Content Foundry Blog";
    }

    const nextItem = new this(cv, props as unknown as TProps, {
      bfGid: id,
    }) as InstanceType<TThis>;
    return Promise.resolve(nextItem);
  }

  static override query<
    TProps extends BfNodeBaseProps,
    T extends BfNodeBase<TProps>,
  >(
    _cv: BfCurrentViewer,
    _metadata: BfMetadataBase,
    _props: TProps,
    _bfGids: Array<BfGid>,
    _cache?: BfNodeCache,
  ): Promise<Array<T>> {
    throw new BfErrorNotImplemented();
  }

  override save() {
    return Promise.resolve(this);
  }

  override delete() {
    return Promise.resolve(false);
  }

  override load() {
    return Promise.resolve(this);
  }
}
