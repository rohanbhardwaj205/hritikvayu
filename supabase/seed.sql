-- ============================================================================
-- Seed Data for Vastrayug — Men's Streetwear & Casual Clothing
-- Run with: supabase db reset  (applies migrations + seed)
-- ============================================================================

-- ==========================================================================
-- Categories (6)
-- ==========================================================================
INSERT INTO public.categories (id, name, slug, description, sort_order, is_active) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Jeans',        'jeans',        'Premium denim jeans in slim, straight, and relaxed fits.',        1, TRUE),
    ('a1000000-0000-0000-0000-000000000002', 'Cargos',       'cargos',       'Functional cargo pants built for style and utility.',             2, TRUE),
    ('a1000000-0000-0000-0000-000000000003', 'Sweatshirts',  'sweatshirts',  'Cozy crewneck and graphic sweatshirts for layering.',            3, TRUE),
    ('a1000000-0000-0000-0000-000000000004', 'Hoodies',      'hoodies',      'Pullover and zip-up hoodies for everyday comfort.',               4, TRUE),
    ('a1000000-0000-0000-0000-000000000005', 'Shirts',       'shirts',       'Casual and semi-formal shirts in modern cuts.',                   5, TRUE),
    ('a1000000-0000-0000-0000-000000000006', 'T-Shirts',     't-shirts',     'Essential tees and graphic t-shirts in premium cotton.',           6, TRUE);


-- ==========================================================================
-- Products (12 — 2 per category)
-- ==========================================================================
INSERT INTO public.products (id, name, slug, description, rich_description, category_id, base_price, compare_price, is_active, is_featured, tags) VALUES

    -- ── Jeans ──────────────────────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000001',
     'Classic Slim Fit Jeans',
     'classic-slim-fit-jeans',
     'Clean, versatile slim fit jeans in premium stretch denim. A wardrobe essential that pairs with everything.',
     '<p>The <strong>Classic Slim Fit Jeans</strong> are crafted from premium stretch denim that holds its shape all day. Featuring a mid-rise waist, tapered leg, and clean wash finish — these are the jeans you will reach for every morning.</p><ul><li>98% Cotton, 2% Elastane</li><li>Mid-rise, slim through thigh</li><li>Machine washable</li></ul>',
     'a1000000-0000-0000-0000-000000000001',
     199900, 299900, TRUE, FALSE,
     ARRAY['jeans', 'slim-fit', 'denim', 'essentials']),

    ('b1000000-0000-0000-0000-000000000002',
     'Distressed Denim Jeans',
     'distressed-denim-jeans',
     'Street-ready distressed jeans with ripped knee detail and faded wash for an effortless edge.',
     '<p>Make a statement with these <strong>Distressed Denim Jeans</strong>. Featuring artfully placed rips at the knee, a faded mid-wash, and a relaxed slim fit that balances style with comfort.</p><ul><li>100% Cotton Denim</li><li>Relaxed slim fit</li><li>Ripped knee detail</li></ul>',
     'a1000000-0000-0000-0000-000000000001',
     249900, 349900, TRUE, FALSE,
     ARRAY['jeans', 'distressed', 'denim', 'streetwear']),

    -- ── Cargos ─────────────────────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000003',
     'Tactical Cargo Pants',
     'tactical-cargo-pants',
     'Rugged tactical cargo pants with multiple utility pockets and a tapered modern silhouette.',
     '<p>Built for function without sacrificing style, the <strong>Tactical Cargo Pants</strong> feature six utility pockets, a drawstring hem, and durable ripstop fabric that handles anything you throw at it.</p><ul><li>Cotton-nylon ripstop blend</li><li>6 utility pockets</li><li>Drawstring adjustable hem</li></ul>',
     'a1000000-0000-0000-0000-000000000002',
     179900, 249900, TRUE, FALSE,
     ARRAY['cargos', 'tactical', 'utility', 'streetwear']),

    ('b1000000-0000-0000-0000-000000000004',
     'Relaxed Fit Cargo Pants',
     'relaxed-fit-cargo-pants',
     'Easy-going relaxed fit cargos with an elastic waist and clean cargo pocket design.',
     '<p>Comfort meets utility in the <strong>Relaxed Fit Cargo Pants</strong>. An elastic waistband, relaxed cut through the leg, and streamlined cargo pockets make these perfect for weekends and everyday wear.</p><ul><li>100% Cotton twill</li><li>Elastic waist with drawstring</li><li>Relaxed fit through leg</li></ul>',
     'a1000000-0000-0000-0000-000000000002',
     159900, NULL, TRUE, FALSE,
     ARRAY['cargos', 'relaxed-fit', 'casual', 'comfort']),

    -- ── Sweatshirts ────────────────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000005',
     'Oversized Crewneck Sweatshirt',
     'oversized-crewneck-sweatshirt',
     'Dropped-shoulder oversized crewneck in heavyweight french terry. The ultimate layering piece.',
     '<p>The <strong>Oversized Crewneck Sweatshirt</strong> is made from 400 GSM french terry for that premium heavyweight feel. Dropped shoulders, ribbed cuffs, and a boxy silhouette give it that effortless oversized look.</p><ul><li>400 GSM French Terry</li><li>100% Cotton</li><li>Dropped shoulder, boxy fit</li></ul>',
     'a1000000-0000-0000-0000-000000000003',
     149900, 199900, TRUE, FALSE,
     ARRAY['sweatshirt', 'oversized', 'crewneck', 'winter']),

    ('b1000000-0000-0000-0000-000000000006',
     'Graphic Print Sweatshirt',
     'graphic-print-sweatshirt',
     'Statement graphic print sweatshirt with bold front artwork and a regular relaxed fit.',
     '<p>Express yourself with the <strong>Graphic Print Sweatshirt</strong>. Features a bold front graphic, soft brushed fleece lining, and a relaxed regular fit that works layered or on its own.</p><ul><li>350 GSM Brushed Fleece</li><li>Cotton-polyester blend</li><li>Screen-printed graphic</li></ul>',
     'a1000000-0000-0000-0000-000000000003',
     129900, NULL, TRUE, FALSE,
     ARRAY['sweatshirt', 'graphic', 'print', 'casual']),

    -- ── Hoodies ────────────────────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000007',
     'Premium Zip-Up Hoodie',
     'premium-zip-up-hoodie',
     'Full-zip hoodie in heavyweight fleece with a clean minimal design. Premium quality, everyday comfort.',
     '<p>The <strong>Premium Zip-Up Hoodie</strong> is built from 420 GSM heavyweight fleece for warmth that lasts. Features a full YKK zip, kangaroo pockets, and a double-lined hood for structure and durability.</p><ul><li>420 GSM Heavyweight Fleece</li><li>YKK zip closure</li><li>Double-lined hood</li><li>Kangaroo pockets</li></ul>',
     'a1000000-0000-0000-0000-000000000004',
     199900, 279900, TRUE, TRUE,
     ARRAY['hoodie', 'zip-up', 'premium', 'winter']),

    ('b1000000-0000-0000-0000-000000000008',
     'Pullover Fleece Hoodie',
     'pullover-fleece-hoodie',
     'Classic pullover hoodie with brushed fleece lining. Warm, soft, and built for layering.',
     '<p>A cold-weather essential, the <strong>Pullover Fleece Hoodie</strong> wraps you in ultra-soft brushed fleece. The relaxed fit, ribbed cuffs, and front kangaroo pocket make this the hoodie you will live in all winter.</p><ul><li>380 GSM Brushed Fleece</li><li>Relaxed pullover fit</li><li>Front kangaroo pocket</li></ul>',
     'a1000000-0000-0000-0000-000000000004',
     169900, NULL, TRUE, TRUE,
     ARRAY['hoodie', 'pullover', 'fleece', 'winter']),

    -- ── Shirts ─────────────────────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000009',
     'Oxford Button-Down Shirt',
     'oxford-button-down-shirt',
     'Timeless Oxford button-down in premium cotton. Dressed up or down, it always looks sharp.',
     '<p>The <strong>Oxford Button-Down Shirt</strong> is crafted from premium Oxford cotton with a soft, textured hand-feel. A button-down collar, curved hem, and tailored regular fit make it versatile enough for the office or a weekend brunch.</p><ul><li>Premium Oxford Cotton</li><li>Button-down collar</li><li>Regular tailored fit</li></ul>',
     'a1000000-0000-0000-0000-000000000005',
     149900, 199900, TRUE, TRUE,
     ARRAY['shirt', 'oxford', 'button-down', 'smart-casual']),

    ('b1000000-0000-0000-0000-000000000010',
     'Slim Fit Casual Shirt',
     'slim-fit-casual-shirt',
     'Modern slim fit shirt in soft washed cotton. Clean lines for a sharp, put-together look.',
     '<p>The <strong>Slim Fit Casual Shirt</strong> is made from garment-washed cotton for a lived-in softness from day one. Slim through the body with a spread collar and single chest pocket.</p><ul><li>Garment-washed cotton</li><li>Slim fit</li><li>Spread collar</li></ul>',
     'a1000000-0000-0000-0000-000000000005',
     129900, NULL, TRUE, FALSE,
     ARRAY['shirt', 'slim-fit', 'casual', 'cotton']),

    -- ── T-Shirts ───────────────────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000011',
     'Essential Cotton T-Shirt',
     'essential-cotton-t-shirt',
     'Your everyday essential tee in 100% combed cotton. Soft, breathable, and built to last.',
     '<p>The <strong>Essential Cotton T-Shirt</strong> is made from 180 GSM combed cotton for a soft, smooth feel against the skin. Pre-shrunk, reinforced collar, and a regular fit that flatters every body type.</p><ul><li>180 GSM Combed Cotton</li><li>Pre-shrunk fabric</li><li>Reinforced crew neck</li><li>Regular fit</li></ul>',
     'a1000000-0000-0000-0000-000000000006',
     69900, 99900, TRUE, TRUE,
     ARRAY['tshirt', 'essential', 'cotton', 'basics']),

    ('b1000000-0000-0000-0000-000000000012',
     'Oversized Graphic Tee',
     'oversized-graphic-tee',
     'Streetwear-inspired oversized tee with bold back print and dropped shoulders.',
     '<p>The <strong>Oversized Graphic Tee</strong> brings streetwear energy to your everyday rotation. Featuring a bold back graphic, dropped shoulders, and a boxy oversized fit in 200 GSM cotton.</p><ul><li>200 GSM Cotton</li><li>Oversized boxy fit</li><li>Bold back print</li><li>Dropped shoulders</li></ul>',
     'a1000000-0000-0000-0000-000000000006',
     89900, NULL, TRUE, FALSE,
     ARRAY['tshirt', 'oversized', 'graphic', 'streetwear']);


-- ==========================================================================
-- Product Images (2-3 per product)
-- ==========================================================================
INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_primary) VALUES
    -- Classic Slim Fit Jeans
    ('b1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop', 'Classic Slim Fit Jeans - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&h=800&fit=crop', 'Classic Slim Fit Jeans - Detail', 1, FALSE),
    ('b1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&h=800&fit=crop', 'Classic Slim Fit Jeans - Side', 2, FALSE),

    -- Distressed Denim Jeans
    ('b1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop', 'Distressed Denim Jeans - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1475178626620-a4d074967571?w=600&h=800&fit=crop', 'Distressed Denim Jeans - Detail', 1, FALSE),

    -- Tactical Cargo Pants
    ('b1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop', 'Tactical Cargo Pants - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&h=800&fit=crop', 'Tactical Cargo Pants - Side', 1, FALSE),
    ('b1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop', 'Tactical Cargo Pants - Detail', 2, FALSE),

    -- Relaxed Fit Cargo Pants
    ('b1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&h=800&fit=crop', 'Relaxed Fit Cargo Pants - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop', 'Relaxed Fit Cargo Pants - Side', 1, FALSE),

    -- Oversized Crewneck Sweatshirt
    ('b1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop', 'Oversized Crewneck Sweatshirt - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&h=800&fit=crop', 'Oversized Crewneck Sweatshirt - Back', 1, FALSE),
    ('b1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop', 'Oversized Crewneck Sweatshirt - Detail', 2, FALSE),

    -- Graphic Print Sweatshirt
    ('b1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&h=800&fit=crop', 'Graphic Print Sweatshirt - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop', 'Graphic Print Sweatshirt - Back', 1, FALSE),

    -- Premium Zip-Up Hoodie
    ('b1000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop', 'Premium Zip-Up Hoodie - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&h=800&fit=crop', 'Premium Zip-Up Hoodie - Side', 1, FALSE),
    ('b1000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop', 'Premium Zip-Up Hoodie - Detail', 2, FALSE),

    -- Pullover Fleece Hoodie
    ('b1000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&h=800&fit=crop', 'Pullover Fleece Hoodie - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop', 'Pullover Fleece Hoodie - Back', 1, FALSE),

    -- Oxford Button-Down Shirt
    ('b1000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop', 'Oxford Button-Down Shirt - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop', 'Oxford Button-Down Shirt - Detail', 1, FALSE),
    ('b1000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&h=800&fit=crop', 'Oxford Button-Down Shirt - Side', 2, FALSE),

    -- Slim Fit Casual Shirt
    ('b1000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop', 'Slim Fit Casual Shirt - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop', 'Slim Fit Casual Shirt - Back', 1, FALSE),

    -- Essential Cotton T-Shirt
    ('b1000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop', 'Essential Cotton T-Shirt - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1503341504253-dff4f94032fc?w=600&h=800&fit=crop', 'Essential Cotton T-Shirt - Flat Lay', 1, FALSE),
    ('b1000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop', 'Essential Cotton T-Shirt - Detail', 2, FALSE),

    -- Oversized Graphic Tee
    ('b1000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1503341504253-dff4f94032fc?w=600&h=800&fit=crop', 'Oversized Graphic Tee - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop', 'Oversized Graphic Tee - Back', 1, FALSE);


-- ==========================================================================
-- Product Variants
-- ==========================================================================
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, price_override, stock, low_stock_threshold, is_active) VALUES

    -- ── Classic Slim Fit Jeans (bottoms: 28/30/32/34) ──────────────────────
    ('b1000000-0000-0000-0000-000000000001', 'VY-CSFJ-BLK-28', '28', 'Black',  '#0A0A0A', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000001', 'VY-CSFJ-BLK-30', '30', 'Black',  '#0A0A0A', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000001', 'VY-CSFJ-BLK-32', '32', 'Black',  '#0A0A0A', NULL, 30, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000001', 'VY-CSFJ-NVY-30', '30', 'Navy',   '#1E3A5F', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000001', 'VY-CSFJ-NVY-32', '32', 'Navy',   '#1E3A5F', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000001', 'VY-CSFJ-NVY-34', '34', 'Navy',   '#1E3A5F', NULL, 15, 5, TRUE),

    -- ── Distressed Denim Jeans ─────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000002', 'VY-DDJ-BLU-28', '28', 'Blue',    '#4A6FA5', NULL, 15, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000002', 'VY-DDJ-BLU-30', '30', 'Blue',    '#4A6FA5', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000002', 'VY-DDJ-BLU-32', '32', 'Blue',    '#4A6FA5', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000002', 'VY-DDJ-BLK-30', '30', 'Black',   '#0A0A0A', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000002', 'VY-DDJ-BLK-32', '32', 'Black',   '#0A0A0A', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000002', 'VY-DDJ-BLK-34', '34', 'Black',   '#0A0A0A', NULL, 12, 5, TRUE),

    -- ── Tactical Cargo Pants ───────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000003', 'VY-TCP-OLV-28', '28', 'Olive',   '#556B2F', NULL, 15, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000003', 'VY-TCP-OLV-30', '30', 'Olive',   '#556B2F', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000003', 'VY-TCP-OLV-32', '32', 'Olive',   '#556B2F', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000003', 'VY-TCP-BLK-30', '30', 'Black',   '#0A0A0A', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000003', 'VY-TCP-BLK-32', '32', 'Black',   '#0A0A0A', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000003', 'VY-TCP-BLK-34', '34', 'Black',   '#0A0A0A', NULL, 14, 5, TRUE),

    -- ── Relaxed Fit Cargo Pants ────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000004', 'VY-RFCP-GRY-28', '28', 'Grey',   '#6B6B6B', NULL, 12, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000004', 'VY-RFCP-GRY-30', '30', 'Grey',   '#6B6B6B', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000004', 'VY-RFCP-GRY-32', '32', 'Grey',   '#6B6B6B', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000004', 'VY-RFCP-OLV-30', '30', 'Olive',  '#556B2F', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000004', 'VY-RFCP-OLV-32', '32', 'Olive',  '#556B2F', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000004', 'VY-RFCP-OLV-34', '34', 'Olive',  '#556B2F', NULL, 15, 5, TRUE),

    -- ── Oversized Crewneck Sweatshirt (tops: S/M/L/XL) ────────────────────
    ('b1000000-0000-0000-0000-000000000005', 'VY-OCS-BLK-S',  'S',  'Black',   '#0A0A0A', NULL, 15, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000005', 'VY-OCS-BLK-M',  'M',  'Black',   '#0A0A0A', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000005', 'VY-OCS-BLK-L',  'L',  'Black',   '#0A0A0A', NULL, 30, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000005', 'VY-OCS-GRY-M',  'M',  'Grey',    '#6B6B6B', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000005', 'VY-OCS-GRY-L',  'L',  'Grey',    '#6B6B6B', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000005', 'VY-OCS-GRY-XL', 'XL', 'Grey',    '#6B6B6B', NULL, 15, 5, TRUE),

    -- ── Graphic Print Sweatshirt ───────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000006', 'VY-GPS-BLK-S',  'S',  'Black',   '#0A0A0A', NULL, 12, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000006', 'VY-GPS-BLK-M',  'M',  'Black',   '#0A0A0A', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000006', 'VY-GPS-BLK-L',  'L',  'Black',   '#0A0A0A', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000006', 'VY-GPS-WHT-M',  'M',  'White',   '#FFFFFF', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000006', 'VY-GPS-WHT-L',  'L',  'White',   '#FFFFFF', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000006', 'VY-GPS-WHT-XL', 'XL', 'White',   '#FFFFFF', NULL, 10, 5, TRUE),

    -- ── Premium Zip-Up Hoodie ──────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000007', 'VY-PZH-BLK-S',  'S',  'Black',   '#0A0A0A', NULL, 15, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000007', 'VY-PZH-BLK-M',  'M',  'Black',   '#0A0A0A', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000007', 'VY-PZH-BLK-L',  'L',  'Black',   '#0A0A0A', NULL, 30, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000007', 'VY-PZH-NVY-M',  'M',  'Navy',    '#1E3A5F', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000007', 'VY-PZH-NVY-L',  'L',  'Navy',    '#1E3A5F', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000007', 'VY-PZH-NVY-XL', 'XL', 'Navy',    '#1E3A5F', NULL, 12, 5, TRUE),

    -- ── Pullover Fleece Hoodie ─────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000008', 'VY-PFH-GRY-S',  'S',  'Grey',    '#6B6B6B', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000008', 'VY-PFH-GRY-M',  'M',  'Grey',    '#6B6B6B', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000008', 'VY-PFH-GRY-L',  'L',  'Grey',    '#6B6B6B', NULL, 28, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000008', 'VY-PFH-BLK-M',  'M',  'Black',   '#0A0A0A', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000008', 'VY-PFH-BLK-L',  'L',  'Black',   '#0A0A0A', NULL, 26, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000008', 'VY-PFH-BLK-XL', 'XL', 'Black',   '#0A0A0A', NULL, 14, 5, TRUE),

    -- ── Oxford Button-Down Shirt ───────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000009', 'VY-OBS-WHT-S',  'S',  'White',   '#FFFFFF', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000009', 'VY-OBS-WHT-M',  'M',  'White',   '#FFFFFF', NULL, 28, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000009', 'VY-OBS-WHT-L',  'L',  'White',   '#FFFFFF', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000009', 'VY-OBS-NVY-M',  'M',  'Navy',    '#1E3A5F', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000009', 'VY-OBS-NVY-L',  'L',  'Navy',    '#1E3A5F', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000009', 'VY-OBS-NVY-XL', 'XL', 'Navy',    '#1E3A5F', NULL, 12, 5, TRUE),

    -- ── Slim Fit Casual Shirt ──────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000010', 'VY-SFCS-BLK-S',  'S',  'Black',  '#0A0A0A', NULL, 15, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000010', 'VY-SFCS-BLK-M',  'M',  'Black',  '#0A0A0A', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000010', 'VY-SFCS-BLK-L',  'L',  'Black',  '#0A0A0A', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000010', 'VY-SFCS-OLV-M',  'M',  'Olive',  '#556B2F', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000010', 'VY-SFCS-OLV-L',  'L',  'Olive',  '#556B2F', NULL, 16, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000010', 'VY-SFCS-OLV-XL', 'XL', 'Olive',  '#556B2F', NULL, 10, 5, TRUE),

    -- ── Essential Cotton T-Shirt ───────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-BLK-S',  'S',  'Black',   '#0A0A0A', NULL, 30, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-BLK-M',  'M',  'Black',   '#0A0A0A', NULL, 30, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-BLK-L',  'L',  'Black',   '#0A0A0A', NULL, 30, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-WHT-S',  'S',  'White',   '#FFFFFF', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-WHT-M',  'M',  'White',   '#FFFFFF', NULL, 28, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-WHT-L',  'L',  'White',   '#FFFFFF', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-GRY-M',  'M',  'Grey',    '#6B6B6B', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-GRY-L',  'L',  'Grey',    '#6B6B6B', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-GRY-XL', 'XL', 'Grey',    '#6B6B6B', NULL, 15, 5, TRUE),

    -- ── Oversized Graphic Tee ──────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000012', 'VY-OGT-BLK-S',  'S',  'Black',   '#0A0A0A', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000012', 'VY-OGT-BLK-M',  'M',  'Black',   '#0A0A0A', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000012', 'VY-OGT-BLK-L',  'L',  'Black',   '#0A0A0A', NULL, 28, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000012', 'VY-OGT-WHT-M',  'M',  'White',   '#FFFFFF', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000012', 'VY-OGT-WHT-L',  'L',  'White',   '#FFFFFF', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000012', 'VY-OGT-WHT-XL', 'XL', 'White',   '#FFFFFF', NULL, 12, 5, TRUE);


-- ==========================================================================
-- Coupons (2)
-- ==========================================================================
INSERT INTO public.coupons (id, code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, per_user_limit, valid_from, valid_until, is_active) VALUES
    ('c1000000-0000-0000-0000-000000000001',
     'FIRST10',
     '10% off on your first order (min cart value Rs 999)',
     'percentage',
     10,
     99900,        -- min Rs 999
     50000,        -- max discount Rs 500
     5000,
     1,
     '2026-01-01T00:00:00Z',
     '2026-12-31T23:59:59Z',
     TRUE),

    ('c1000000-0000-0000-0000-000000000002',
     'WINTER20',
     '20% off on hoodies & sweatshirts (min cart value Rs 1499)',
     'percentage',
     20,
     149900,       -- min Rs 1499
     100000,       -- max discount Rs 1000
     2000,
     2,
     '2026-01-01T00:00:00Z',
     '2026-03-31T23:59:59Z',
     TRUE);


-- ==========================================================================
-- Promotion (1)
-- ==========================================================================
INSERT INTO public.promotions (id, title, subtitle, image_url, link_url, sort_order, is_active, starts_at, ends_at) VALUES
    ('d1000000-0000-0000-0000-000000000001',
     'Winter Collection 2026',
     'Up to 30% off on hoodies, sweatshirts & more',
     'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&h=600&fit=crop',
     '/categories/hoodies',
     1,
     TRUE,
     '2026-01-01T00:00:00Z',
     '2026-03-31T23:59:59Z');


-- ==========================================================================
-- Platform Settings (ensure exactly 1 row exists)
-- ==========================================================================
INSERT INTO public.platform_settings (store_name, store_tagline, support_email, support_phone, free_shipping_threshold, gst_percentage)
VALUES ('Vastrayug', 'Premium Men''s Streetwear & Casual Clothing', 'support@vastrayug.com', '+91-9876543210', 99900, 18.00)
ON CONFLICT (id) DO NOTHING;
