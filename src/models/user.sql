-- Table: public.jobs

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id serial,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    settings jsonb NOT NULL,
    is_verified boolean NOT NULL default false,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_ukey UNIQUE (email)
);

INSERT INTO users (created_at, updated_at, email, token, is_verified) VALUES 
    (now(), now(), 'example.user@somedomain.com', 'some_token', '{"cities": { "brussels": true, "bratislava": true }}', true);