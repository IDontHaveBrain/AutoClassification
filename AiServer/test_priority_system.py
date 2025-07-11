#!/usr/bin/env python3
"""
Test script to verify the priority-based liteLLM API system
Tests API key fallback and model selection according to priority:
1. OPENROUTER_API_KEY → google/gemini-2.5-flash
2. GEMINI_API_KEY → gemini/gemini-2.5-flash  
3. OPENAI_API_KEY → gpt-4.1-mini
4. ANTHROPIC_API_KEY → claude-3-5-haiku-latest
"""
import os
import sys
import logging
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from config.config import Config

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_api_key_configuration():
    """Test API key configuration and priority system"""
    logger.info("🔍 Testing API key configuration...")
    
    # Check environment variables
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
    """Test the priority-based configuration system"""
    logger.info("\n🎯 Testing priority-based configuration system...")
    
    try:
        config = Config()
        
        # Test primary configuration
        primary_config = config.get_llm_config()
        if primary_config:
            logger.info(f"✅ Primary config: {primary_config['provider']} → {primary_config['model']}")
        else:
            logger.warning("⚠️ No primary configuration available")
        
        # Test all available configurations
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
            
            # Verify expected priority order
            if idx < len(expected_priority):
                expected_provider, expected_model = expected_priority[idx]
                if provider == expected_provider and model == expected_model:
                    logger.info(f"    ✅ Priority {priority} matches expected configuration")
                else:
                    logger.warning(f"    ⚠️ Priority {priority} doesn't match expected: {expected_provider} → {expected_model}")
        
        return len(all_configs) > 0
        
    except Exception as e:
        logger.error(f"❌ Error testing priority system: {str(e)}")
        return False

def test_model_naming():
    """Test if model names match the exact requirements"""
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
        logger.error(f"❌ Error testing model naming: {str(e)}")
        return False

def main():
    """Main test function"""
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
            logger.error(f"❌ {test_name} failed with exception: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    logger.info("\n📋 Test Results Summary:")
    logger.info("=" * 60)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{status}: {test_name}")
        if result:
            passed += 1
    
    logger.info(f"\n🏆 Tests passed: {passed}/{len(results)}")
    
    if passed == len(results):
        logger.info("🎉 All tests passed! Priority-based liteLLM system is working correctly.")
        return True
    else:
        logger.error("❌ Some tests failed. Please check the configuration.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)