-- Canonical tag vocabulary (CMS spec section 19) and the domain-node
-- map (primary domains + role lenses from the nav spec), with the
-- node -> tag resolution stored as data rather than hard-coded in
-- frontend components.

insert into tags (name, slug, type) values
  ('Engineering', 'engineering', 'domain'),
  ('Civil', 'civil', 'skill'),
  ('Structural', 'structural', 'skill'),
  ('BIM', 'bim', 'skill'),
  ('Data', 'data', 'domain'),
  ('Data Science', 'data-science', 'skill'),
  ('Data Engineering', 'data-engineering', 'skill'),
  ('Machine Learning', 'machine-learning', 'skill'),
  ('Analytics', 'analytics', 'skill'),
  ('Business', 'business', 'domain'),
  ('Business Analytics', 'business-analytics', 'skill'),
  ('Decision Analytics', 'decision-analytics', 'skill'),
  ('Operations', 'operations', 'skill'),
  ('Strategy', 'strategy', 'skill'),
  ('Tech', 'tech', 'domain'),
  ('Software', 'software', 'skill'),
  ('Cloud', 'cloud', 'skill'),
  ('Python', 'python', 'tool'),
  ('SQL', 'sql', 'tool'),
  ('Core', 'core', 'domain'),
  ('Core Consultancy', 'core-consultancy', 'domain'),
  ('Consulting', 'consulting', 'skill'),
  ('Miscellaneous', 'miscellaneous', 'domain'),
  ('Leadership', 'leadership', 'skill'),
  ('Entrepreneurship', 'entrepreneurship', 'skill'),
  ('Marketing', 'marketing', 'skill'),
  ('Management', 'management', 'skill')
on conflict (slug) do nothing;

-- Primary domains: the four main career-map nodes.
insert into domain_nodes (slug, label, level, sort_order) values
  ('engineering', 'ENGINEERING', 'primary', 1),
  ('data-ai', 'DATA + AI', 'primary', 2),
  ('business-analytics', 'BUSINESS + ANALYTICS', 'primary', 3),
  ('leadership', 'LEADERSHIP + ENTREPRENEURSHIP', 'primary', 4)
on conflict (slug) do nothing;

-- Role lenses: the secondary filter set from the nav spec.
insert into domain_nodes (slug, label, level, sort_order) values
  ('core', 'CORE', 'lens', 1),
  ('core-consultancy', 'CORE CONSULTANCY', 'lens', 2),
  ('tech', 'TECH', 'lens', 3),
  ('data-analytics-lens', 'DATA / ANALYTICS', 'lens', 4),
  ('business-lens', 'BUSINESS', 'lens', 5),
  ('miscellaneous', 'MISCELLANEOUS', 'lens', 6)
on conflict (slug) do nothing;

insert into domain_node_tags (domain_node_id, tag_id)
select dn.id, t.id
from (values
  ('engineering', 'engineering'), ('engineering', 'civil'), ('engineering', 'structural'), ('engineering', 'bim'),
  ('data-ai', 'data'), ('data-ai', 'data-science'), ('data-ai', 'data-engineering'), ('data-ai', 'machine-learning'), ('data-ai', 'analytics'),
  ('business-analytics', 'business'), ('business-analytics', 'business-analytics'), ('business-analytics', 'analytics'), ('business-analytics', 'decision-analytics'), ('business-analytics', 'operations'), ('business-analytics', 'strategy'),
  ('leadership', 'leadership'), ('leadership', 'entrepreneurship'), ('leadership', 'marketing'), ('leadership', 'management'),
  ('core', 'core'), ('core', 'engineering'), ('core', 'civil'), ('core', 'structural'), ('core', 'bim'),
  ('core-consultancy', 'core-consultancy'), ('core-consultancy', 'engineering'), ('core-consultancy', 'structural'), ('core-consultancy', 'bim'), ('core-consultancy', 'consulting'), ('core-consultancy', 'analytics'),
  ('tech', 'tech'), ('tech', 'software'), ('tech', 'cloud'), ('tech', 'data-engineering'), ('tech', 'python'), ('tech', 'sql'),
  ('data-analytics-lens', 'data'), ('data-analytics-lens', 'data-science'), ('data-analytics-lens', 'data-engineering'), ('data-analytics-lens', 'machine-learning'), ('data-analytics-lens', 'analytics'),
  ('business-lens', 'business'), ('business-lens', 'business-analytics'), ('business-lens', 'decision-analytics'), ('business-lens', 'strategy'), ('business-lens', 'operations'),
  ('miscellaneous', 'miscellaneous'), ('miscellaneous', 'leadership'), ('miscellaneous', 'entrepreneurship'), ('miscellaneous', 'marketing'), ('miscellaneous', 'management')
) as x(node_slug, tag_slug)
join domain_nodes dn on dn.slug = x.node_slug
join tags t on t.slug = x.tag_slug
on conflict do nothing;
