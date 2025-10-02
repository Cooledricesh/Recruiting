-- 체험단 목록 테스트용 샘플 데이터
-- 생성일: 2025-10-02
-- 설명: 홈 페이지 체험단 목록 기능 테스트를 위한 샘플 데이터

-- ==============================
-- 1. 테스트용 프로필 생성 (광고주)
-- ==============================
DO $$
DECLARE
  test_user_id_1 UUID := '11111111-1111-1111-1111-111111111111';
  test_user_id_2 UUID := '22222222-2222-2222-2222-222222222222';
  test_user_id_3 UUID := '33333333-3333-3333-3333-333333333333';
  advertiser_profile_id_1 UUID;
  advertiser_profile_id_2 UUID;
  advertiser_profile_id_3 UUID;
BEGIN
  -- auth.users 테이블에 테스트 사용자 생성
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change)
  VALUES
    (test_user_id_1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'advertiser1@test.com', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"advertiser"}', false, '', '', '', ''),
    (test_user_id_2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'advertiser2@test.com', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"advertiser"}', false, '', '', '', ''),
    (test_user_id_3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'advertiser3@test.com', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"advertiser"}', false, '', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  -- 테스트 사용자 프로필 생성
  INSERT INTO profiles (id, name, phone, email, birth_date, role, terms_agreed_at, created_at)
  VALUES
    (test_user_id_1, '테스트 광고주1', '010-1111-1111', 'advertiser1@test.com', '1990-01-01', 'advertiser', NOW(), NOW()),
    (test_user_id_2, '테스트 광고주2', '010-2222-2222', 'advertiser2@test.com', '1985-05-15', 'advertiser', NOW(), NOW()),
    (test_user_id_3, '테스트 광고주3', '010-3333-3333', 'advertiser3@test.com', '1988-08-20', 'advertiser', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- 광고주 프로필 생성
  INSERT INTO advertiser_profiles (user_id, company_name, address, location, store_phone, category, business_number, representative_name, is_verified, created_at)
  VALUES
    (test_user_id_1, '서울 맛집 카페', '서울특별시 강남구 테헤란로 123', '강남구', '02-1111-1111', 'cafe', '111-11-11111', '김대표', true, NOW()),
    (test_user_id_2, '부산 뷰티샵', '부산광역시 해운대구 해변로 456', '해운대구', '051-2222-2222', 'beauty', '222-22-22222', '이대표', true, NOW()),
    (test_user_id_3, '제주 숙박업소', '제주특별자치도 제주시 관덕로 789', '제주시', '064-3333-3333', 'entertainment', '333-33-33333', '박대표', true, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  -- advertiser_profile_id 가져오기
  SELECT id INTO advertiser_profile_id_1 FROM advertiser_profiles WHERE user_id = test_user_id_1 LIMIT 1;
  SELECT id INTO advertiser_profile_id_2 FROM advertiser_profiles WHERE user_id = test_user_id_2 LIMIT 1;
  SELECT id INTO advertiser_profile_id_3 FROM advertiser_profiles WHERE user_id = test_user_id_3 LIMIT 1;

  -- ==============================
  -- 2. 체험단 캠페인 데이터 생성
  -- ==============================
  INSERT INTO campaigns (advertiser_id, title, recruitment_start, recruitment_end, recruitment_count, benefits, mission, store_info, status, created_at)
  VALUES
    -- 모집 중 (D-7)
    (advertiser_profile_id_1,
     '강남 인기 카페 브런치 체험단 모집',
     CURRENT_DATE - INTERVAL '3 days',
     CURRENT_DATE + INTERVAL '7 days',
     20,
     '브런치 세트 2인분 무료 제공 (가격 60,000원 상당)',
     '방문 후 48시간 내 SNS 포스팅 (사진 5장 이상, 해시태그 필수)',
     '강남역 5번 출구 도보 3분, 주차 가능, 영업시간 09:00-22:00',
     'recruiting',
     NOW() - INTERVAL '3 days'),

    -- 모집 중 (D-2, 마감임박)
    (advertiser_profile_id_2,
     '해운대 프리미엄 네일샵 체험단',
     CURRENT_DATE - INTERVAL '5 days',
     CURRENT_DATE + INTERVAL '2 days',
     10,
     '젤네일 1회 무료 (가격 50,000원 상당)',
     '시술 전후 사진 촬영 및 SNS 포스팅 (리뷰 필수)',
     '해운대역 3번 출구 앞, 예약 필수, 영업시간 10:00-20:00',
     'recruiting',
     NOW() - INTERVAL '5 days'),

    -- 모집 중 (D-14)
    (advertiser_profile_id_3,
     '제주 오션뷰 펜션 1박 체험단',
     CURRENT_DATE,
     CURRENT_DATE + INTERVAL '14 days',
     5,
     '오션뷰 객실 1박 무료 (주중 기준, 가격 150,000원 상당)',
     '객실 및 주변 관광지 사진 촬영, SNS 포스팅 (사진 10장 이상)',
     '제주국제공항에서 차량 30분, 무료 주차, 체크인 15:00',
     'recruiting',
     NOW()),

    -- 모집 중 (D-1, 마감임박)
    (advertiser_profile_id_1,
     '프리미엄 디저트 카페 신메뉴 체험단',
     CURRENT_DATE - INTERVAL '10 days',
     CURRENT_DATE + INTERVAL '1 day',
     15,
     '신메뉴 디저트 2종 + 음료 1잔 무료',
     '신메뉴 시식 후 솔직한 리뷰 작성 (SNS 필수)',
     '강남역 도보 5분, 포장 가능, 영업시간 11:00-21:00',
     'recruiting',
     NOW() - INTERVAL '10 days'),

    -- 모집 중 (D-5)
    (advertiser_profile_id_2,
     '부산 헤어살롱 프리미엄 펌 체험단',
     CURRENT_DATE - INTERVAL '2 days',
     CURRENT_DATE + INTERVAL '5 days',
     8,
     '프리미엄 펌 시술 1회 무료 (가격 120,000원 상당)',
     '시술 전후 사진 촬영, SNS 포스팅 및 상세 리뷰',
     '해운대 센텀시티 내 위치, 예약 필수, 주차 2시간 무료',
     'recruiting',
     NOW() - INTERVAL '2 days'),

    -- 모집 종료
    (advertiser_profile_id_1,
     '종료된 카페 체험단',
     CURRENT_DATE - INTERVAL '30 days',
     CURRENT_DATE - INTERVAL '5 days',
     10,
     '커피 + 케이크 세트',
     'SNS 포스팅',
     '강남역 인근',
     'closed',
     NOW() - INTERVAL '30 days'),

    -- 선정 완료
    (advertiser_profile_id_2,
     '선정 완료된 뷰티 체험단',
     CURRENT_DATE - INTERVAL '20 days',
     CURRENT_DATE - INTERVAL '10 days',
     5,
     '헤어 트리트먼트',
     'SNS 리뷰 작성',
     '해운대 인근',
     'selected',
     NOW() - INTERVAL '20 days'),

    -- 모집 중 (D-3, 마감임박)
    (advertiser_profile_id_3,
     '제주 맛집 레스토랑 디너 체험단',
     CURRENT_DATE - INTERVAL '7 days',
     CURRENT_DATE + INTERVAL '3 days',
     12,
     '프리미엄 디너 코스 2인분 무료 (가격 100,000원 상당)',
     '식사 사진 및 음식 리뷰 SNS 포스팅 (사진 8장 이상)',
     '제주시 중심가, 예약 필수, 발렛파킹 가능, 영업시간 17:00-22:00',
     'recruiting',
     NOW() - INTERVAL '7 days');

  RAISE NOTICE '테스트 데이터 생성 완료';
END $$;

COMMENT ON TABLE campaigns IS '체험단 캠페인 정보 (테스트 데이터 포함)';
