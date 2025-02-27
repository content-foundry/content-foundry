import { colors, colorsDark, fonts } from "packages/bfDs/const.tsx";
import { getLogger } from "packages/logger.ts";
const _logger = getLogger(import.meta);

const varsString = Object.entries({ ...colors, ...fonts }).reduce(
  (acc, [key, value]) => {
    acc += `--${key}: ${value};\n`;
    return acc;
  },
  "",
);
const varsDarkString = Object.entries({ ...colorsDark }).reduce(
  (acc, [key, value]) => {
    acc += `--${key}: ${value};\n`;
    return acc;
  },
  "",
);

const cssVarsString = `:root {\n${varsString}}\n`;
const cssVarsDarkString = `:root[data-theme=dark] {\n${varsDarkString}}\n`;

type Props = React.PropsWithChildren<{
  environment: Record<string, unknown>;
  headerElement: React.ReactNode;
}>;

/*
 * This only runs on the server!!!! It should never run on the client.
 */
export function ServerRenderedPage(
  { children, environment, headerElement }: Props,
) {
  // logger.info(cssVarsString, cssVarsDarkString)
  return (
    <html lang="en">
      <head>
        {headerElement}
        <style
          dangerouslySetInnerHTML={{
            __html: cssVarsString + cssVarsDarkString,
          }}
        />
        <link rel="stylesheet" href="/static/marketingpagestyle.css" />
        <link rel="stylesheet" href="/static/bfDsStyle.css" />
        <link rel="stylesheet" href="/static/blogStyle.css" />
        <link rel="stylesheet" href="/static/appStyle.css" />
        <link rel="stylesheet" href="/static/toolsStyle.css" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono&family=DM+Sans:wght@200;400;500;700&family=Bebas+Neue&display=swap&family=Roboto:wght@300&display=swap"
          rel="stylesheet"
        />
        <link
          rel="shortcut icon"
          type="image/jpg"
          href="https://bf-static-assets.s3.amazonaws.com/favicon.ico"
        />
        <script type="module" src="/static/build/packages/app/ClientRoot.js" />
      </head>
      <body>
        <div id="root">
          {children}
        </div>
        <div id="modal-root" className="portalRoot"></div>
        <div id="tooltip-root" className="portalRoot"></div>
        <div id="toast-root" className="portalRoot"></div>
        <div id="staging-root" className="portalRoot"></div>
        <script
          type="module"
          defer
          dangerouslySetInnerHTML={{
            __html: `globalThis.__ENVIRONMENT__ = ${
              JSON.stringify(environment ?? {})
            };

          if (globalThis.__REHYDRATE__) {
            console.debug("Trying to rehydrate");
            await globalThis.__REHYDRATE__(globalThis.__ENVIRONMENT__);
          } else {
            // can't rehydrate yet.
            console.warn("Rehydration fail");
          }`,
          }}
        />
      </body>
    </html>
  );
}
