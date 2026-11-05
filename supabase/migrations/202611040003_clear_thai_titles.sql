-- Clear only the previously saved Thai-title values. Keep all anime records.
-- Execute after 202611040002_features.sql (or independently if only cleanup is needed).
update public.anime
set title_th = null
where title_th is not null;
