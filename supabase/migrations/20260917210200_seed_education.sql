-- Real biographical data (not demo/placeholder content), migrated out
-- of the frontend per the "no hard-coded education/CGPA" rule.
--
-- cgpa is intentionally left NULL here: "CGPA 8.X" in the old frontend
-- was itself a placeholder, not a real figure, and the spec explicitly
-- says not to invent missing information. Update these two rows with
-- the real CGPA once you have it — the UI only shows the metric when
-- the value is present.
--
-- education has no natural unique key, so idempotency is done with an
-- explicit existence check rather than ON CONFLICT.

insert into education (institution, degree, field, start_year, end_year, cgpa, sort_order, published)
select 'Jadavpur University', 'B.E.', 'Civil Engineering', 2022, null, null, 1, true
where not exists (
  select 1 from education where institution = 'Jadavpur University' and field = 'Civil Engineering'
);

insert into education (institution, degree, field, start_year, end_year, cgpa, sort_order, published)
select 'IIT Madras', 'BS', 'Data Science', 2023, null, null, 2, true
where not exists (
  select 1 from education where institution = 'IIT Madras' and field = 'Data Science'
);
