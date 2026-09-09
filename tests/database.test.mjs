import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
let db;
const migration = readFileSync(
  new URL(
    "../supabase/migrations/202609080001_driver_platform.sql",
    import.meta.url,
  ),
  "utf8",
);
before(async () => {
  db = new PGlite();
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}'); create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);",
  );
  try {
    await db.exec(migration);
  } catch (e) {
    throw new Error(e.message + " at character " + e.position);
  }
});
after(async () => {
  await db.close();
});
async function user(meta = {}) {
  const id = randomUUID();
  await db.query(
    "insert into auth.users(id,raw_user_meta_data) values($1,$2)",
    [id, JSON.stringify(meta)],
  );
  return id;
}
async function fixture() {
  const driver = await user({ full_name: "Conductor de prueba" }),
    owner = await user({ full_name: "Comercio de prueba" });
  await db.query("update rp_profiles set status='verified' where id=$1", [
    driver,
  ]);
  const shop = (
    await db.query("select rp_save_business(null,$1) as id", [
      JSON.stringify({
        name: "Aliado de prueba",
        description: "Solo pruebas",
        address: "Panamá",
        category: "comida",
        owner_user_id: owner,
      }),
    ])
  ).rows[0].id;
  const benefit = (
    await db.query(
      "insert into rp_benefits(business_id,title,description,discount_label,terms,savings_amount,monthly_limit) values($1,'Beneficio de prueba','Solo pruebas','Ahorra $2','Solo pruebas',2,2) returning id",
      [shop],
    )
  ).rows[0].id;
  return { driver, owner, shop, benefit };
}
async function issue(f) {
  return (
    await db.query("select rp_issue_token($1,$2) as value", [
      f.driver,
      f.benefit,
    ])
  ).rows[0].value;
}
async function redeem(f, token) {
  return (
    await db.query("select rp_redeem_token($1,$2) as value", [f.owner, token])
  ).rows[0].value;
}
test("migration is idempotent and preserves settings", async () => {
  await db.exec(migration);
  assert.equal(
    (await db.query("select value from rp_settings where key='free_access'"))
      .rows[0].value,
    true,
  );
});
test("signup cannot set role or verification using metadata", async () => {
  const id = await user({
    role: "admin",
    status: "verified",
    full_name: "Usuario",
  });
  const p = (
    await db.query("select role,status from rp_profiles where id=$1", [id])
  ).rows[0];
  assert.deepEqual(p, { role: "driver", status: "pending" });
});
test("anonymous and authenticated roles cannot read private platform tables or execute privileged RPCs", async () => {
  for (const role of ["anon", "authenticated"]) {
    await db.exec("set role " + role);
    await assert.rejects(
      db.query("select * from rp_profiles"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select rp_rate_limit('bypass',100,10)"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select rp_issue_token($1,$2)", [randomUUID(), randomUUID()]),
      /permission denied/,
    );
    await db.exec("reset role");
  }
});
test("pending and suspended drivers cannot issue codes", async () => {
  const f = await fixture();
  for (const status of ["pending", "suspended", "rejected"]) {
    await db.query("update rp_profiles set status=$2 where id=$1", [
      f.driver,
      status,
    ]);
    await assert.rejects(issue(f), /Verifica tu cuenta/);
  }
});
test("repeated generation reuses an unexpired code", async () => {
  const f = await fixture();
  const a = await issue(f),
    b = await issue(f);
  assert.equal(a.token, b.token);
  assert.ok(new Date(a.expires_at).getTime() - Date.now() <= 120000);
});
test("only the benefit's own business can redeem", async () => {
  const f = await fixture(),
    other = await fixture();
  const t = await issue(f);
  await assert.rejects(redeem(other, t.token), /otro comercio/);
  assert.equal((await redeem(f, t.token)).driver_name, "Conductor de prueba");
});
test("redemption is single-use and records savings snapshot", async () => {
  const f = await fixture(),
    t = await issue(f);
  await redeem(f, t.token);
  await assert.rejects(redeem(f, t.token), /ya fue usado/);
  await db.query("update rp_benefits set savings_amount=99 where id=$1", [
    f.benefit,
  ]);
  const rows = (
    await db.query(
      "select savings_amount from rp_redemptions where driver_id=$1",
      [f.driver],
    )
  ).rows;
  assert.equal(rows.length, 1);
  assert.equal(Number(rows[0].savings_amount), 2);
});
test("expired codes are rejected and replaced", async () => {
  const f = await fixture(),
    t = await issue(f);
  await db.query(
    "update rp_qr_tokens set expires_at=now()-interval '1 second' where token=$1",
    [t.token],
  );
  await assert.rejects(redeem(f, t.token), /venció/);
  assert.notEqual((await issue(f)).token, t.token);
});
test("monthly quota applies after confirmed redemptions", async () => {
  const f = await fixture();
  for (let i = 0; i < 2; i++) await redeem(f, (await issue(f)).token);
  await assert.rejects(issue(f), /límite/);
});
test("redemption rechecks paused business, suspended driver and benefit validity", async () => {
  const f = await fixture(),
    t = await issue(f);
  await db.query("update rp_businesses set is_active=false where id=$1", [
    f.shop,
  ]);
  await assert.rejects(redeem(f, t.token), /No tienes acceso/);
  await db.query("update rp_businesses set is_active=true where id=$1", [
    f.shop,
  ]);
  await db.query("update rp_profiles set status='suspended' where id=$1", [
    f.driver,
  ]);
  await assert.rejects(redeem(f, t.token), /no está habilitada/);
  await db.query("update rp_profiles set status='verified' where id=$1", [
    f.driver,
  ]);
  await db.query("update rp_benefits set is_active=false where id=$1", [
    f.benefit,
  ]);
  await assert.rejects(redeem(f, t.token), /no está vigente/);
  assert.equal(
    (
      await db.query("select status from rp_qr_tokens where token=$1", [
        t.token,
      ])
    ).rows[0].status,
    "pending",
  );
});
test("future or expired benefits cannot issue a code", async () => {
  const f = await fixture();
  await db.query(
    "update rp_benefits set valid_from=current_date+2 where id=$1",
    [f.benefit],
  );
  await assert.rejects(issue(f), /no está disponible/);
  await db.query(
    "update rp_benefits set valid_from=null,valid_until=current_date-2 where id=$1",
    [f.benefit],
  );
  await assert.rejects(issue(f), /no está disponible/);
});
test("verification approval changes status once and records review", async () => {
  const driver = await user();
  const id = (
    await db.query(
      "insert into rp_verifications(driver_id,photo_path) values($1,'test/photo.jpg') returning id",
      [driver],
    )
  ).rows[0].id;
  await db.query("select rp_review_verification($1,true,'Correcto')", [id]);
  assert.equal(
    (await db.query("select status from rp_profiles where id=$1", [driver]))
      .rows[0].status,
    "verified",
  );
  await assert.rejects(
    db.query("select rp_review_verification($1,false,'No')", [id]),
    /ya fue revisada/,
  );
});
test("only one pending verification per driver", async () => {
  const id = await user();
  await db.query(
    "insert into rp_verifications(driver_id,photo_path) values($1,'a.jpg')",
    [id],
  );
  await assert.rejects(
    db.query(
      "insert into rp_verifications(driver_id,photo_path) values($1,'b.jpg')",
      [id],
    ),
    /duplicate key/,
  );
});
test("durable rate limiter enforces and resets its window", async () => {
  const key = randomUUID();
  for (const expected of [true, true, false])
    assert.equal(
      (await db.query("select rp_rate_limit($1,2,60) as ok", [key])).rows[0].ok,
      expected,
    );
  await db.query(
    "update rp_rate_limits set window_start=now()-interval '61 seconds' where key=$1",
    [key],
  );
  assert.equal(
    (await db.query("select rp_rate_limit($1,2,60) as ok", [key])).rows[0].ok,
    true,
  );
});
test("free access gate is checked at issue and redemption", async () => {
  const f = await fixture(),
    t = await issue(f);
  await db.query(
    "update rp_settings set value='false' where key='free_access'",
  );
  try {
    await assert.rejects(issue(f), /no está habilitado/);
    await assert.rejects(redeem(f, t.token), /no está habilitado/);
  } finally {
    await db.query(
      "update rp_settings set value='true' where key='free_access'",
    );
  }
});

test("existing waitlist view is private while server retains access",async()=>{
 await db.exec("create view public.waitlist_ranked as select 1 as id; grant select on public.waitlist_ranked to anon,authenticated;");
 const privacy=readFileSync(new URL("../supabase/migrations/202609080002_waitlist_privacy.sql",import.meta.url),"utf8");
 await db.exec(privacy);await db.exec(privacy);
 for(const role of ["anon","authenticated"]){await db.exec("set role "+role);try{await assert.rejects(db.query("select * from public.waitlist_ranked"),/permission denied/);}finally{await db.exec("reset role");}}
 await db.exec("set role service_role");try{assert.equal((await db.query("select * from public.waitlist_ranked")).rows.length,1);}finally{await db.exec("reset role");}
});
