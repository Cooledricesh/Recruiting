-- 인플루언서 채널 인덱스 추가
-- 생성일: 2025-10-02
-- 설명: 인플루언서 채널 조회 및 검증을 위한 인덱스 추가

-- ==============================
-- 1. 채널 URL 인덱스 (빠른 중복 체크)
-- ==============================
CREATE INDEX IF NOT EXISTS idx_influencer_channels_url
ON influencer_channels(channel_url);

-- ==============================
-- 2. 채널 검증 상태 인덱스 (검증 작업 조회)
-- ==============================
CREATE INDEX IF NOT EXISTS idx_influencer_channels_verification
ON influencer_channels(verification_status)
WHERE verification_status = 'pending';

-- ==============================
-- 3. 인플루언서별 채널 조회 인덱스
-- ==============================
CREATE INDEX IF NOT EXISTS idx_influencer_channels_influencer_id
ON influencer_channels(influencer_id);

-- ==============================
-- 4. 채널 타입별 조회 인덱스
-- ==============================
CREATE INDEX IF NOT EXISTS idx_influencer_channels_type
ON influencer_channels(channel_type);

-- ==============================
-- 5. Row Level Security (RLS) 비활성화
-- ==============================
ALTER TABLE influencer_channels DISABLE ROW LEVEL SECURITY;