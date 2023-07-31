-- Table: public.jobs

-- DROP TABLE IF EXISTS public.mailer_run;

CREATE TABLE IF NOT EXISTS public.mailer_run
(
    id serial,
    created_at timestamp without time zone NOT NULL,
    was_successful boolean NOT NULL,
    result jsonb,
    CONSTRAINT mailer_run_pkey PRIMARY KEY (id)
);