import {getSupabaseAdmin} from "@/lib/supabase-server";
import {authConfigured} from "@/lib/platform/supabase";
export const dynamic="force-dynamic";
export async function GET(){
 let ready=false;
 try{if(authConfigured()){const {error}=await getSupabaseAdmin().from("rp_settings").select("key").eq("key","free_access").single();ready=!error;}}catch{}
 return Response.json({status:ready?"ok":"unavailable"},{status:ready?200:503,headers:{"Cache-Control":"no-store"}});
}
