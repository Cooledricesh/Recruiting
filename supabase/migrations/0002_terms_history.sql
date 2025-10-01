-- 약관 동의 이력 테이블
-- 생성일: 2025-10-01
-- 설명: 사용자의 약관 동의 이력을 저장하는 테이블

-- ==============================
-- 1. 약관 동의 이력 테이블
-- ==============================
CREATE TABLE IF NOT EXISTS terms_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  terms_type VARCHAR(50) NOT NULL CHECK (terms_type IN ('service', 'privacy', 'marketing', 'age')),
  terms_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  agreed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE terms_history IS '사용자 약관 동의 이력';
COMMENT ON COLUMN terms_history.terms_type IS '약관 유형: service(서비스이용약관), privacy(개인정보처리방침), marketing(마케팅동의), age(나이확인)';
COMMENT ON COLUMN terms_history.terms_version IS '약관 버전';
COMMENT ON COLUMN terms_history.agreed_at IS '동의 시간';
COMMENT ON COLUMN terms_history.ip_address IS '동의 시 IP 주소';
COMMENT ON COLUMN terms_history.user_agent IS '동의 시 User Agent';

-- ==============================
-- 2. 인덱스 생성
-- ==============================
CREATE INDEX idx_terms_history_user_id ON terms_history(user_id);
CREATE INDEX idx_terms_history_agreed_at ON terms_history(agreed_at);
CREATE INDEX idx_terms_history_terms_type ON terms_history(terms_type);

-- ==============================
-- 3. Row Level Security (RLS) 비활성화
-- ==============================
ALTER TABLE terms_history DISABLE ROW LEVEL SECURITY;