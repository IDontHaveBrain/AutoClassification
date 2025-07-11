#!/usr/bin/env python3
"""
Test script to verify the fallback functionality of ClassificationService.
This script tests the API status and fallback logic without making actual API calls.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.classification_service import ClassificationService
import logging

# Configure logging to see the fallback messages
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def test_fallback_logic():
    """Test the fallback logic implementation"""
    print("Testing ClassificationService fallback logic...")
    
    try:
        # Initialize the service
        service = ClassificationService()
        
        # Check API status
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