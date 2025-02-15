import type { BfMetadata } from "packages/bfDb/classes/BfNodeMetadata.ts";
import { BfErrorNodeNotFound } from "packages/bfDb/classes/BfErrorNode.ts";
import { type BfGid, toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import type { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { generateUUID } from "lib/generateUUID.ts";
import { getLogger } from "packages/logger.ts";
import type { JSONValue } from "packages/bfDb/bfDb.ts";
import type { BfNode } from "packages/bfDb/coreModels/BfNode.ts";
import { BfErrorNotImplemented } from "packages/BfError.ts";

const logger = getLogger(import.meta);

export type BfNodeBaseProps = Record<string, JSONValue>;

export type BfNodeCache<
  TProps extends BfNodeBaseProps = DefaultProps,
  T extends typeof BfNodeBase<TProps> = typeof BfNodeBase,
> = Map<
  BfGid | string,
  InstanceType<T>
>;
type DefaultProps = Record<string, never>;

export class BfNodeBase<
  TProps extends BfNodeBaseProps = DefaultProps,
> {
  __typename = this.constructor.name;
  private _metadata: BfMetadata;

  static generateSortValue() {
    return `${Date.now()}`;
  }

  static generateMetadata(
    cv: BfCurrentViewer,
    metadata?: Partial<BfMetadata>,
  ): BfMetadata {
    const bfGid = toBfGid(generateUUID());
    const defaults = {
      bfGid: bfGid,
      bfOid: cv.bfOid,
      bfCid: cv.bfGid,
      className: this.name,
      createdAt: new Date(),
      lastUpdated: new Date(),
      sortValue: this.generateSortValue(),
    };
    return { ...defaults, ...metadata };
  }

  static findX<
    TProps extends BfNodeBaseProps,
    TThis extends typeof BfNodeBase<TProps>,
  >(
    this: TThis,
    _cv: BfCurrentViewer,
    _id: BfGid,
    _cache?: BfNodeCache,
  ): Promise<InstanceType<TThis>> {
    throw new BfErrorNotImplemented("Not implemented");
  }

  static query<
    TProps extends BfNodeBaseProps,
    TThis extends typeof BfNodeBase<TProps>,
  >(
    this: TThis,
    _cv: BfCurrentViewer,
    _metadata: BfMetadata,
    _props: TProps,
    _bfGids: Array<BfGid>,
    _cache: BfNodeCache,
  ): Promise<Array<InstanceType<TThis>>> {
    throw new BfErrorNotImplemented();
  }

  static async find<
    TProps extends BfNodeBaseProps,
    TThis extends typeof BfNodeBase<TProps>,
  >(
    this: TThis,
    cv: BfCurrentViewer,
    id: BfGid,
    cache?: BfNodeCache,
  ): Promise<InstanceType<TThis> | null> {
    const cachedItem = cache?.get(id);
    if (cachedItem) {
      return cachedItem as InstanceType<TThis>;
    }
    try {
      const result = await this.findX(cv, id, cache) as InstanceType<TThis>;
      if (result) {
        if (cache) {
          cache.set(id, result);
        }
        return result;
      }
    } catch (e) {
      if (e instanceof BfErrorNodeNotFound) {
        // skip
      }
      throw e;
    }
    return null;
  }

  static async __DANGEROUS__createUnattached<
    TProps extends BfNodeBaseProps,
    TThis extends typeof BfNodeBase<TProps>,
  >(
    this: TThis,
    cv: BfCurrentViewer,
    props: TProps,
    metadata?: Partial<BfMetadata>,
    cache?: BfNodeCache,
  ): Promise<InstanceType<TThis>> {
    logger.debug(
      `Creating unattached ${this.name} with props ${JSON.stringify(props)}`,
    );
    const newNode = new this(cv, props, metadata) as InstanceType<TThis>;
    await newNode.beforeCreate();
    await newNode.save();
    await newNode.afterCreate();
    logger.debug(`Created ${newNode}`);
    cache?.set(newNode.metadata.bfGid, newNode);
    return newNode;
  }

  /**
   * Don't use the constructor outside of BfNodeBase-ish classes please. Use create instead.
   */
  constructor(
    protected _currentViewer: BfCurrentViewer,
    protected _props: TProps,
    metadata?: Partial<BfMetadata>,
  ) {
    this._metadata = (this.constructor as typeof BfNodeBase).generateMetadata(
      _currentViewer,
      metadata,
    );
  }

  get cv(): BfCurrentViewer {
    return this._currentViewer;
  }

  get metadata(): BfMetadata {
    return this._metadata;
  }

  get props(): TProps {
    return this._props;
  }

  set props(props: TProps) {
    this._props = props;
  }

  isDirty(): boolean {
    return true;
  }

  toGraphql() {
    const descriptors = Object.getOwnPropertyDescriptors(this);
    const skippedKeys = ["metadata", "cv", "props"];
    const getters = Object.entries(descriptors)
      .filter(([key, descriptor]) =>
        typeof descriptor.get === "function" && !skippedKeys.includes(key)
      )
      .map(([key]) => [key, this[key as keyof this]]);

    return {
      ...this.props,
      ...Object.fromEntries(getters),
      id: this.metadata.bfGid,
      __typename: this.__typename,
    };
  }

  toString() {
    return `${this.constructor.name}#${this.metadata.bfGid}⚡️${this.metadata.bfOid}`;
  }

  save(): Promise<this> {
    throw new BfErrorNotImplemented();
  }
  delete(): Promise<boolean> {
    throw new BfErrorNotImplemented();
  }
  load(): Promise<this> {
    throw new BfErrorNotImplemented();
  }
  createTargetNode<
    TProps extends BfNodeBaseProps,
    TBfClass extends typeof BfNode<TProps>,
  >(
    _TargetBfClass: TBfClass,
    _props: TProps,
    _metadata?: BfMetadata,
  ): Promise<InstanceType<TBfClass>> {
    throw new BfErrorNotImplemented();
  }

  /** CALLBACKS */

  beforeCreate(): Promise<void> | void {}

  // beforeDelete(): Promise<void> | void {}

  // beforeLoad(): Promise<void> | void {}

  // beforeUpdate(): Promise<void> | void {}

  afterCreate(): Promise<void> | void {}

  // afterUpdate(): Promise<void> | void {}

  // afterDelete(): Promise<void> | void {}

  // validateSave(): Promise<void> | void {}

  // validatePermissions(): Promise<void> | void {}

  /** /CALLBACKS */
}
