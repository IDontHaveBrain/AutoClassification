#!/usr/bin/env python3
"""
ClassificationService의 폴백 기능을 검증하는 테스트 스크립트입니다.
이 스크립트는 실제 API 호출 없이 API 상태와 폴백 로직을 테스트합니다.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.classification_service import ClassificationService
import logging

# 폴백 메시지를 볼 수 있도록 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def test_fallback_logic():
    """폴백 로직 구현을 테스트합니다"""
    print("Testing ClassificationService fallback logic...")
    
    try:
        # 서비스 초기화
        service = ClassificationService()
        
        # API 상태 확인
        status = service.get_api_status()
        print(f"\nAPI Status:")
        print(f"  Available APIs: {status['available_apis']}")
        print(f"  Primary API: {status['primary_api']}")
        print(f"  Fallback APIs: {status['fallback_apis']}")
        print(f"  All providers: {status['all_providers']}")
        
        if status['available_apis'] == 0:
            print("\n⚠️  No API keys configured - fallback logic cannot be tested")
            return False
        
        print(f"\n✅ Fallback logic configured successfully!")
        print(f"   - Primary API: {status['primary_api']}")
        print(f"   - {len(status['fallback_apis'])} fallback option(s) available")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error testing fallback logic: {e}")
        return False

if __name__ == "__main__":
    success = test_fallback_logic()
    sys.exit(0 if success else 1)