-- This script will be run after user signs up to create default categories
-- Note: This is a template. The actual seeding will happen in the app after user authentication

-- Function to seed default categories for a user
CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, emoji, color, is_distraction) VALUES
    (p_user_id, 'YouTube', '📺', '#FF0000', TRUE),
    (p_user_id, 'TikTok', '🎵', '#000000', TRUE),
    (p_user_id, 'Estudio', '📚', '#4CAF50', FALSE),
    (p_user_id, 'Trabajo', '💼', '#2196F3', FALSE),
    (p_user_id, 'Ejercicio', '🏃', '#FF9800', FALSE),
    (p_user_id, 'Cocina', '🍳', '#795548', FALSE),
    (p_user_id, 'Dormir', '😴', '#9C27B0', FALSE),
    (p_user_id, 'Aseo', '🚿', '#00BCD4', FALSE),
    (p_user_id, 'Redes Sociales', '📱', '#E91E63', TRUE),
    (p_user_id, 'Juegos', '🎮', '#673AB7', TRUE),
    (p_user_id, 'Lectura', '📖', '#009688', FALSE),
    (p_user_id, 'Meditación', '🧘', '#8BC34A', FALSE)
  ON CONFLICT DO NOTHING;
END;
$$;
