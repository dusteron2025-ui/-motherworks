-- ============================================
-- SEED DATA FOR DEVELOPMENT
-- Run after schema.sql
-- ============================================

-- Insert sample services
INSERT INTO public.services (id, name, description, icon, base_price, duration_hours, category) VALUES
    ('srv-cleaning', 'Limpeza Residencial', 'Limpeza completa da casa ou apartamento', 'Sparkles', 12.00, 3, 'cleaning'),
    ('srv-deepclean', 'Limpeza Profunda', 'Limpeza detalhada incluindo áreas difíceis', 'SprayCanIcon', 18.00, 4, 'cleaning'),
    ('srv-ironing', 'Passar Roupa', 'Serviço de passar e organizar roupas', 'Shirt', 10.00, 2, 'laundry'),
    ('srv-cooking', 'Cozinhar', 'Preparação de refeições', 'ChefHat', 15.00, 3, 'cooking'),
    ('srv-babysitting', 'Babysitting', 'Cuidado de crianças', 'Baby', 14.00, 4, 'childcare'),
    ('srv-eldercare', 'Cuidado de Idosos', 'Acompanhamento e cuidados', 'Heart', 16.00, 4, 'eldercare'),
    ('srv-petcare', 'Pet Care', 'Cuidado de animais de estimação', 'Dog', 12.00, 2, 'petcare'),
    ('srv-organizing', 'Organização', 'Organização de armários e espaços', 'Archive', 14.00, 3, 'organizing');

-- Note: Users, provider_profiles, and wallets are created automatically
-- via the handle_new_user() trigger when a user signs up through Supabase Auth
