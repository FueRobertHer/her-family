import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_Dto2T50B.mjs';
import { manifest } from './manifest_BW3Vk5z5.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin.astro.mjs');
const _page2 = () => import('./pages/api/admin/comments.astro.mjs');
const _page3 = () => import('./pages/api/admin/content.astro.mjs');
const _page4 = () => import('./pages/api/admin/login.astro.mjs');
const _page5 = () => import('./pages/api/admin/status.astro.mjs');
const _page6 = () => import('./pages/api/comments.astro.mjs');
const _page7 = () => import('./pages/api/delete-image.astro.mjs');
const _page8 = () => import('./pages/api/gallery/add.astro.mjs');
const _page9 = () => import('./pages/api/gallery/delete.astro.mjs');
const _page10 = () => import('./pages/api/gallery/update-order.astro.mjs');
const _page11 = () => import('./pages/api/upload-image.astro.mjs');
const _page12 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/index.astro", _page1],
    ["src/pages/api/admin/comments.ts", _page2],
    ["src/pages/api/admin/content.ts", _page3],
    ["src/pages/api/admin/login.ts", _page4],
    ["src/pages/api/admin/status.ts", _page5],
    ["src/pages/api/comments.ts", _page6],
    ["src/pages/api/delete-image.ts", _page7],
    ["src/pages/api/gallery/add.ts", _page8],
    ["src/pages/api/gallery/delete.ts", _page9],
    ["src/pages/api/gallery/update-order.ts", _page10],
    ["src/pages/api/upload-image.ts", _page11],
    ["src/pages/index.astro", _page12]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "f73e1358-0c4d-4a0a-aa4f-506faf577a9e",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
