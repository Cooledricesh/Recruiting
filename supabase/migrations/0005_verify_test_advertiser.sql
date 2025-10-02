-- Verify test advertiser for development
-- Run this migration to enable testing of advertiser features

UPDATE advertiser_profiles
SET is_verified = true
WHERE user_id = 'bfbb9a15-e7b7-4033-83d3-ab17262f9fe8';
