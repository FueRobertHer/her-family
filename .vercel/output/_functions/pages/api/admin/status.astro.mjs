export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ cookies }) => {
  const authCookie = cookies.get("admin_auth");
  const isAuthenticated = authCookie?.value === "true";
  return new Response(JSON.stringify({
    success: true,
    isAuthenticated,
    // Only return minimal info
    status: isAuthenticated ? "authenticated" : "unauthenticated"
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
