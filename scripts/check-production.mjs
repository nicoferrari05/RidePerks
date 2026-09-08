// Read-only production readiness check; never prints keys or personal data.
const origin=process.argv[2]||"https://rideperks.app";
for(const path of ["/","/login","/register","/api/health","/driver/dashboard"]){
 const response=await fetch(new URL(path,origin),{redirect:"manual"});
 console.log(path,response.status,response.headers.get("location")||"");
 if(path==="/api/health"&&response.status!==200)process.exitCode=1;
}
