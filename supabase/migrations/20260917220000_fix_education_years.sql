-- Correction for the two education rows seeded by
-- 20260917210200_seed_education.sql before its start_year values were
-- fixed to 2024. That file uses a WHERE NOT EXISTS guard for
-- idempotency, so re-running it after the fix is a no-op once the rows
-- already exist — this UPDATE is needed to actually change live data.
--
-- Safe to run more than once.

update education
set start_year = 2024, updated_at = now()
where institution = 'Jadavpur University' and field = 'Civil Engineering';

update education
set start_year = 2024, updated_at = now()
where institution = 'IIT Madras' and field = 'Data Science';
