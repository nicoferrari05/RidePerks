import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
let db;
const migrationFiles = [
  "202609080001_driver_platform.sql",
  "202609090001_qr_short_codes.sql",
  "202609100001_yappy_memberships.sql",
  "202609110001_merchant_roles.sql",
  "202609110002_access_and_review.sql",
];
const migrations = migrationFiles.map((name) =>
  readFileSync(
    new URL("../supabase/migrations/" + name, import.meta.url),
    "utf8",
  ),
);
before(async () => {
  db = new PGlite();
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}'); create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);",
  );
  for (const [i, migration] of migrations.entries()) {
    try {
      await db.exec(migration);
    } catch (e) {
      throw new Error(
        migrationFiles[i] + ": " + e.message + " at character " + e.position,
      );
    }
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
  for (const migration of migrations) await db.exec(migration);
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
test("short code is six hex characters and resolves to the same pending token", async () => {
  const f = await fixture();
  const a = await issue(f);
  assert.match(a.short_code, /^[0-9A-F]{6}$/);
  const resolved = (
    await db.query(
      "select token from rp_qr_tokens where short_code=$1 and status='pending'",
      [a.short_code],
    )
  ).rows[0];
  assert.equal(resolved.token, a.token);
});
test("two drivers issuing at the same time get distinct short codes", async () => {
  const f = await fixture(),
    other = await fixture();
  const a = await issue(f),
    b = await issue(other);
  assert.notEqual(a.short_code, b.short_code);
});
test("only the benefit's own business can redeem", async () => {
  const f = await fixture(),
    other = await fixture();
  const t = await issue(f);
  await assert.rejects(redeem(other, t.token), /No tienes acceso/);
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
    await assert.rejects(issue(f), /membresía/);
    await assert.rejects(redeem(f, t.token), /membresía/);
  } finally {
    await db.query(
      "update rp_settings set value='true' where key='free_access'",
    );
  }
});

test("existing waitlist view is private while server retains access", async () => {
  await db.exec(
    "create view public.waitlist_ranked as select 1 as id; grant select on public.waitlist_ranked to anon,authenticated;",
  );
  const privacy = readFileSync(
    new URL(
      "../supabase/migrations/202609080002_waitlist_privacy.sql",
      import.meta.url,
    ),
    "utf8",
  );
  await db.exec(privacy);
  await db.exec(privacy);
  for (const role of ["anon", "authenticated"]) {
    await db.exec("set role " + role);
    try {
      await assert.rejects(
        db.query("select * from public.waitlist_ranked"),
        /permission denied/,
      );
    } finally {
      await db.exec("reset role");
    }
  }
  await db.exec("set role service_role");
  try {
    assert.equal(
      (await db.query("select * from public.waitlist_ranked")).rows.length,
      1,
    );
  } finally {
    await db.exec("reset role");
  }
});

test("payment tables and RPCs are inaccessible to browser database roles", async () => {
  for (const role of ["anon", "authenticated"]) {
    await db.exec("set role " + role);
    try {
      for (const table of ["rp_memberships", "rp_payment_orders"])
        await assert.rejects(
          db.query("select * from " + table),
          /permission denied/,
        );
      await assert.rejects(
        db.query(
          "select rp_apply_payment('x','E','https://www.rideperks.app')",
        ),
        /permission denied/,
      );
    } finally {
      await db.exec("reset role");
    }
  }
});
test("Yappy confirmed payment grants exactly one month, repeated callbacks are idempotent", async () => {
  const f = await fixture();
  const id = "pay" + randomUUID().replaceAll("-", "").slice(0, 12);
  await db.exec("update rp_settings set value='false' where key='free_access'");
  try {
    await db.query("select rp_create_payment($1,$2,$3)", [
      f.driver,
      id,
      "https://www.rideperks.app",
    ]);
    await assert.rejects(issue(f), /membresía/);
    await assert.rejects(
      db.query("select rp_create_payment($1,$2,$3)", [
        f.driver,
        id + "x",
        "https://www.rideperks.app",
      ]),
      /pago en proceso/,
    );
    await db.query("select rp_apply_payment($1,'E',$2)", [
      id,
      "https://www.rideperks.app",
    ]);
    const first = (
      await db.query("select * from rp_memberships where driver_id=$1", [
        f.driver,
      ])
    ).rows[0];
    assert.ok(new Date(first.valid_until) > new Date());
    await db.query("select rp_apply_payment($1,'E',$2)", [
      id,
      "https://www.rideperks.app",
    ]);
    await db.query("select rp_apply_payment($1,'C',$2)", [
      id,
      "https://www.rideperks.app",
    ]);
    const second = (
      await db.query("select * from rp_memberships where driver_id=$1", [
        f.driver,
      ])
    ).rows[0];
    assert.equal(String(first.valid_until), String(second.valid_until));
    const token = await issue(f);
    await redeem(f, token.token);
    await db.query(
      "update rp_memberships set valid_until=now()-interval '1 second' where driver_id=$1",
      [f.driver],
    );
    await assert.rejects(issue(f), /membresía/);
  } finally {
    await db.exec(
      "update rp_settings set value='true' where key='free_access'",
    );
  }
});
test("failed notifications do not grant access; a delayed valid payment is recorded", async () => {
  const f = await fixture(),
    id = "pay" + randomUUID().replaceAll("-", "").slice(0, 12);
  await db.exec("update rp_settings set value='false' where key='free_access'");
  try {
    await db.query("select rp_create_payment($1,$2,$3)", [
      f.driver,
      id,
      "https://www.rideperks.app",
    ]);
    for (const state of ["R", "C", "X"]) {
      await db.query("select rp_apply_payment($1,$2,$3)", [
        id,
        state,
        "https://www.rideperks.app",
      ]);
      await assert.rejects(issue(f), /membresía/);
    }
    await assert.rejects(
      db.query("select rp_apply_payment($1,'E','https://bad.invalid')", [id]),
      /Dominio/,
    );
    await db.query("select rp_apply_payment($1,'E',$2)", [
      id,
      "https://www.rideperks.app",
    ]);
    assert.ok((await issue(f)).token);
  } finally {
    await db.exec(
      "update rp_settings set value='true' where key='free_access'",
    );
  }
});
test("membership renewal extends remaining time and payment cannot override driver suspension", async () => {
  const f = await fixture(),
    id = "pay" + randomUUID().replaceAll("-", "").slice(0, 12);
  await db.exec("update rp_settings set value='false' where key='free_access'");
  try {
    await db.query(
      "insert into rp_memberships(driver_id,valid_until) values($1,now()+interval '5 days')",
      [f.driver],
    );
    await db.query("select rp_create_payment($1,$2,$3)", [
      f.driver,
      id,
      "https://www.rideperks.app",
    ]);
    await db.query("select rp_apply_payment($1,'E',$2)", [
      id,
      "https://www.rideperks.app",
    ]);
    const period = (
      await db.query(
        "select period_end=(((period_start at time zone 'America/Panama')+interval '1 month') at time zone 'America/Panama') as correct, period_start>now() as preserves from rp_payment_orders where id=$1",
        [id],
      )
    ).rows[0];
    assert.equal(period.correct, true);
    assert.equal(period.preserves, true);
    await db.query("update rp_profiles set status='suspended' where id=$1", [
      f.driver,
    ]);
    await assert.rejects(issue(f), /Verifica/);
  } finally {
    await db.exec(
      "update rp_settings set value='true' where key='free_access'",
    );
  }
});

test("merchant staff can preview and redeem but cannot read statistics; revoked staff cannot redeem", async () => {
  const f = await fixture(),
    staff = await user({ full_name: "Personal" });
  await db.query("update rp_profiles set role='business' where id=$1", [staff]);
  await db.query(
    "insert into rp_business_members(business_id,user_id,role) values($1,$2,'staff')",
    [f.shop, staff],
  );
  const code = await issue(f);
  const preview = await db.query("select rp_preview_token($1,$2) as value", [
    staff,
    code.token,
  ]);
  assert.equal(preview.rows[0].value.benefit_title, "Beneficio de prueba");
  assert.equal(
    (
      await db.query(
        "select count(*) as n from rp_redemptions where driver_id=$1",
        [f.driver],
      )
    ).rows[0].n,
    0,
  );
  await assert.rejects(
    db.query("select rp_business_stats($1,$2,now()-interval '7 days',now())", [
      staff,
      f.shop,
    ]),
    /No autorizado/,
  );
  await db.query(
    "update rp_business_members set is_active=false where business_id=$1 and user_id=$2",
    [f.shop, staff],
  );
  await assert.rejects(
    db.query("select rp_redeem_token($1,$2)", [staff, code.token]),
    /No tienes acceso/,
  );
  await db.query(
    "update rp_business_members set is_active=true where business_id=$1 and user_id=$2",
    [f.shop, staff],
  );
  await db.query("select rp_redeem_token($1,$2)", [staff, code.token]);
  assert.equal(
    (
      await db.query(
        "select redeemed_by from rp_redemptions where driver_id=$1",
        [f.driver],
      )
    ).rows[0].redeemed_by,
    staff,
  );
  const stats = (
    await db.query(
      "select rp_business_stats($1,$2,now()-interval '7 days',now()+interval '1 second') as value",
      [f.owner, f.shop],
    )
  ).rows[0].value;
  assert.equal(stats.uses, 1);
  assert.equal(stats.drivers, 1);
  assert.equal(stats.savings, 2);
});
test("merchant invitations are single-use and cannot be accepted by drivers", async () => {
  const f = await fixture(),
    staff = await user();
  await db.query("update rp_profiles set role='business' where id=$1", [staff]);
  const hash = randomUUID();
  await db.query(
    "insert into rp_business_invites(business_id,token_hash,created_by) values($1,$2,$3)",
    [f.shop, hash, f.owner],
  );
  await assert.rejects(
    db.query("select rp_accept_business_invite($1,$2)", [f.driver, hash]),
    /cuenta de comercio/,
  );
  await db.query("select rp_accept_business_invite($1,$2)", [staff, hash]);
  await assert.rejects(
    db.query("select rp_accept_business_invite($1,$2)", [staff, hash]),
    /utilizada/,
  );
});

async function adminActor() {
  const id = await user({ full_name: "Administrador" });
  await db.query("insert into rp_admin_users(user_id) values($1)", [id]);
  return id;
}
async function grant(
  admin,
  driver,
  kind,
  end = null,
  days = 0,
  months = 0,
  action = "grant",
) {
  return db.query(
    "select rp_manage_access($1,$2,$3,$4,$5,$6,$7,'Prueba de acceso')",
    [admin, driver, action, kind, end, days, months],
  );
}
test("manual access requires a named admin and preserves suspension across grants and payments", async () => {
  const f = await fixture(),
    admin = await adminActor();
  await db.exec("update rp_settings set value='false' where key='free_access'");
  await assert.rejects(grant(f.owner, f.driver, "lifetime"), /administrador/);
  await grant(
    admin,
    f.driver,
    "trial",
    new Date(Date.now() + 3 * 86400000).toISOString(),
  );
  assert.equal(
    (await db.query("select rp_has_access($1) as yes", [f.driver])).rows[0].yes,
    true,
  );
  await grant(admin, f.driver, "trial", null, 0, 0, "suspend");
  await grant(admin, f.driver, "lifetime");
  assert.equal(
    (await db.query("select rp_has_access($1) as yes", [f.driver])).rows[0].yes,
    false,
  );
  await assert.rejects(
    db.query(
      "select rp_create_payment($1,'blockedOrder','https://www.rideperks.app')",
      [f.driver],
    ),
    /suspendido/,
  );
  await db.query(
    "insert into rp_payment_orders(id,driver_id,domain) values('lateAccessPay',$1,'https://www.rideperks.app')",
    [f.driver],
  );
  await db.query(
    "select rp_apply_payment('lateAccessPay','E','https://www.rideperks.app')",
  );
  assert.equal(
    (await db.query("select rp_has_access($1) as yes", [f.driver])).rows[0].yes,
    false,
  );
  await grant(admin, f.driver, "trial", null, 0, 0, "resume");
  assert.equal(
    (await db.query("select rp_access_state($1) as state", [f.driver])).rows[0]
      .state.lifetime,
    true,
  );
  await assert.rejects(
    db.query(
      "select rp_create_payment($1,'noLifetimePay','https://www.rideperks.app')",
      [f.driver],
    ),
    /permanente/,
  );
  const audit = await db.query(
    "select actor_id from rp_admin_audit where subject_id=$1 and action='access.grant'",
    [f.driver],
  );
  assert.equal(audit.rows.length, 2);
  assert.ok(audit.rows.every((r) => r.actor_id === admin));
  await db.exec("update rp_settings set value='true' where key='free_access'");
});
test("extensions preserve existing paid time and invalid durations cannot grant access", async () => {
  const f = await fixture(),
    admin = await adminActor();
  await db.query(
    "insert into rp_memberships(driver_id,valid_until) values($1,now()+interval '5 days')",
    [f.driver],
  );
  await grant(admin, f.driver, "extension", null, 7, 0);
  const state = (
    await db.query("select rp_access_state($1) as state", [f.driver])
  ).rows[0].state;
  assert.ok(
    new Date(state.valid_until).getTime() > Date.now() + 11.9 * 86400000,
  );
  await assert.rejects(
    grant(admin, f.driver, "extension", null, -1, 0),
    /válidos/,
  );
  await assert.rejects(grant(admin, f.driver, "trial", "2020-01-01"), /futura/);
  assert.ok(
    (
      await db.query(
        "select valid_until from rp_memberships where driver_id=$1",
        [f.driver],
      )
    ).rows[0].valid_until,
  );
});
test("draft benefit revisions never change published data and approval is single-use", async () => {
  const f = await fixture(),
    admin = await adminActor();
  const payload = {
    title: "Oferta revisada",
    description: "Descripción de la oferta",
    discount_label: "Descuento nuevo",
    terms: "Condiciones nuevas",
    category: "comida",
    savings_amount: 3,
    monthly_limit: 2,
    valid_from: "",
    valid_until: "",
  };
  const id = (
    await db.query(
      "insert into rp_benefit_revisions(business_id,benefit_id,payload,created_by,status) values($1,$2,$3,$4,'pending') returning id",
      [f.shop, f.benefit, JSON.stringify(payload), f.owner],
    )
  ).rows[0].id;
  assert.equal(
    (await db.query("select title from rp_benefits where id=$1", [f.benefit]))
      .rows[0].title,
    "Beneficio de prueba",
  );
  await assert.rejects(
    db.query("select rp_review_benefit($1,$2,true,'')", [f.owner, id]),
    /administrador/,
  );
  await db.query("select rp_review_benefit($1,$2,true,'')", [admin, id]);
  assert.equal(
    (await db.query("select title from rp_benefits where id=$1", [f.benefit]))
      .rows[0].title,
    "Oferta revisada",
  );
  await assert.rejects(
    db.query("select rp_review_benefit($1,$2,true,'')", [admin, id]),
    /pendiente/,
  );
});
test("new management tables and functions cannot be accessed by browser roles", async () => {
  for (const role of ["anon", "authenticated"]) {
    await db.exec("set role " + role);
    for (const table of [
      "rp_business_members",
      "rp_business_invites",
      "rp_benefit_revisions",
      "rp_admin_users",
      "rp_access_grants",
      "rp_access_controls",
    ])
      await assert.rejects(
        db.query("select * from " + table),
        /permission denied/,
      );
    await assert.rejects(
      db.query("select rp_access_state($1)", [randomUUID()]),
      /permission denied/,
    );
    await db.exec("reset role");
  }
});
