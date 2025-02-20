import {
  type BfMetadataBase,
  BfNodeBase,
  type BfNodeBaseProps,
  type BfNodeCache,
} from "packages/bfDb/classes/BfNodeBase.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { type BfGid, toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { BfErrorNotImplemented } from "packages/BfError.ts";
import { getLogger } from "packages/logger.ts";
import { bfGetItem, bfPutItem, bfQueryItems } from "packages/bfDb/bfDb.ts";
import { BfErrorNodeNotFound } from "packages/bfDb/classes/BfErrorNode.ts";
import { generateUUID } from "lib/generateUUID.ts";

const logger = getLogger(import.meta);

export type BfMetadataNode = BfMetadataBase & {
  /** Creator ID */
  bfCid: BfGid;
  createdAt: Date;
  lastUpdated: Date;
  sortValue: string;
};

/**
 * talks to the database with graphql stuff
 */
export class BfNode<
  TProps extends BfNodeBaseProps = BfNodeBaseProps,
  TMetadata extends BfMetadataNode = BfMetadataNode,
> extends BfNodeBase<TProps, TMetadata> {
  protected _serverProps: TProps;
  protected _clientProps: Partial<TProps> = {};

  static override generateMetadata<TGenerationMetadata>(
    cv: BfCurrentViewer,
    metadata?: Partial<TGenerationMetadata>,
  ) {
    const bfGid = toBfGid(generateUUID());
    const defaults = {
      bfGid: bfGid,
      bfOid: cv.bfOid,
      bfCid: cv.bfGid,
      className: this.name,
      createdAt: new Date(),
      lastUpdated: new Date(),
      sortValue: this.generateSortValue(),
    } as TGenerationMetadata;
    return { ...defaults, ...metadata } as TGenerationMetadata;
  }

  static override async findX<
    TProps extends BfNodeBaseProps,
    TThis extends typeof BfNodeBase<TProps>,
  >(
    this: TThis,
    cv: BfCurrentViewer,
    id: BfGid,
    cache?: BfNodeCache,
  ) {
    logger.debug(`findX: ${this.name} ${id} ${cv}`);
    const itemFromCache = cache?.get(id);
    if (itemFromCache) {
      return itemFromCache as InstanceType<TThis>;
    }
    const itemFromDb = await bfGetItem(cv.bfOid, id);
    logger.debug(itemFromDb);
    if (!itemFromDb) {
      logger.debug("couldn't find item", cv.bfOid, id);
      throw new BfErrorNodeNotFound();
    }
    const item = new this(cv, itemFromDb.props as TProps, itemFromDb.metadata);
    cache?.set(id, item);
    return item as InstanceType<TThis>;
  }

  static override async query<
    TProps extends BfNodeBaseProps,
    TThis extends typeof BfNodeBase<TProps>,
    TMetadata extends BfMetadataNode = BfMetadataNode,
  >(
    this: TThis,
    cv: BfCurrentViewer,
    metadata: Partial<TMetadata>,
    props?: Partial<TProps>,
    bfGids?: Array<BfGid>,
    cache?: BfNodeCache,
  ): Promise<Array<InstanceType<TThis>>> {
    const items = await bfQueryItems(metadata, props, bfGids);
    return items.map((item) => {
      const instance = new this(cv, item.props as TProps, item.metadata);
      cache?.set(item.metadata.bfGid, instance);
      return instance as InstanceType<TThis>;
    });
  }

  constructor(
    protected override _currentViewer: BfCurrentViewer,
    protected override _props: TProps,
    metadata?: Partial<TMetadata>,
  ) {
    super(_currentViewer, _props, metadata);
    this._serverProps = _props;
  }

  override get props(): TProps {
    return { ...this._serverProps, ...this._clientProps };
  }

  override set props(props: Partial<TProps>) {
    this._clientProps = props;
  }

  override isDirty() {
    return Object.keys(this._clientProps).some((key) => {
      return this._clientProps[key] !== this._serverProps[key];
    });
  }

  override async save() {
    logger.debug(`Saving ${this}`, this.props, this.metadata);
    await bfPutItem(this.props, this.metadata);
    this._serverProps = this.props;
    this._clientProps = {};
    return this;
  }

  override delete(): Promise<boolean> {
    throw new BfErrorNotImplemented();
  }
  override async load(): Promise<this> {
    const _item = await bfGetItem(this.cv.bfOid, this.metadata.bfGid);
    throw new BfErrorNotImplemented();
    // return this;
  }

  /**
   * Create a new “Target Node” and automatically link it to `this` with a BfEdge row.
   *
   * By default, we store `role` in the Edge’s props, in case you need to label the relationship.
   */
  override async createTargetNode<
    TTargetProps extends BfNodeBaseProps,
    TTargetMetadata extends BfMetadataNode,
    TTargetBfClass extends typeof BfNode<TTargetProps, TTargetMetadata>,
  >(
    TargetBfClass: TTargetBfClass,
    props: TTargetProps,
    metadata?: TTargetMetadata,
    role?: string, // optional label for the relationship
  ): Promise<InstanceType<TTargetBfClass>> {
    logger.debug("createTargetNode called", {
      targetClassName: TargetBfClass.name,
      sourceId: this.metadata.bfGid,
      role,
    });

    // 1) Create the new node (unattached).
    const targetNode = await TargetBfClass.__DANGEROUS__createUnattached(
      this.cv,
      props,
      metadata,
    );

    const { BfEdge } = await import("packages/bfDb/coreModels/BfEdge.ts");

    // 2) Create the edge in bfdb
    await BfEdge.createBetweenNodes(this.cv, this, targetNode, role);

    logger.debug("Edge created successfully", {
      sourceId: this.metadata.bfGid,
      targetId: targetNode.metadata.bfGid,
      role,
    });

    return targetNode as InstanceType<TTargetBfClass>;
  }
}
