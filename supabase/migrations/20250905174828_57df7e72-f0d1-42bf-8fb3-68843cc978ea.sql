-- Functions and seed for admin + citizen account creation and login
-- 1) Generate unique username
create or replace function public.generate_unique_username(prefix text default 'citizen', tries int default 50)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uname text;
  i int := 0;
begin
  loop
    i := i + 1;
    uname := prefix || lpad(floor(random()*100000)::int::text, 5, '0');
    exit when not exists (select 1 from public.profiles where username = uname)
           and not exists (select 1 from public.users where username = uname);
    if i >= tries then
      uname := prefix || '-' || gen_random_uuid();
      exit;
    end if;
  end loop;
  return uname;
end;
$$;

-- 2) Create citizen account securely (id in users + profiles)
create or replace function public.create_citizen_account(p_phone text, p_password text)
returns table(id uuid, username text)
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_profile record;
  new_user_id uuid;
  uname text;
begin
  -- If already exists by phone, return existing
  select p.id, p.username into existing_profile
  from public.profiles p
  where p.phone_number = p_phone
  limit 1;

  if found then
    id := existing_profile.id;
    username := existing_profile.username;
    return next;
    return;
  end if;

  -- Generate username and create records
  uname := public.generate_unique_username();

  insert into public.users (username, phone_number, password)
  values (uname, p_phone, p_password)
  returning id into new_user_id;

  insert into public.profiles (id, phone_number, username, password_hash, role, is_active)
  values (new_user_id, p_phone, uname, p_password, 'citizen', true);

  id := new_user_id;
  username := uname;
  return next;
end;
$$;

-- 3) Admin login via security definer
create or replace function public.login_admin(p_username text, p_password text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text
  from public.admins
  where lower(username) = lower(p_username)
    and password = p_password
    and is_active
  limit 1;
$$;

-- 4) Citizen login via security definer (bypass RLS safely)
create or replace function public.login_citizen(p_username text, p_password text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(role::text, 'citizen')
  from public.profiles
  where lower(username) = lower(p_username)
    and password_hash = p_password
    and coalesce(is_active, true)
  limit 1;
$$;

-- 5) Seed static admin if missing
insert into public.admins (username, password, role, is_active)
select 'AdminCP', 'admin123456', 'admin'::user_role, true
where not exists (
  select 1 from public.admins where lower(username) = 'admincp'
);
