import 'piccolore';
import { p as decodeKey } from './chunks/astro/server_CLGJxpjn.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_CqaTxOHT.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/fher/atlassian/repo/her-family/","cacheDir":"file:///Users/fher/atlassian/repo/her-family/node_modules/.astro/","outDir":"file:///Users/fher/atlassian/repo/her-family/dist/","srcDir":"file:///Users/fher/atlassian/repo/her-family/src/","publicDir":"file:///Users/fher/atlassian/repo/her-family/public/","buildClientDir":"file:///Users/fher/atlassian/repo/her-family/dist/client/","buildServerDir":"file:///Users/fher/atlassian/repo/her-family/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.BFrhQPyY.css"},{"type":"inline","content":"body{font-family:Inter,system-ui,sans-serif}\n"}],"routeData":{"route":"/admin","isIndex":true,"type":"page","pattern":"^\\/admin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/index.astro","pathname":"/admin","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/comments","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/comments\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"comments","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/comments.ts","pathname":"/api/admin/comments","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/content","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/content\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"content","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/content.ts","pathname":"/api/admin/content","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/login","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/login\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/login.ts","pathname":"/api/admin/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/status","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/status\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"status","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/status.ts","pathname":"/api/admin/status","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/comments","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/comments\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"comments","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/comments.ts","pathname":"/api/comments","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/delete-image","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/delete-image\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"delete-image","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/delete-image.ts","pathname":"/api/delete-image","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/gallery/add","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/gallery\\/add\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"gallery","dynamic":false,"spread":false}],[{"content":"add","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/gallery/add.ts","pathname":"/api/gallery/add","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/gallery/delete","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/gallery\\/delete\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"gallery","dynamic":false,"spread":false}],[{"content":"delete","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/gallery/delete.ts","pathname":"/api/gallery/delete","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/gallery/update-order","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/gallery\\/update-order\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"gallery","dynamic":false,"spread":false}],[{"content":"update-order","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/gallery/update-order.ts","pathname":"/api/gallery/update-order","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/upload-image","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/upload-image\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"upload-image","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/upload-image.ts","pathname":"/api/upload-image","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.BFrhQPyY.css"},{"type":"inline","content":"body{font-family:Inter,system-ui,sans-serif}.font-display[data-astro-cid-sckkx6r4]{font-family:Playfair Display,Georgia,serif}body.hide-edit-buttons .edit-button{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}body:not(.hide-edit-buttons) .edit-button{visibility:visible!important;pointer-events:auto!important}body:not(.hide-edit-buttons) button.edit-button[class*=inline-flex]{display:inline-flex!important}body:not(.hide-edit-buttons) button.edit-button[class*=absolute]{display:block!important}\n"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/fher/atlassian/repo/her-family/src/pages/admin/index.astro",{"propagation":"none","containsHead":true}],["/Users/fher/atlassian/repo/her-family/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/admin/index@_@astro":"pages/admin.astro.mjs","\u0000@astro-page:src/pages/api/admin/comments@_@ts":"pages/api/admin/comments.astro.mjs","\u0000@astro-page:src/pages/api/admin/content@_@ts":"pages/api/admin/content.astro.mjs","\u0000@astro-page:src/pages/api/admin/login@_@ts":"pages/api/admin/login.astro.mjs","\u0000@astro-page:src/pages/api/admin/status@_@ts":"pages/api/admin/status.astro.mjs","\u0000@astro-page:src/pages/api/comments@_@ts":"pages/api/comments.astro.mjs","\u0000@astro-page:src/pages/api/delete-image@_@ts":"pages/api/delete-image.astro.mjs","\u0000@astro-page:src/pages/api/gallery/add@_@ts":"pages/api/gallery/add.astro.mjs","\u0000@astro-page:src/pages/api/gallery/delete@_@ts":"pages/api/gallery/delete.astro.mjs","\u0000@astro-page:src/pages/api/gallery/update-order@_@ts":"pages/api/gallery/update-order.astro.mjs","\u0000@astro-page:src/pages/api/upload-image@_@ts":"pages/api/upload-image.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_C0bftEMW.mjs","/Users/fher/atlassian/repo/her-family/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_B7poyGk_.mjs","/Users/fher/atlassian/repo/her-family/src/pages/admin/index.astro?astro&type=script&index=2&lang.ts":"_astro/index.astro_astro_type_script_index_2_lang.CxO_JRN6.js","/Users/fher/atlassian/repo/her-family/src/pages/admin/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.D0ob6iFC.js","/Users/fher/atlassian/repo/her-family/src/pages/admin/index.astro?astro&type=script&index=1&lang.ts":"_astro/index.astro_astro_type_script_index_1_lang.Da_uyOmc.js","/Users/fher/atlassian/repo/her-family/src/pages/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.D7TSieam.js","/Users/fher/atlassian/repo/her-family/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts":"_astro/Layout.astro_astro_type_script_index_0_lang.DYSbDI7A.js","/Users/fher/atlassian/repo/her-family/src/components/Gallery.astro?astro&type=script&index=0&lang.ts":"_astro/Gallery.astro_astro_type_script_index_0_lang.BYj48uq7.js","/Users/fher/atlassian/repo/her-family/src/components/VideoPlayer.astro?astro&type=script&index=0&lang.ts":"_astro/VideoPlayer.astro_astro_type_script_index_0_lang.JkNwaI-Q.js","/Users/fher/atlassian/repo/her-family/src/components/Comments.astro?astro&type=script&index=0&lang.ts":"_astro/Comments.astro_astro_type_script_index_0_lang.CC5Br8qk.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/fher/atlassian/repo/her-family/src/pages/admin/index.astro?astro&type=script&index=1&lang.ts","document.getElementById(\"loginForm\").addEventListener(\"submit\",async o=>{o.preventDefault();const t=document.getElementById(\"password\").value,n=document.getElementById(\"loginButton\"),e=document.getElementById(\"loginError\");e.classList.add(\"hidden\"),n.disabled=!0,n.textContent=\"Signing in...\";try{const i=await(await fetch(\"/api/admin/login\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify({password:t})})).json();i.success?(e.textContent=\"Login successful! Checking authentication...\",e.classList.remove(\"hidden\"),e.classList.remove(\"text-red-600\"),e.classList.add(\"text-green-600\"),console.log(\"All cookies:\",document.cookie),console.log(\"Admin auth cookie:\",document.cookie.includes(\"admin_auth\")),setTimeout(()=>{window.location.reload()},1500)):(e.textContent=i.error||\"Login failed\",e.classList.remove(\"hidden\"))}catch(s){console.error(\"Login error:\",s),e.textContent=\"Login failed. Please try again.\",e.classList.remove(\"hidden\")}finally{n.disabled=!1,n.textContent=\"Sign in\"}});document.getElementById(\"checkAuthButton\").addEventListener(\"click\",async()=>{try{const t=await(await fetch(\"/api/admin/status\")).json();console.log(\"Auth status:\",t),alert(`Authentication Status:\n\nAuthenticated: ${t.isAuthenticated}\nCookie Value: ${t.cookieValue}\n\nCheck console for full details.`),t.isAuthenticated&&window.location.reload()}catch(o){console.error(\"Error checking auth status:\",o),alert(\"Error checking authentication status. Check console.\")}});"],["/Users/fher/atlassian/repo/her-family/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts","document.querySelectorAll('a[href^=\"#\"]').forEach(t=>{t.addEventListener(\"click\",function(r){r.preventDefault();const e=document.querySelector(this.getAttribute(\"href\"));e&&e.scrollIntoView({behavior:\"smooth\",block:\"start\"})})});"],["/Users/fher/atlassian/repo/her-family/src/components/VideoPlayer.astro?astro&type=script&index=0&lang.ts","const t=document.querySelector(\"video\"),e=document.querySelector(\".video-overlay\"),o=document.querySelector(\".play-button\");t&&e&&o&&(t.addEventListener(\"play\",()=>{e.style.opacity=\"0\",e.style.pointerEvents=\"none\"}),t.addEventListener(\"pause\",()=>{e.style.opacity=\"1\",e.style.pointerEvents=\"auto\"}),o.addEventListener(\"click\",()=>{t.play()}),t.autoplay&&(e.style.opacity=\"0\",e.style.pointerEvents=\"none\"));"]],"assets":["/_astro/index.BFrhQPyY.css","/favicon.ico","/favicon.svg","/_astro/Comments.astro_astro_type_script_index_0_lang.CC5Br8qk.js","/_astro/Gallery.astro_astro_type_script_index_0_lang.BYj48uq7.js","/_astro/index.astro_astro_type_script_index_0_lang.D0ob6iFC.js","/_astro/index.astro_astro_type_script_index_0_lang.D7TSieam.js","/_astro/index.astro_astro_type_script_index_2_lang.CxO_JRN6.js","/videos/video-info.txt","/images/placeholder-info.txt"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"y4xRp1JaTVtHG/Qsa16N+JhBBtUglkJbYNb016XSKYI="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
