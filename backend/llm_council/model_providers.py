"""
Dynamic Model Provider System for LLM Council
Allows runtime loading of AI models based on user configuration
"""

import json
import os
from typing import Dict, List, Optional, Any
from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)


class ModelProvider(ABC):
    """Base class for AI model providers"""

    def __init__(self, api_key: str, model_id: str):
        self.api_key = api_key
        self.model_id = model_id

    @abstractmethod
    async def generate(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Generate a response from the model"""
        pass

    @abstractmethod
    async def test_connection(self) -> bool:
        """Test if the API connection is working"""
        pass


class OpenAIProvider(ModelProvider):
    """OpenAI API provider (GPT-4, GPT-3.5, etc.)"""

    def __init__(self, api_key: str, model_id: str):
        super().__init__(api_key, model_id)
        try:
            import openai
            self.client = openai.OpenAI(api_key=api_key)
        except ImportError:
            logger.error("openai package not installed. Install with: pip install openai")
            raise

    async def generate(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Generate response using OpenAI API"""
        try:
            response = self.client.chat.completions.create(
                model=self.model_id,
                messages=messages,
                temperature=kwargs.get('temperature', 0.7),
                max_tokens=kwargs.get('max_tokens', 1000),
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise

    async def test_connection(self) -> bool:
        """Test OpenAI connection"""
        try:
            response = self.client.chat.completions.create(
                model=self.model_id,
                messages=[{"role": "user", "content": "Test"}],
                max_tokens=5,
            )
            return True
        except Exception as e:
            logger.error(f"OpenAI connection test failed: {e}")
            return False


class AnthropicProvider(ModelProvider):
    """Anthropic API provider (Claude models)"""

    def __init__(self, api_key: str, model_id: str):
        super().__init__(api_key, model_id)
        try:
            import anthropic
            self.client = anthropic.Anthropic(api_key=api_key)
        except ImportError:
            logger.error("anthropic package not installed. Install with: pip install anthropic")
            raise

    async def generate(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Generate response using Anthropic API"""
        try:
            # Convert messages format if needed
            formatted_messages = []
            for msg in messages:
                formatted_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

            response = self.client.messages.create(
                model=self.model_id,
                messages=formatted_messages,
                temperature=kwargs.get('temperature', 0.7),
                max_tokens=kwargs.get('max_tokens', 1000),
            )
            return response.content[0].text
        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            raise

    async def test_connection(self) -> bool:
        """Test Anthropic connection"""
        try:
            response = self.client.messages.create(
                model=self.model_id,
                messages=[{"role": "user", "content": "Test"}],
                max_tokens=5,
            )
            return True
        except Exception as e:
            logger.error(f"Anthropic connection test failed: {e}")
            return False


class GoogleProvider(ModelProvider):
    """Google AI provider (Gemini models)"""

    def __init__(self, api_key: str, model_id: str):
        super().__init__(api_key, model_id)
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(model_id)
        except ImportError:
            logger.error("google-generativeai package not installed. Install with: pip install google-generativeai")
            raise

    async def generate(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Generate response using Google AI API"""
        try:
            # Convert messages to Google format
            prompt = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])

            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": kwargs.get('temperature', 0.7),
                    "max_output_tokens": kwargs.get('max_tokens', 1000),
                }
            )
            return response.text
        except Exception as e:
            logger.error(f"Google AI API error: {e}")
            raise

    async def test_connection(self) -> bool:
        """Test Google AI connection"""
        try:
            response = self.model.generate_content("Test")
            return True
        except Exception as e:
            logger.error(f"Google AI connection test failed: {e}")
            return False


class ModelRegistry:
    """Registry for managing configured AI models"""

    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path or os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'frontend', 'web', 'config', 'ai-models.json'
        )
        self.models: Dict[str, ModelProvider] = {}
        self.provider_classes = {
            'openai': OpenAIProvider,
            'anthropic': AnthropicProvider,
            'google': GoogleProvider,
        }
        self.load_models()

    def decrypt_api_key(self, encrypted_key: str) -> str:
        """Decrypt API key (must match frontend encryption)"""
        # TODO: Implement actual decryption matching frontend
        # For now, return as-is if not encrypted
        if ':' in encrypted_key:
            import base64
            from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
            from cryptography.hazmat.backends import default_backend

            try:
                parts = encrypted_key.split(':')
                iv = bytes.fromhex(parts[0])
                encrypted = bytes.fromhex(parts[1])

                key = os.getenv('MODEL_ENCRYPTION_KEY', 'default-key-change-in-production-32')
                key = key.ljust(32, '0')[:32].encode()

                cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
                decryptor = cipher.decryptor()
                decrypted = decryptor.update(encrypted) + decryptor.finalize()

                # Remove padding
                return decrypted.decode('utf-8').rstrip('\x00')
            except Exception as e:
                logger.error(f"Decryption failed: {e}")
                return encrypted_key
        return encrypted_key

    def load_models(self) -> None:
        """Load model configurations from file"""
        try:
            if not os.path.exists(self.config_path):
                logger.warning(f"Model config file not found: {self.config_path}")
                return

            with open(self.config_path, 'r') as f:
                model_configs = json.load(f)

            # Load only active models
            for config in model_configs:
                if config.get('status') != 'active':
                    continue

                provider_type = config.get('provider')
                if provider_type not in self.provider_classes:
                    logger.warning(f"Unknown provider: {provider_type}")
                    continue

                try:
                    api_key = self.decrypt_api_key(config['apiKey'])
                    provider_class = self.provider_classes[provider_type]
                    provider = provider_class(api_key, config['modelId'])

                    self.models[config['id']] = provider
                    logger.info(f"Loaded model: {config['name']} ({config['modelId']})")
                except Exception as e:
                    logger.error(f"Failed to load model {config['name']}: {e}")

        except Exception as e:
            logger.error(f"Failed to load model configurations: {e}")

    def reload(self) -> None:
        """Reload model configurations"""
        logger.info("Reloading model configurations...")
        self.models.clear()
        self.load_models()

    def get_model(self, model_id: Optional[str] = None) -> Optional[ModelProvider]:
        """Get a model by ID, or return the first active model"""
        if model_id and model_id in self.models:
            return self.models[model_id]

        # Return first active model if no ID specified
        if self.models:
            return list(self.models.values())[0]

        return None

    def get_all_models(self) -> Dict[str, ModelProvider]:
        """Get all loaded models"""
        return self.models

    def has_models(self) -> bool:
        """Check if any models are loaded"""
        return len(self.models) > 0


# Global model registry instance
_registry: Optional[ModelRegistry] = None


def get_model_registry() -> ModelRegistry:
    """Get the global model registry instance"""
    global _registry
    if _registry is None:
        _registry = ModelRegistry()
    return _registry


def reload_model_registry() -> None:
    """Reload the model registry"""
    global _registry
    if _registry is not None:
        _registry.reload()
    else:
        _registry = ModelRegistry()
