import type {ComponentReaderArtifact, ExtractSecondParam, ReaderAst } from '@isograph/react';
import { BfOrganization__FormatterEditor__param } from './param_type.ts';
import { FormatterEditor as resolver } from '../../../../components/BfOrganization/FormatterEditor.tsx';
import BfOrganization__BlogRevisionsSidebar__resolver_reader from '../../BfOrganization/BlogRevisionsSidebar/resolver_reader.ts';
import BfOrganization__FormatterEditorPanel__resolver_reader from '../../BfOrganization/FormatterEditorPanel/resolver_reader.ts';
import BfOrganization__FormatterSidebar__resolver_reader from '../../BfOrganization/FormatterSidebar/resolver_reader.ts';

const readerAst: ReaderAst<BfOrganization__FormatterEditor__param> = [
  {
    kind: "Resolver",
    alias: "FormatterSidebar",
    arguments: null,
    readerArtifact: BfOrganization__FormatterSidebar__resolver_reader,
    usedRefetchQueries: [],
  },
  {
    kind: "Resolver",
    alias: "FormatterEditorPanel",
    arguments: null,
    readerArtifact: BfOrganization__FormatterEditorPanel__resolver_reader,
    usedRefetchQueries: [],
  },
  {
    kind: "Resolver",
    alias: "BlogRevisionsSidebar",
    arguments: null,
    readerArtifact: BfOrganization__BlogRevisionsSidebar__resolver_reader,
    usedRefetchQueries: [],
  },
];

const artifact: ComponentReaderArtifact<
  BfOrganization__FormatterEditor__param,
  ExtractSecondParam<typeof resolver>
> = {
  kind: "ComponentReaderArtifact",
  fieldName: "BfOrganization.FormatterEditor",
  resolver,
  readerAst,
  hasUpdatable: false,
};

export default artifact;
