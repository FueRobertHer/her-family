export { renderers } from '../../../renderers.mjs';

const ADMIN_PASSWORD = "memorial2024";
const prerender = false;
const POST = async ({ request, cookies }) => {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return new Response(JSON.stringify({
        success: false,
        error: "Content-Type must be application/json"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const text = await request.text();
    if (!text) {
      return new Response(JSON.stringify({
        success: false,
        error: "Request body is empty"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const body = JSON.parse(text);
    const { password } = body;
    if (!password) {
      return new Response(JSON.stringify({
        success: false,
        error: "Password is required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    if (password === ADMIN_PASSWORD) {
      cookies.set("admin_auth", "true", {
        httpOnly: false,
        // Allow JavaScript access for debugging/client-side checks
        secure: true,
        // Require HTTPS in production
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        // 24 hours
        path: "/"
        // Ensure cookie is available site-wide
      });
      console.log("Cookie set successfully");
      return new Response(JSON.stringify({
        success: true,
        message: "Login successful"
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid password"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Login failed. Please try again."
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
