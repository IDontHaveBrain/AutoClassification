#!/usr/bin/env python3
"""
우선순위 기반 liteLLM API 시스템을 검증하는 테스트 스크립트
우선순위에 따른 API 키 폴백 및 모델 선택을 테스트합니다:
1. OPENROUTER_API_KEY → google/gemini-2.5-flash
2. GEMINI_API_KEY → gemini/gemini-2.5-flash  
3. OPENAI_API_KEY → gpt-4.1-mini
4. ANTHROPIC_API_KEY → claude-3-5-haiku-latest
"""
import os
import sys
import logging
from pathlib import Path

# 프로젝트 루트를 경로에 추가
sys.path.append(str(Path(__file__).parent))

from config.config import Config

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_api_key_configuration():
    """API 키 구성 및 우선순위 시스템 테스트"""
    logger.info("🔍 Testing API key configuration...")
    
    # 환경 변수 확인
    api_keys = {
        'OPENROUTER_API_KEY': os.getenv('OPENROUTER_API_KEY', ''),
        'GEMINI_API_KEY': os.getenv('GEMINI_API_KEY', ''),
        'OPENAI_API_KEY': os.getenv('OPENAI_API_KEY', ''),
        'ANTHROPIC_API_KEY': os.getenv('ANTHROPIC_API_KEY', '')
    }
    
    logger.info("Available API keys:")
    for key, value in api_keys.items():
        status = "✅ SET" if value else "❌ NOT SET"
        logger.info(f"  {key}: {status}")
    
    if not any(api_keys.values()):
        logger.error("❌ No API keys found in environment variables")
        logger.info("💡 Copy .env.example to .env and add your API keys")
        return False
    
    return True

def test_priority_system():
    """우선순위 기반 구성 시스템 테스트"""
    logger.info("\n🎯 Testing priority-based configuration system...")
    
    try:
        config = Config()
        
        # 기본 설정 테스트
        primary_config = config.get_llm_config()
        if primary_config:
            logger.info(f"✅ Primary configuration: {primary_config['provider']} → {primary_config['model']}")
        else:
            logger.warning("⚠️ Primary configuration is not available")
        
        # 모든 사용 가능한 설정 테스트
        all_configs = config.get_all_available_llm_configs()
        logger.info(f"📊 Total available configurations: {len(all_configs)}")
        
        expected_priority = [
            ("OpenRouter", "google/gemini-2.5-flash"),
            ("Gemini", "gemini/gemini-2.5-flash"),
            ("OpenAI", "gpt-4.1-mini"),
            ("Anthropic", "claude-3-5-haiku-latest")
        ]
        
        for idx, config_item in enumerate(all_configs):
            provider = config_item['provider']
            model = config_item['model']
            priority = idx + 1
            
            logger.info(f"  {priority}. {provider} → {model}")
            
            # 예상 우선순위 순서 확인
            if idx < len(expected_priority):
                expected_provider, expected_model = expected_priority[idx]
                if provider == expected_provider and model == expected_model:
                    logger.info(f"    ✅ Priority {priority} matches expected configuration")
                else:
                    logger.warning(f"    ⚠️ Priority {priority} differs from expected: {expected_provider} → {expected_model}")
        
        return len(all_configs) > 0
        
    except Exception as e:
        logger.error(f"❌ Priority system test error: {str(e)}")
        return False

def test_model_naming():
    """모델 이름이 정확한 요구사항과 일치하는지 테스트"""
    logger.info("\n🏷️ Testing model naming conventions...")
    
    try:
        config = Config()
        all_configs = config.get_all_available_llm_configs()
        
        expected_models = {
            "OpenRouter": "google/gemini-2.5-flash",
            "Gemini": "gemini/gemini-2.5-flash",
            "OpenAI": "gpt-4.1-mini",
            "Anthropic": "claude-3-5-haiku-latest"
        }
        
        for config_item in all_configs:
            provider = config_item['provider']
            model = config_item['model']
            
            if provider in expected_models:
                expected_model = expected_models[provider]
                if model == expected_model:
                    logger.info(f"✅ {provider} model name correct: {model}")
                else:
                    logger.error(f"❌ {provider} model name incorrect: {model} (expected: {expected_model})")
            else:
                logger.warning(f"⚠️ Unknown provider: {provider}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Model naming test error: {str(e)}")
        return False

def main():
    """메인 테스트 함수"""
    logger.info("🚀 Starting priority-based liteLLM system test")
    logger.info("=" * 60)
    
    tests = [
        ("API Key Configuration", test_api_key_configuration),
        ("Priority System", test_priority_system),
        ("Model Naming", test_model_naming)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            logger.error(f"❌ {test_name} failed due to exception: {str(e)}")
            results.append((test_name, False))
    
    # 요약
    logger.info("\n📋 Test results summary:")
    logger.info("=" * 60)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{status}: {test_name}")
        if result:
            passed += 1
    
    logger.info(f"\n🏆 Passed tests: {passed}/{len(results)}")
    
    if passed == len(results):
        logger.info("🎉 All tests passed! Priority-based liteLLM system is working correctly.")
        return True
    else:
        logger.error("❌ Some tests failed. Please check your configuration.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)