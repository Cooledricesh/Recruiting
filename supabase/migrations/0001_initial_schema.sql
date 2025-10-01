-- SuperNext 초기 데이터베이스 스키마
-- 생성일: 2025-10-01
-- 설명: 광고주와 인플루언서를 연결하는 체험단 플랫폼의 핵심 테이블 구조

-- ==============================
-- 1. 사용자 기본 프로필
-- ==============================
-- Supabase Auth와 연동되는 사용자 기본 정보
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  birth_date DATE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('advertiser', 'influencer')),
  terms_agreed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE profiles IS '사용자 기본 프로필 정보';
COMMENT ON COLUMN profiles.birth_date IS '생년월일';
COMMENT ON COLUMN profiles.role IS '사용자 역할: advertiser(광고주) 또는 influencer(인플루언서)';
COMMENT ON COLUMN profiles.terms_agreed_at IS '서비스 이용약관 동의 시간';

-- ==============================
-- 2. 인플루언서 프로필
-- ==============================
-- 인플루언서 역할 사용자의 추가 정보
CREATE TABLE IF NOT EXISTS influencer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE influencer_profiles IS '인플루언서 추가 프로필 정보';
COMMENT ON COLUMN influencer_profiles.is_verified IS '인플루언서 인증 여부';

-- ==============================
-- 3. 인플루언서 SNS 채널
-- ==============================
-- 인플루언서가 등록한 SNS 채널 정보
CREATE TABLE IF NOT EXISTS influencer_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  channel_type VARCHAR(20) NOT NULL CHECK (channel_type IN ('naver', 'youtube', 'instagram', 'threads')),
  channel_name VARCHAR(100) NOT NULL,
  channel_url VARCHAR(500) NOT NULL,
  follower_count INTEGER DEFAULT 0,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(influencer_id, channel_type, channel_url)
);

COMMENT ON TABLE influencer_channels IS '인플루언서 SNS 채널 정보';
COMMENT ON COLUMN influencer_channels.channel_type IS 'SNS 플랫폼 유형';
COMMENT ON COLUMN influencer_channels.channel_name IS '채널 이름';
COMMENT ON COLUMN influencer_channels.follower_count IS '팔로워수';
COMMENT ON COLUMN influencer_channels.verification_status IS '채널 인증 상태';

-- ==============================
-- 4. 광고주 프로필
-- ==============================
-- 광고주 역할 사용자의 추가 정보
CREATE TABLE IF NOT EXISTS advertiser_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(200) NOT NULL,
  address VARCHAR(500) NOT NULL,
  location VARCHAR(500) NOT NULL,
  store_phone VARCHAR(20) NOT NULL,
  category VARCHAR(100) NOT NULL,
  business_number VARCHAR(50) NOT NULL UNIQUE,
  representative_name VARCHAR(100) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE advertiser_profiles IS '광고주 추가 프로필 정보';
COMMENT ON COLUMN advertiser_profiles.company_name IS '업체명';
COMMENT ON COLUMN advertiser_profiles.address IS '주소';
COMMENT ON COLUMN advertiser_profiles.location IS '업체 위치';
COMMENT ON COLUMN advertiser_profiles.store_phone IS '업장 전화번호';
COMMENT ON COLUMN advertiser_profiles.category IS '업체 카테고리';
COMMENT ON COLUMN advertiser_profiles.business_number IS '사업자 등록번호';
COMMENT ON COLUMN advertiser_profiles.representative_name IS '대표자명';
COMMENT ON COLUMN advertiser_profiles.is_verified IS '사업자 인증 여부';

-- ==============================
-- 5. 체험단 캠페인
-- ==============================
-- 광고주가 등록한 체험단 캠페인 정보
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES advertiser_profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  recruitment_start DATE NOT NULL,
  recruitment_end DATE NOT NULL,
  recruitment_count INTEGER NOT NULL CHECK (recruitment_count > 0),
  benefits TEXT NOT NULL,
  mission TEXT NOT NULL,
  store_info TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'closed', 'selected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE campaigns IS '체험단 캠페인 정보';
COMMENT ON COLUMN campaigns.title IS '체험단 제목';
COMMENT ON COLUMN campaigns.recruitment_start IS '모집 시작일';
COMMENT ON COLUMN campaigns.recruitment_end IS '모집 종료일';
COMMENT ON COLUMN campaigns.recruitment_count IS '모집 인원';
COMMENT ON COLUMN campaigns.benefits IS '제공 혜택';
COMMENT ON COLUMN campaigns.mission IS '체험단 미션';
COMMENT ON COLUMN campaigns.store_info IS '매장 정보';
COMMENT ON COLUMN campaigns.status IS '캠페인 상태: recruiting(모집중), closed(모집종료), selected(선정완료)';

-- ==============================
-- 6. 체험단 지원
-- ==============================
-- 인플루언서의 체험단 지원 정보
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  visit_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'applied' CHECK (status IN ('applied', 'selected', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, influencer_id)
);

COMMENT ON TABLE applications IS '체험단 지원 정보';
COMMENT ON COLUMN applications.message IS '지원 시 각오 한마디';
COMMENT ON COLUMN applications.visit_date IS '방문 예정 일자';
COMMENT ON COLUMN applications.status IS '지원 상태: applied(지원완료), selected(선정), rejected(반려)';

-- ==============================
-- 7. updated_at 자동 업데이트 트리거 함수
-- ==============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================
-- 8. 각 테이블에 updated_at 트리거 적용
-- ==============================
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_profiles_updated_at
  BEFORE UPDATE ON influencer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_channels_updated_at
  BEFORE UPDATE ON influencer_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertiser_profiles_updated_at
  BEFORE UPDATE ON advertiser_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================
-- 9. 성능 최적화를 위한 인덱스 생성
-- ==============================
-- 캠페인 조회 최적화
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_recruitment_dates ON campaigns(recruitment_start, recruitment_end);
CREATE INDEX idx_campaigns_advertiser_id ON campaigns(advertiser_id);

-- 지원 관련 조회 최적화
CREATE INDEX idx_applications_campaign_id ON applications(campaign_id);
CREATE INDEX idx_applications_influencer_id ON applications(influencer_id);
CREATE INDEX idx_applications_status ON applications(status);

-- 프로필 조회 최적화
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_influencer_channels_influencer_id ON influencer_channels(influencer_id);
CREATE INDEX idx_influencer_channels_verification_status ON influencer_channels(verification_status);

-- ==============================
-- 10. Row Level Security (RLS) 비활성화
-- ==============================
-- 프로젝트 요구사항에 따라 RLS 비활성화
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE advertiser_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;