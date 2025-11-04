-- Add RPC function for atomic token usage increment
CREATE OR REPLACE FUNCTION increment_token_usage(user_id UUID, tokens_used INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.token_usage 
  SET used = used + tokens_used,
      updated_at = NOW()
  WHERE token_usage.user_id = increment_token_usage.user_id;
  
  -- If no row was updated, it means the user doesn't have a token_usage record yet
  IF NOT FOUND THEN
    INSERT INTO public.token_usage (user_id, used, reset_date)
    VALUES (
      increment_token_usage.user_id,
      tokens_used,
      (NOW() + INTERVAL '1 month')::timestamp with time zone
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;