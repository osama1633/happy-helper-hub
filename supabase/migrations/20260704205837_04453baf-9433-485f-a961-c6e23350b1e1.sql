
-- =========================================
-- ENUMS
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'delivered', 'cancelled');

-- =========================================
-- PROFILES
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are readable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, image)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- USER ROLES
-- =========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Auto-assign 'user' role on signup, and grant admin to the demo account
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;
  IF NEW.email = 'osama10@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- =========================================
-- CARS
-- =========================================
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  year INT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  mileage INT NOT NULL DEFAULT 0,
  horsepower INT NOT NULL,
  engine TEXT NOT NULL,
  transmission TEXT NOT NULL,
  top_speed INT NOT NULL,
  description TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  gallery_images TEXT[] NOT NULL DEFAULT '{}',
  available BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cars TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cars TO authenticated;
GRANT ALL ON public.cars TO service_role;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cars are viewable by everyone" ON public.cars FOR SELECT USING (true);
CREATE POLICY "Admins can insert cars" ON public.cars FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update cars" ON public.cars FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete cars" ON public.cars FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_cars_brand ON public.cars(brand);
CREATE INDEX idx_cars_price ON public.cars(price);
CREATE INDEX idx_cars_year ON public.cars(year);

-- =========================================
-- ORDERS
-- =========================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE RESTRICT,
  status public.order_status NOT NULL DEFAULT 'pending',
  total_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- WISHLIST
-- =========================================
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, car_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON public.wishlist FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================
-- CONTACT MESSAGES
-- =========================================
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a message" ON public.contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read messages" ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- SEED 25 LUXURY CARS
-- =========================================
INSERT INTO public.cars (title, slug, brand, year, price, mileage, horsepower, engine, transmission, top_speed, description, featured_image, gallery_images, featured) VALUES
('Lamborghini Aventador SVJ', 'lamborghini-aventador-svj', 'Lamborghini', 2023, 517000, 1200, 770, '6.5L V12', '7-speed ISR', 350, 'The pinnacle of naturally aspirated V12 supercars. Aerodynamic mastery meets raw Italian passion.', '/cars/lamborghini.jpg', ARRAY['/cars/lamborghini.jpg','/cars/mclaren.jpg','/cars/ferrari.jpg'], true),
('Lamborghini Huracán STO', 'lamborghini-huracan-sto', 'Lamborghini', 2024, 328000, 800, 630, '5.2L V10', '7-speed DCT', 310, 'Track-bred road car with racing DNA extracted from the Huracán Super Trofeo Evo.', '/cars/lamborghini.jpg', ARRAY['/cars/lamborghini.jpg','/cars/porsche.jpg'], false),
('Lamborghini Revuelto', 'lamborghini-revuelto', 'Lamborghini', 2025, 608000, 500, 1001, '6.5L V12 Hybrid', '8-speed DCT', 350, 'The first HPEV (High Performance Electrified Vehicle) from Sant''Agata Bolognese.', '/cars/lamborghini.jpg', ARRAY['/cars/lamborghini.jpg'], true),

('Ferrari SF90 Stradale', 'ferrari-sf90-stradale', 'Ferrari', 2023, 507000, 1500, 986, '4.0L V8 Hybrid', '8-speed DCT', 340, 'Ferrari''s first production plug-in hybrid delivering unprecedented performance.', '/cars/ferrari.jpg', ARRAY['/cars/ferrari.jpg','/cars/lamborghini.jpg'], true),
('Ferrari 296 GTB', 'ferrari-296-gtb', 'Ferrari', 2024, 322000, 900, 819, '3.0L V6 Hybrid', '8-speed DCT', 330, 'A new era for Ferrari — the 296 GTB redefines the concept of fun to drive.', '/cars/ferrari.jpg', ARRAY['/cars/ferrari.jpg'], false),
('Ferrari Roma', 'ferrari-roma', 'Ferrari', 2023, 247000, 3200, 612, '3.9L V8 Twin-Turbo', '8-speed DCT', 320, 'La Nuova Dolce Vita — timeless elegance meets modern performance.', '/cars/ferrari.jpg', ARRAY['/cars/ferrari.jpg'], false),

('Rolls-Royce Phantom VIII', 'rolls-royce-phantom-viii', 'Rolls Royce', 2024, 490000, 500, 563, '6.75L V12 Twin-Turbo', '8-speed Auto', 250, 'The most silent motor car in the world. A private sanctuary on wheels.', '/cars/rolls-royce.jpg', ARRAY['/cars/rolls-royce.jpg','/cars/bentley.jpg'], true),
('Rolls-Royce Cullinan Black Badge', 'rolls-royce-cullinan-black-badge', 'Rolls Royce', 2024, 435000, 1100, 600, '6.75L V12 Twin-Turbo', '8-speed Auto', 250, 'The most powerful Rolls-Royce ever created. Effortless luxury for any terrain.', '/cars/rolls-royce.jpg', ARRAY['/cars/rolls-royce.jpg'], false),
('Rolls-Royce Spectre', 'rolls-royce-spectre', 'Rolls Royce', 2025, 420000, 200, 577, 'Dual Electric Motor', 'Single-speed', 250, 'The first fully-electric Rolls-Royce. Silent, effortless, magnificent.', '/cars/rolls-royce.jpg', ARRAY['/cars/rolls-royce.jpg'], true),

('Bentley Continental GT Speed', 'bentley-continental-gt-speed', 'Bentley', 2024, 274000, 2100, 650, '6.0L W12 Twin-Turbo', '8-speed DCT', 335, 'The definitive luxury grand tourer, hand-crafted in Crewe, England.', '/cars/bentley.jpg', ARRAY['/cars/bentley.jpg','/cars/rolls-royce.jpg'], true),
('Bentley Bentayga EWB', 'bentley-bentayga-ewb', 'Bentley', 2024, 245000, 1800, 542, '4.0L V8 Twin-Turbo', '8-speed Auto', 290, 'Extended wheelbase luxury SUV with rear airline seat specification.', '/cars/bentley.jpg', ARRAY['/cars/bentley.jpg'], false),
('Bentley Flying Spur Mulliner', 'bentley-flying-spur-mulliner', 'Bentley', 2023, 265000, 3400, 626, '4.0L V8 Twin-Turbo', '8-speed DCT', 322, 'Bespoke luxury sedan crafted by Bentley''s master coachbuilders.', '/cars/bentley.jpg', ARRAY['/cars/bentley.jpg'], false),

('Porsche 911 GT3 RS', 'porsche-911-gt3-rs', 'Porsche', 2024, 241000, 1500, 518, '4.0L Flat-6', '7-speed PDK', 296, 'Motorsport DNA distilled into a road-legal weapon. Aero from another planet.', '/cars/porsche.jpg', ARRAY['/cars/porsche.jpg'], true),
('Porsche 911 Turbo S', 'porsche-911-turbo-s', 'Porsche', 2024, 231000, 2400, 640, '3.8L Flat-6 Twin-Turbo', '8-speed PDK', 330, 'The benchmark supercar — devastatingly fast in any condition.', '/cars/porsche.jpg', ARRAY['/cars/porsche.jpg'], false),
('Porsche Taycan Turbo GT', 'porsche-taycan-turbo-gt', 'Porsche', 2025, 231000, 800, 1019, 'Dual Electric Motor', '2-speed', 305, 'The fastest four-door on the Nürburgring. Electric performance perfected.', '/cars/porsche.jpg', ARRAY['/cars/porsche.jpg'], false),

('McLaren 750S Spider', 'mclaren-750s-spider', 'McLaren', 2024, 345000, 900, 740, '4.0L V8 Twin-Turbo', '7-speed SSG', 332, 'Lighter, faster, more engaging — the quintessential McLaren experience.', '/cars/mclaren.jpg', ARRAY['/cars/mclaren.jpg'], true),
('McLaren Artura', 'mclaren-artura', 'McLaren', 2024, 237000, 1100, 671, '3.0L V6 Hybrid', '8-speed SSG', 330, 'A new dawn for McLaren — high-performance hybrid supercar with EV capability.', '/cars/mclaren.jpg', ARRAY['/cars/mclaren.jpg'], false),

('Mercedes-AMG GT 63 S E Performance', 'mercedes-amg-gt-63-s-e-performance', 'Mercedes AMG', 2024, 199000, 1800, 831, '4.0L V8 Hybrid', '9-speed AMG', 316, 'The most powerful AMG ever — F1-inspired hybrid technology.', '/cars/mercedes.jpg', ARRAY['/cars/mercedes.jpg'], true),
('Mercedes-AMG SL 63', 'mercedes-amg-sl-63', 'Mercedes AMG', 2024, 178000, 2500, 577, '4.0L V8 Twin-Turbo', '9-speed AMG', 315, 'The legendary SL returns — grand touring perfection.', '/cars/mercedes.jpg', ARRAY['/cars/mercedes.jpg'], false),
('Mercedes-AMG G 63', 'mercedes-amg-g-63', 'Mercedes AMG', 2024, 182000, 3200, 577, '4.0L V8 Twin-Turbo', '9-speed AMG', 240, 'The icon reimagined — off-road luxury with supercar performance.', '/cars/mercedes.jpg', ARRAY['/cars/mercedes.jpg'], false),

('BMW M8 Competition Coupé', 'bmw-m8-competition-coupe', 'BMW M', 2024, 145000, 2900, 617, '4.4L V8 Twin-Turbo', '8-speed M', 305, 'The ultimate M — luxury grand tourer with track-ready performance.', '/cars/bmw.jpg', ARRAY['/cars/bmw.jpg'], true),
('BMW M5 CS', 'bmw-m5-cs', 'BMW M', 2023, 143000, 4100, 627, '4.4L V8 Twin-Turbo', '8-speed M', 305, 'The most powerful production BMW ever — pure driving machine.', '/cars/bmw.jpg', ARRAY['/cars/bmw.jpg'], false),

('Audi RS e-tron GT Performance', 'audi-rs-etron-gt-performance', 'Audi RS', 2025, 167000, 1200, 912, 'Dual Electric Motor', '2-speed', 250, 'The most powerful production Audi — electric performance grand tourer.', '/cars/audi.jpg', ARRAY['/cars/audi.jpg'], true),
('Audi RS 7 Performance', 'audi-rs-7-performance', 'Audi RS', 2024, 128000, 3500, 621, '4.0L V8 Twin-Turbo', '8-speed Tiptronic', 305, 'A sculpture in motion — everyday supercar in a four-door package.', '/cars/audi.jpg', ARRAY['/cars/audi.jpg'], false),

('Aston Martin DB12', 'aston-martin-db12', 'Aston Martin', 2024, 245000, 1400, 671, '4.0L V8 Twin-Turbo', '8-speed Auto', 325, 'The world''s first Super Tourer — Aston Martin''s definitive grand tourer.', '/cars/aston-martin.jpg', ARRAY['/cars/aston-martin.jpg'], true);
