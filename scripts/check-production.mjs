// Read-only readiness check; never prints keys or personal data.
const requestedOrigin = process.argv[2] || "https://rideperks.app";
const home = await fetch(new URL("/", requestedOrigin), {
  signal: AbortSignal.timeout(15000),
});
const origin = new URL(home.url).origin;
console.log("Site:", origin);
for (const [path, expected] of [
  ["/", [200]],
  ["/login", [200]],
  ["/register", [200]],
  ["/api/health", [200]],
  ["/driver/dashboard", [302, 303, 307, 308]],
]) {
  try {
    const response = await fetch(new URL(path, origin), {
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    const location = response.headers.get("location");
    const loginRedirect =
      path !== "/driver/dashboard" ||
      (location &&
        new URL(location, origin).origin === origin &&
        new URL(location, origin).pathname === "/login");
    const ready = expected.includes(response.status) && loginRedirect;
    console.log(ready ? "PASS" : "FAIL", path, response.status, location || "");
    if (!ready) process.exitCode = 1;
  } catch (error) {
    console.error("FAIL", path, error.message);
    process.exitCode = 1;
  }
}
