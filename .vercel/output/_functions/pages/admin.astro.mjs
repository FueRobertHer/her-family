/* empty css                                 */
import { e as createComponent, k as renderScript, l as renderHead, r as renderTemplate, h as createAstro } from '../chunks/astro/server_CLGJxpjn.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const cookies = Astro2.cookies;
  const authCookie = cookies.get("admin_auth");
  const isAuthenticated = authCookie?.value === "true";
  console.log("Auth cookie:", authCookie);
  console.log("Is authenticated:", isAuthenticated);
  if (Astro2.url.searchParams.get("logout") === "true") {
    cookies.delete("admin_auth");
    return Astro2.redirect("/admin");
  }
  return renderTemplate`<html lang="en" data-astro-cid-u2h3djql> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Admin - Memorial Page</title>${renderScript($$result, "/Users/fher/atlassian/repo/her-family/src/pages/admin/index.astro?astro&type=script&index=0&lang.ts")}${renderHead()}</head> <body class="bg-gray-50" data-astro-cid-u2h3djql> ${!isAuthenticated ? renderTemplate`<!-- Login Form -->
  <div class="min-h-screen flex items-center justify-center" data-astro-cid-u2h3djql> <div class="max-w-md w-full space-y-8" data-astro-cid-u2h3djql> <div data-astro-cid-u2h3djql> <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900" data-astro-cid-u2h3djql>
Admin Access
</h2> <p class="mt-2 text-center text-sm text-gray-600" data-astro-cid-u2h3djql>
Enter password to manage comments
</p> </div> <form id="loginForm" class="mt-8 space-y-6" data-astro-cid-u2h3djql> <div data-astro-cid-u2h3djql> <label for="password" class="sr-only" data-astro-cid-u2h3djql>Password</label> <input id="password" name="password" type="password" required class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Admin password" data-astro-cid-u2h3djql> </div> <div id="loginError" class="text-red-600 text-sm text-center hidden" data-astro-cid-u2h3djql></div> <div data-astro-cid-u2h3djql> <button type="submit" id="loginButton" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50" data-astro-cid-u2h3djql>
Sign in
</button> </div> <div class="mt-4" data-astro-cid-u2h3djql> <button type="button" id="checkAuthButton" class="w-full text-sm text-gray-600 hover:text-gray-900 underline" data-astro-cid-u2h3djql>
Debug: Check Authentication Status
</button> </div> </form> ${renderScript($$result, "/Users/fher/atlassian/repo/her-family/src/pages/admin/index.astro?astro&type=script&index=1&lang.ts")} </div> </div>` : renderTemplate`<!-- Admin Dashboard -->
  <div class="min-h-screen bg-gray-50" data-astro-cid-u2h3djql> <!-- Header --> <header class="bg-white shadow" data-astro-cid-u2h3djql> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-astro-cid-u2h3djql> <div class="flex justify-between items-center py-6" data-astro-cid-u2h3djql> <div data-astro-cid-u2h3djql> <h1 class="text-3xl font-bold text-gray-900" data-astro-cid-u2h3djql>The Her Family Admin</h1> </div> <div class="flex items-center space-x-4" data-astro-cid-u2h3djql> <a href="/" class="text-indigo-600 hover:text-indigo-900 font-medium" data-astro-cid-u2h3djql>✏️ Edit Site Content</a> <a href="/admin?logout=true" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700" data-astro-cid-u2h3djql>
Logout
</a> </div> </div> </div> </header> <!-- Main Content --> <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" data-astro-cid-u2h3djql> <!-- Filter Tabs --> <div class="bg-white shadow rounded-lg mb-6" data-astro-cid-u2h3djql> <div class="border-b border-gray-200" data-astro-cid-u2h3djql> <nav class="-mb-px flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs" data-astro-cid-u2h3djql> <button class="tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center" data-tab="pending" data-astro-cid-u2h3djql>
Pending Review
<span id="pendingCount" class="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs" data-astro-cid-u2h3djql>0</span> </button> <button class="tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center" data-tab="approved" data-astro-cid-u2h3djql>
Approved
<span id="approvedCount" class="ml-2 bg-green-100 text-green-800 py-0.5 px-2 rounded-full text-xs" data-astro-cid-u2h3djql>0</span> </button> <button class="tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center" data-tab="rejected" data-astro-cid-u2h3djql>
Rejected
<span id="rejectedCount" class="ml-2 bg-red-100 text-red-800 py-0.5 px-2 rounded-full text-xs" data-astro-cid-u2h3djql>0</span> </button> <button class="tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center" data-tab="all" data-astro-cid-u2h3djql>
All Comments
<span id="totalCount" class="ml-2 bg-gray-100 text-gray-800 py-0.5 px-2 rounded-full text-xs" data-astro-cid-u2h3djql>0</span> </button> </nav> </div> </div> <!-- Comments List --> <div class="bg-white shadow rounded-lg" data-astro-cid-u2h3djql> <div class="px-6 py-4 border-b border-gray-200" data-astro-cid-u2h3djql> <h3 class="text-lg leading-6 font-medium text-gray-900" id="sectionTitle" data-astro-cid-u2h3djql>
Loading comments...
</h3> </div> <div id="commentsContainer" class="divide-y divide-gray-200" data-astro-cid-u2h3djql> <!-- Comments will be loaded here --> <div class="p-6 text-center" data-astro-cid-u2h3djql> <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" data-astro-cid-u2h3djql></div> <p class="text-gray-600 mt-2" data-astro-cid-u2h3djql>Loading comments...</p> </div> </div> </div> </main> </div>`} ${renderScript($$result, "/Users/fher/atlassian/repo/her-family/src/pages/admin/index.astro?astro&type=script&index=2&lang.ts")} </body> </html>`;
}, "/Users/fher/atlassian/repo/her-family/src/pages/admin/index.astro", void 0);

const $$file = "/Users/fher/atlassian/repo/her-family/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
