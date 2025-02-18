import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfStoryBank__CreateVoice__param } from './param_type.ts';
import { CreateVoice as resolver } from '../../../../components/BfStoryBank/CreateVoice.tsx';

const readerAst: ReaderAst<BfStoryBank__CreateVoice__param> = [
  {
    kind: "Scalar",
    fieldName: "__typename",
    alias: null,
    arguments: null,
  },
];

const artifact: ComponentReaderArtifact<
  BfStoryBank__CreateVoice__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  componentName: "BfStoryBank.CreateVoice",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
