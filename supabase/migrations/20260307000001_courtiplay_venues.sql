-- Courtiplay Slovenia venue data
-- Scraped 2026-03-07

-- Clear existing mock venues and courts
DELETE FROM court_bookings WHERE court_id IN (SELECT id FROM courts WHERE venue_id IN (SELECT id FROM venues WHERE country = 'SI'));
DELETE FROM courts WHERE venue_id IN (SELECT id FROM venues WHERE country = 'SI');
DELETE FROM venues WHERE country = 'SI';

-- ─── VENUES ───────────────────────────────────────────────────────────────────

INSERT INTO venues (id, name, city, country, address, phone, website, surfaces, is_active) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Tenis klub Kamnik', 'Kamnik', 'SI', 'Maistrova ulica 15a, Kamnik', '040 562 712', 'https://www.tkkamnik.si', ARRAY['clay'], true),
  ('a1000000-0000-0000-0000-000000000002', 'TK Stražišče', 'Kranj', 'SI', 'Stražišče, Kranj', null, null, ARRAY['clay'], true),
  ('a1000000-0000-0000-0000-000000000003', 'Tenis Ruski car', 'Ljubljana', 'SI', 'Ljubljana', null, null, ARRAY['clay', 'hard'], true),
  ('a1000000-0000-0000-0000-000000000004', 'TK Mengeš', 'Mengeš', 'SI', 'Mengeš', null, null, ARRAY['clay'], true),
  ('a1000000-0000-0000-0000-000000000005', 'TK Duplica', 'Kamnik', 'SI', 'Duplica, Kamnik', null, null, ARRAY['clay'], true),
  ('a1000000-0000-0000-0000-000000000006', 'TK Radlje', 'Radlje ob Dravi', 'SI', 'Radlje ob Dravi', null, null, ARRAY['clay'], true),
  ('a1000000-0000-0000-0000-000000000007', 'Šobec', 'Lesce', 'SI', 'Lesce', null, null, ARRAY['clay', 'hard'], true),
  ('a1000000-0000-0000-0000-000000000008', 'Tenis Kamp Danica', 'Bohinjska Bistrica', 'SI', 'Bohinjska Bistrica', null, null, ARRAY['clay'], true),
  ('a1000000-0000-0000-0000-000000000009', 'Bernardi', 'Domžale', 'SI', 'Domžale', null, null, ARRAY['clay', 'hard'], true),
  ('a1000000-0000-0000-0000-000000000010', 'Teniško društvo Dovce', 'Rakek', 'SI', 'Rakek', null, null, ARRAY['clay'], true),
  ('a1000000-0000-0000-0000-000000000011', 'Tenis Gušt Bar', 'Stari trg pri Ložu', 'SI', 'Stari trg pri Ložu', null, null, ARRAY['clay'], true),
  ('a1000000-0000-0000-0000-000000000012', 'Tenis hala GOKOP', 'Zgornja Kungota', 'SI', 'Zgornja Kungota', null, null, ARRAY['indoor'], true),
  ('a1000000-0000-0000-0000-000000000013', 'Cokan Tennis Academy', 'Šempeter v Savinjski dolini', 'SI', 'Šempeter v Savinjski dolini', null, null, ARRAY['clay', 'hard'], true),
  ('a1000000-0000-0000-0000-000000000014', 'Teniški klub Murska Sobota', 'Murska Sobota', 'SI', 'Murska Sobota', null, null, ARRAY['clay'], true),
  ('a1000000-0000-0000-0000-000000000015', 'Tenis Padel Šmartno', 'Ljubljana', 'SI', 'Šmartno, Ljubljana', null, null, ARRAY['clay', 'hard'], true),
  ('a1000000-0000-0000-0000-000000000016', 'Tenis Center Murko', 'Slovenj Gradec', 'SI', 'Slovenj Gradec', null, null, ARRAY['clay', 'indoor'], true),
  ('a1000000-0000-0000-0000-000000000017', 'Tenis Portorož', 'Portorož', 'SI', 'Portorož', null, null, ARRAY['clay', 'hard'], true),
  ('a1000000-0000-0000-0000-000000000018', 'Tenis in Padel Koroška', 'Slovenj Gradec', 'SI', 'Slovenj Gradec', null, null, ARRAY['indoor'], true),
  ('a1000000-0000-0000-0000-000000000019', 'Šport park Krsnik', 'Pesnica pri Mariboru', 'SI', 'Pesnica pri Mariboru', null, null, ARRAY['clay', 'hard'], true),
  ('a1000000-0000-0000-0000-000000000020', 'Rimski Vrelec', 'Kotlje', 'SI', 'Kotlje', null, null, ARRAY['clay'], true);

-- ─── COURTS ───────────────────────────────────────────────────────────────────

-- Tenis klub Kamnik (7 courts, clay, 10€/h = 1000 cents)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Igrišče 1', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Igrišče 2', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Igrišče 3', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Igrišče 4', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Igrišče 5', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'Igrišče 6', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'Mini igrišče', 'clay', false, 500, true);

-- TK Stražišče Kranj (4 courts, clay, 8€/h)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002', 'Igrišče 1', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000002', 'Igrišče 2', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002', 'Igrišče 3', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000002', 'Igrišče 4', 'clay', false, 800, true);

-- Tenis Ruski car Ljubljana (3 courts, mixed)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000003', 'Igrišče 1', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000003', 'Igrišče 2', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000003', 'Igrišče 3', 'hard', false, 1000, true);

-- TK Mengeš (5 courts, clay)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000004', 'Igrišče 1', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000004', 'Igrišče 2', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000004', 'Igrišče 3', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000004', 'Igrišče 4', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000004', 'Igrišče 5', 'clay', false, 800, true);

-- TK Duplica Kamnik (9 courts, clay)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000005', 'Igrišče 1', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000005', 'Igrišče 2', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000005', 'Igrišče 3', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000005', 'Igrišče 4', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000005', 'Igrišče 5', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000005', 'Igrišče 6', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000005', 'Igrišče 7', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000005', 'Igrišče 8', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000028', 'a1000000-0000-0000-0000-000000000005', 'Igrišče 9', 'clay', false, 800, true);

-- TK Radlje (2 courts)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000029', 'a1000000-0000-0000-0000-000000000006', 'Igrišče 1', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000006', 'Igrišče 2', 'clay', false, 800, true);

-- Šobec Lesce (7 tennis courts)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000031', 'a1000000-0000-0000-0000-000000000007', 'Igrišče 1', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000032', 'a1000000-0000-0000-0000-000000000007', 'Igrišče 2', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000033', 'a1000000-0000-0000-0000-000000000007', 'Igrišče 3', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000034', 'a1000000-0000-0000-0000-000000000007', 'Igrišče 4', 'hard', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000035', 'a1000000-0000-0000-0000-000000000007', 'Igrišče 5', 'hard', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000036', 'a1000000-0000-0000-0000-000000000007', 'Igrišče 6', 'hard', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000037', 'a1000000-0000-0000-0000-000000000007', 'Igrišče 7', 'hard', false, 1000, true);

-- Tenis Kamp Danica (1 court)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000038', 'a1000000-0000-0000-0000-000000000008', 'Igrišče 1', 'clay', false, 800, true);

-- Bernardi Domžale (4 courts)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000039', 'a1000000-0000-0000-0000-000000000009', 'Igrišče 1', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000040', 'a1000000-0000-0000-0000-000000000009', 'Igrišče 2', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000041', 'a1000000-0000-0000-0000-000000000009', 'Igrišče 3', 'hard', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000042', 'a1000000-0000-0000-0000-000000000009', 'Igrišče 4', 'hard', false, 1000, true);

-- Teniško društvo Dovce (2 courts)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000043', 'a1000000-0000-0000-0000-000000000010', 'Igrišče 1', 'clay', false, 700, true),
  ('b1000000-0000-0000-0000-000000000044', 'a1000000-0000-0000-0000-000000000010', 'Igrišče 2', 'clay', false, 700, true);

-- Tenis Gušt Bar (2 courts)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000045', 'a1000000-0000-0000-0000-000000000011', 'Igrišče 1', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000046', 'a1000000-0000-0000-0000-000000000011', 'Igrišče 2', 'clay', false, 800, true);

-- Tenis hala GOKOP (4 courts, indoor)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000047', 'a1000000-0000-0000-0000-000000000012', 'Igrišče 1', 'hard', true, 1400, true),
  ('b1000000-0000-0000-0000-000000000048', 'a1000000-0000-0000-0000-000000000012', 'Igrišče 2', 'hard', true, 1400, true),
  ('b1000000-0000-0000-0000-000000000049', 'a1000000-0000-0000-0000-000000000012', 'Igrišče 3', 'hard', true, 1400, true),
  ('b1000000-0000-0000-0000-000000000050', 'a1000000-0000-0000-0000-000000000012', 'Igrišče 4', 'hard', true, 1400, true);

-- Cokan Tennis Academy (2 courts)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000051', 'a1000000-0000-0000-0000-000000000013', 'Igrišče 1', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000052', 'a1000000-0000-0000-0000-000000000013', 'Igrišče 2', 'hard', true, 1200, true);

-- Teniški klub Murska Sobota (10 courts)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000053', 'a1000000-0000-0000-0000-000000000014', 'Igrišče 1', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000054', 'a1000000-0000-0000-0000-000000000014', 'Igrišče 2', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000055', 'a1000000-0000-0000-0000-000000000014', 'Igrišče 3', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000056', 'a1000000-0000-0000-0000-000000000014', 'Igrišče 4', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000057', 'a1000000-0000-0000-0000-000000000014', 'Igrišče 5', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000058', 'a1000000-0000-0000-0000-000000000014', 'Igrišče 6', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000059', 'a1000000-0000-0000-0000-000000000014', 'Igrišče 7', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000060', 'a1000000-0000-0000-0000-000000000014', 'Igrišče 8', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000061', 'a1000000-0000-0000-0000-000000000014', 'Igrišče 9', 'clay', false, 800, true),
  ('b1000000-0000-0000-0000-000000000062', 'a1000000-0000-0000-0000-000000000014', 'Igrišče 10', 'clay', false, 800, true);

-- Tenis Padel Šmartno Ljubljana (3 courts)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000063', 'a1000000-0000-0000-0000-000000000015', 'Igrišče 1', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000064', 'a1000000-0000-0000-0000-000000000015', 'Igrišče 2', 'clay', false, 1000, true),
  ('b1000000-0000-0000-0000-000000000065', 'a1000000-0000-0000-0000-000000000015', 'Igrišče 3', 'hard', false, 1000, true);

-- Tenis Center Murko Slovenj Gradec (7 courts)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000066', 'a1000000-0000-0000-0000-000000000016', 'Igrišče 1', 'clay', false, 900, true),
  ('b1000000-0000-0000-0000-000000000067', 'a1000000-0000-0000-0000-000000000016', 'Igrišče 2', 'clay', false, 900, true),
  ('b1000000-0000-0000-0000-000000000068', 'a1000000-0000-0000-0000-000000000016', 'Igrišče 3', 'clay', false, 900, true),
  ('b1000000-0000-0000-0000-000000000069', 'a1000000-0000-0000-0000-000000000016', 'Igrišče 4', 'clay', false, 900, true),
  ('b1000000-0000-0000-0000-000000000070', 'a1000000-0000-0000-0000-000000000016', 'Igrišče 5', 'clay', false, 900, true),
  ('b1000000-0000-0000-0000-000000000071', 'a1000000-0000-0000-0000-000000000016', 'Hala 1', 'hard', true, 1400, true),
  ('b1000000-0000-0000-0000-000000000072', 'a1000000-0000-0000-0000-000000000016', 'Hala 2', 'hard', true, 1400, true);

-- Tenis Portorož (12 courts)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000073', 'a1000000-0000-0000-0000-000000000017', 'Igrišče 1', 'clay', false, 1200, true),
  ('b1000000-0000-0000-0000-000000000074', 'a1000000-0000-0000-0000-000000000017', 'Igrišče 2', 'clay', false, 1200, true),
  ('b1000000-0000-0000-0000-000000000075', 'a1000000-0000-0000-0000-000000000017', 'Igrišče 3', 'clay', false, 1200, true),
  ('b1000000-0000-0000-0000-000000000076', 'a1000000-0000-0000-0000-000000000017', 'Igrišče 4', 'clay', false, 1200, true),
  ('b1000000-0000-0000-0000-000000000077', 'a1000000-0000-0000-0000-000000000017', 'Igrišče 5', 'clay', false, 1200, true),
  ('b1000000-0000-0000-0000-000000000078', 'a1000000-0000-0000-0000-000000000017', 'Igrišče 6', 'clay', false, 1200, true),
  ('b1000000-0000-0000-0000-000000000079', 'a1000000-0000-0000-0000-000000000017', 'Igrišče 7', 'clay', false, 1200, true),
  ('b1000000-0000-0000-0000-000000000080', 'a1000000-0000-0000-0000-000000000017', 'Igrišče 8', 'clay', false, 1200, true),
  ('b1000000-0000-0000-0000-000000000081', 'a1000000-0000-0000-0000-000000000017', 'Igrišče 9', 'hard', false, 1200, true),
  ('b1000000-0000-0000-0000-000000000082', 'a1000000-0000-0000-0000-000000000017', 'Igrišče 10', 'hard', false, 1200, true),
  ('b1000000-0000-0000-0000-000000000083', 'a1000000-0000-0000-0000-000000000017', 'Igrišče 11', 'hard', false, 1200, true),
  ('b1000000-0000-0000-0000-000000000084', 'a1000000-0000-0000-0000-000000000017', 'Igrišče 12', 'hard', false, 1200, true);

-- Tenis in Padel Koroška Slovenj Gradec (1 tennis court indoor)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000085', 'a1000000-0000-0000-0000-000000000018', 'Teniško igrišče', 'hard', true, 1400, true);

-- Šport park Krsnik Pesnica pri Mariboru (1 tennis court)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000086', 'a1000000-0000-0000-0000-000000000019', 'Teniško igrišče', 'clay', false, 900, true);

-- Rimski Vrelec Kotlje (1 tennis court)
INSERT INTO courts (id, venue_id, name, surface, is_indoor, price_per_hour, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000087', 'a1000000-0000-0000-0000-000000000020', 'Teniško igrišče', 'clay', false, 800, true);
