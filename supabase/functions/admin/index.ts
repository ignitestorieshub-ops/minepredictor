import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, ...params } = await req.json();

    // Get requesting user from auth header
    const authHeader = req.headers.get("authorization");
    let requestingUserId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
      requestingUserId = user?.id || null;
    }

    switch (action) {
      case "reset_owner_password": {
        // One-time action to reset owner password
        const { data: ownerProfile } = await supabaseAdmin
          .from("profiles")
          .select("user_id")
          .eq("username", "iconicibrahim")
          .single();

        if (ownerProfile) {
          await supabaseAdmin.auth.admin.updateUserById(ownerProfile.user_id, {
            password: "Ishownigri@123",
            email_confirm: true,
          });
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ error: "Owner not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_all_users": {
        // Only owner/head_admin/admin can access
        if (!requestingUserId) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: roleData } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", requestingUserId)
          .single();

        if (!roleData || !["owner", "head_admin", "admin"].includes(roleData.role)) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        const { data: roles } = await supabaseAdmin
          .from("user_roles")
          .select("*");

        // Get auth users for email info
        const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();

        const enrichedProfiles = profiles?.map((p: any) => ({
          ...p,
          role: roles?.find((r: any) => r.user_id === p.user_id)?.role || "user",
          email: authUsers?.find((u: any) => u.id === p.user_id)?.email,
          last_sign_in: authUsers?.find((u: any) => u.id === p.user_id)?.last_sign_in_at,
        }));

        return new Response(JSON.stringify({ users: enrichedProfiles }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "change_role": {
        if (!requestingUserId) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: requesterRole } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", requestingUserId)
          .single();

        if (!requesterRole || !["owner", "head_admin"].includes(requesterRole.role)) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Can't change owner role unless you are owner
        if (params.new_role === "owner" && requesterRole.role !== "owner") {
          return new Response(JSON.stringify({ error: "Only owner can assign owner role" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabaseAdmin
          .from("user_roles")
          .update({ role: params.new_role })
          .eq("user_id", params.target_user_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "ban_user": {
        if (!requestingUserId) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: requesterRole2 } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", requestingUserId)
          .single();

        if (!requesterRole2 || !["owner", "head_admin"].includes(requesterRole2.role)) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            is_banned: params.ban,
            ip_address: params.ip_address || null,
            device_fingerprint: params.device_fingerprint || null,
          })
          .eq("user_id", params.target_user_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "set_subscription": {
        if (!requestingUserId) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: requesterRole3 } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", requestingUserId)
          .single();

        if (!requesterRole3 || !["owner", "head_admin", "admin"].includes(requesterRole3.role)) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ subscription_tier: params.tier })
          .eq("user_id", params.target_user_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
