import type { IsographEntrypoint } from '@isograph/react';
import { type BfBlog__BlogPostList__param } from './BfBlog/BlogPostList/param_type.ts';
import { type BfBlogPost__BlogPostListItem__param } from './BfBlogPost/BlogPostListItem/param_type.ts';
import { type BfCurrentViewer__Blog__param } from './BfCurrentViewer/Blog/param_type.ts';
import { type BfCurrentViewer__Home__param } from './BfCurrentViewer/Home/param_type.ts';
import { type BfCurrentViewerLoggedIn__LoggedInView__param } from './BfCurrentViewerLoggedIn/LoggedInView/param_type.ts';
import { type BfCurrentViewerLoggedIn__YcForm__param } from './BfCurrentViewerLoggedIn/YcForm/param_type.ts';
import { type BfCurrentViewerLoggedOut__DemoButton__param } from './BfCurrentViewerLoggedOut/DemoButton/param_type.ts';
import { type BfCurrentViewerLoggedOut__LoggedOutView__param } from './BfCurrentViewerLoggedOut/LoggedOutView/param_type.ts';
import { type BfCurrentViewerLoggedOut__LoginAndRegisterForm__param } from './BfCurrentViewerLoggedOut/LoginAndRegisterForm/param_type.ts';
import { type BfCurrentViewerLoggedOut__LoginButton__param } from './BfCurrentViewerLoggedOut/LoginButton/param_type.ts';
import { type BfCurrentViewerLoggedOut__RegisterButton__param } from './BfCurrentViewerLoggedOut/RegisterButton/param_type.ts';
import { type BfCurrentViewerLoggedOut__WelcomeVideo__param } from './BfCurrentViewerLoggedOut/WelcomeVideo/param_type.ts';
import { type BfOrganization__FormatterEditorPanel__param } from './BfOrganization/FormatterEditorPanel/param_type.ts';
import { type BfOrganization__FormatterEditor__param } from './BfOrganization/FormatterEditor/param_type.ts';
import { type BfOrganization__FormatterSidebar__param } from './BfOrganization/FormatterSidebar/param_type.ts';
import { type BfOrganization__HistorySidebar__param } from './BfOrganization/HistorySidebar/param_type.ts';
import { type BfOrganization__IdentityEditor__param } from './BfOrganization/IdentityEditor/param_type.ts';
import { type BfOrganization__Research__param } from './BfOrganization/Research/param_type.ts';
import { type BfOrganization__SessionsSidebar__param } from './BfOrganization/SessionsSidebar/param_type.ts';
import { type BfOrganization__Sidebar__param } from './BfOrganization/Sidebar/param_type.ts';
import { type BfOrganization__SimpleComposer__param } from './BfOrganization/SimpleComposer/param_type.ts';
import { type BfOrganization__Workshopping__param } from './BfOrganization/Workshopping/param_type.ts';
import { type BfOrganization_Identity__EditIdentity__param } from './BfOrganization_Identity/EditIdentity/param_type.ts';
import { type BfOrganization_Research__Topics__param } from './BfOrganization_Research/Topics/param_type.ts';
import { type BfOrganization_Research__Topic__param } from './BfOrganization_Research/Topic/param_type.ts';
import { type Mutation__CheckEmail__param } from './Mutation/CheckEmail/param_type.ts';
import { type Mutation__CreateVoice__param } from './Mutation/CreateVoice/param_type.ts';
import { type Mutation__GetLoginOptions__param } from './Mutation/GetLoginOptions/param_type.ts';
import { type Mutation__LoginAsDemoPerson__param } from './Mutation/LoginAsDemoPerson/param_type.ts';
import { type Mutation__Login__param } from './Mutation/Login/param_type.ts';
import { type Mutation__MakeTweets__param } from './Mutation/MakeTweets/param_type.ts';
import { type Mutation__Register__param } from './Mutation/Register/param_type.ts';
import { type Mutation__RegistrationOptions__param } from './Mutation/RegistrationOptions/param_type.ts';
import { type Mutation__SubmitYcForm__param } from './Mutation/SubmitYcForm/param_type.ts';
import { type Query__EntrypointBlogPost__param } from './Query/EntrypointBlogPost/param_type.ts';
import { type Query__EntrypointBlog__param } from './Query/EntrypointBlog/param_type.ts';
import { type Query__EntrypointContentFoundryApp__param } from './Query/EntrypointContentFoundryApp/param_type.ts';
import { type Query__EntrypointFormatterVoice__param } from './Query/EntrypointFormatterVoice/param_type.ts';
import { type Query__EntrypointFormatter__param } from './Query/EntrypointFormatter/param_type.ts';
import { type Query__EntrypointHome__param } from './Query/EntrypointHome/param_type.ts';
import { type Query__EntrypointTwitterIdeatorCompose__param } from './Query/EntrypointTwitterIdeatorCompose/param_type.ts';
import { type Query__EntrypointTwitterIdeatorVoice__param } from './Query/EntrypointTwitterIdeatorVoice/param_type.ts';
import { type Query__EntrypointTwitterIdeatorWorkshopPermalink__param } from './Query/EntrypointTwitterIdeatorWorkshopPermalink/param_type.ts';
import { type Query__EntrypointTwitterIdeatorWorkshop__param } from './Query/EntrypointTwitterIdeatorWorkshop/param_type.ts';
import { type Query__EntrypointTwitterIdeator__param } from './Query/EntrypointTwitterIdeator/param_type.ts';
import { type Query__entrypointFormatterEditor__param } from './Query/entrypointFormatterEditor/param_type.ts';
import { type Query__entrypointTwitterIdeatorResearchPermalink__param } from './Query/entrypointTwitterIdeatorResearchPermalink/param_type.ts';
import { type Query__entrypointTwitterIdeatorResearch__param } from './Query/entrypointTwitterIdeatorResearch/param_type.ts';

// This is the type given to regular client fields.
// This means that the type of the exported iso literal is exactly
// the type of the passed-in function, which takes one parameter
// of type TParam.
type IdentityWithParam<TParam extends object> = <TClientFieldReturn>(
  clientField: (param: TParam) => TClientFieldReturn
) => (param: TParam) => TClientFieldReturn;

// This is the type given it to client fields with @component.
// This means that the type of the exported iso literal is exactly
// the type of the passed-in function, which takes two parameters.
// The first has type TParam, and the second has type TComponentProps.
//
// TComponentProps becomes the types of the props you must pass
// whenever the @component field is rendered.
type IdentityWithParamComponent<TParam extends object> = <
  TClientFieldReturn,
  TComponentProps = Record<PropertyKey, never>,
>(
  clientComponentField: (data: TParam, componentProps: TComponentProps) => TClientFieldReturn
) => (data: TParam, componentProps: TComponentProps) => TClientFieldReturn;

type WhitespaceCharacter = ' ' | '\t' | '\n';
type Whitespace<In> = In extends `${WhitespaceCharacter}${infer In}`
  ? Whitespace<In>
  : In;

// This is a recursive TypeScript type that matches strings that
// start with whitespace, followed by TString. So e.g. if we have
// ```
// export function iso<T>(
//   isographLiteralText: T & MatchesWhitespaceAndString<'field Query.foo', T>
// ): Bar;
// ```
// then, when you call
// ```
// const x = iso(`
//   field Query.foo ...
// `);
// ```
// then the type of `x` will be `Bar`, both in VSCode and when running
// tsc. This is how we achieve type safety — you can only use fields
// that you have explicitly selected.
type MatchesWhitespaceAndString<
  TString extends string,
  T
> = Whitespace<T> extends `${TString}${string}` ? T : never;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfBlog.BlogPostList', T>
): IdentityWithParamComponent<BfBlog__BlogPostList__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfBlogPost.BlogPostListItem', T>
): IdentityWithParamComponent<BfBlogPost__BlogPostListItem__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfCurrentViewer.Blog', T>
): IdentityWithParamComponent<BfCurrentViewer__Blog__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfCurrentViewer.Home', T>
): IdentityWithParamComponent<BfCurrentViewer__Home__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfCurrentViewerLoggedIn.LoggedInView', T>
): IdentityWithParamComponent<BfCurrentViewerLoggedIn__LoggedInView__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfCurrentViewerLoggedIn.YcForm', T>
): IdentityWithParamComponent<BfCurrentViewerLoggedIn__YcForm__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfCurrentViewerLoggedOut.DemoButton', T>
): IdentityWithParamComponent<BfCurrentViewerLoggedOut__DemoButton__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfCurrentViewerLoggedOut.LoggedOutView', T>
): IdentityWithParamComponent<BfCurrentViewerLoggedOut__LoggedOutView__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfCurrentViewerLoggedOut.LoginAndRegisterForm', T>
): IdentityWithParamComponent<BfCurrentViewerLoggedOut__LoginAndRegisterForm__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfCurrentViewerLoggedOut.LoginButton', T>
): IdentityWithParamComponent<BfCurrentViewerLoggedOut__LoginButton__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfCurrentViewerLoggedOut.RegisterButton', T>
): IdentityWithParamComponent<BfCurrentViewerLoggedOut__RegisterButton__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfCurrentViewerLoggedOut.WelcomeVideo', T>
): IdentityWithParamComponent<BfCurrentViewerLoggedOut__WelcomeVideo__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization.FormatterEditorPanel', T>
): IdentityWithParamComponent<BfOrganization__FormatterEditorPanel__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization.FormatterEditor', T>
): IdentityWithParamComponent<BfOrganization__FormatterEditor__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization.FormatterSidebar', T>
): IdentityWithParamComponent<BfOrganization__FormatterSidebar__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization.HistorySidebar', T>
): IdentityWithParamComponent<BfOrganization__HistorySidebar__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization.IdentityEditor', T>
): IdentityWithParamComponent<BfOrganization__IdentityEditor__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization.Research', T>
): IdentityWithParamComponent<BfOrganization__Research__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization.SessionsSidebar', T>
): IdentityWithParamComponent<BfOrganization__SessionsSidebar__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization.Sidebar', T>
): IdentityWithParamComponent<BfOrganization__Sidebar__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization.SimpleComposer', T>
): IdentityWithParamComponent<BfOrganization__SimpleComposer__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization.Workshopping', T>
): IdentityWithParamComponent<BfOrganization__Workshopping__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization_Identity.EditIdentity', T>
): IdentityWithParamComponent<BfOrganization_Identity__EditIdentity__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization_Research.Topics', T>
): IdentityWithParamComponent<BfOrganization_Research__Topics__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field BfOrganization_Research.Topic', T>
): IdentityWithParamComponent<BfOrganization_Research__Topic__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Mutation.CheckEmail', T>
): IdentityWithParam<Mutation__CheckEmail__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Mutation.CreateVoice', T>
): IdentityWithParam<Mutation__CreateVoice__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Mutation.GetLoginOptions', T>
): IdentityWithParam<Mutation__GetLoginOptions__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Mutation.LoginAsDemoPerson', T>
): IdentityWithParam<Mutation__LoginAsDemoPerson__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Mutation.Login', T>
): IdentityWithParam<Mutation__Login__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Mutation.MakeTweets', T>
): IdentityWithParam<Mutation__MakeTweets__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Mutation.Register', T>
): IdentityWithParamComponent<Mutation__Register__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Mutation.RegistrationOptions', T>
): IdentityWithParam<Mutation__RegistrationOptions__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Mutation.SubmitYcForm', T>
): IdentityWithParam<Mutation__SubmitYcForm__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointBlogPost', T>
): IdentityWithParam<Query__EntrypointBlogPost__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointBlog', T>
): IdentityWithParam<Query__EntrypointBlog__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointContentFoundryApp', T>
): IdentityWithParam<Query__EntrypointContentFoundryApp__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointFormatterVoice', T>
): IdentityWithParam<Query__EntrypointFormatterVoice__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointFormatter', T>
): IdentityWithParam<Query__EntrypointFormatter__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointHome', T>
): IdentityWithParam<Query__EntrypointHome__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointTwitterIdeatorCompose', T>
): IdentityWithParam<Query__EntrypointTwitterIdeatorCompose__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointTwitterIdeatorVoice', T>
): IdentityWithParam<Query__EntrypointTwitterIdeatorVoice__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointTwitterIdeatorWorkshopPermalink', T>
): IdentityWithParam<Query__EntrypointTwitterIdeatorWorkshopPermalink__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointTwitterIdeatorWorkshop', T>
): IdentityWithParam<Query__EntrypointTwitterIdeatorWorkshop__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.EntrypointTwitterIdeator', T>
): IdentityWithParam<Query__EntrypointTwitterIdeator__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.entrypointFormatterEditor', T>
): IdentityWithParam<Query__entrypointFormatterEditor__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.entrypointTwitterIdeatorResearchPermalink', T>
): IdentityWithParam<Query__entrypointTwitterIdeatorResearchPermalink__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.entrypointTwitterIdeatorResearch', T>
): IdentityWithParam<Query__entrypointTwitterIdeatorResearch__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Mutation.CheckEmail', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Mutation.CreateVoice', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Mutation.GetLoginOptions', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Mutation.LoginAsDemoPerson', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Mutation.Login', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Mutation.MakeTweets', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Mutation.Register', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Mutation.RegistrationOptions', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Mutation.SubmitYcForm', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointBlogPost', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointBlog', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointContentFoundryApp', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointFormatterVoice', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointFormatter', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointHome', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointTwitterIdeatorCompose', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointTwitterIdeatorVoice', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointTwitterIdeatorWorkshopPermalink', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointTwitterIdeatorWorkshop', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.EntrypointTwitterIdeator', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.entrypointFormatterEditor', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.entrypointTwitterIdeatorResearchPermalink', T>
): void;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.entrypointTwitterIdeatorResearch', T>
): void;

export function iso(_isographLiteralText: string):
  | IdentityWithParam<any>
  | IdentityWithParamComponent<any>
  | IsographEntrypoint<any, any>
{
  return (clientFieldResolver: any) => clientFieldResolver;
}