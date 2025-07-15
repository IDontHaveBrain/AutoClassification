# Multi-stage build for AiServer optimization
# This reduces the final image size by separating build and runtime environments

#==============================================================================
# Stage 1: Builder stage - Install dependencies and build wheels
#==============================================================================
FROM python:3.11-slim AS builder

# Install system dependencies needed for building packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libgl1-mesa-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgcc-s1 \
    git \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set working directory
WORKDIR /build

# Copy requirements first for better layer caching
COPY requirements.txt .

# Create virtual environment in builder stage
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and install build tools
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Install Python dependencies with optimizations
# Split heavy dependencies for better layer caching
RUN pip install --no-cache-dir \
    # Core web framework (lightweight)
    Flask==3.1.1 \
    Flask-Limiter==3.12 \
    requests==2.31.0 \
    python-dotenv==1.1.1 \
    pika==1.3.2

# Install heavy AI/ML dependencies separately
RUN pip install --no-cache-dir \
    --find-links https://download.pytorch.org/whl/torch_stable.html \
    # Install PyTorch CPU-only version to save space
    torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install ultralytics (YOLO) - this pulls in OpenCV and other dependencies
RUN pip install --no-cache-dir ultralytics==8.3.40

# Install LLM libraries
RUN pip install --no-cache-dir \
    litellm==1.74.0 \
    openai==1.91.0

# Clean up pip cache and temporary files
RUN pip cache purge && \
    find /opt/venv -name "*.pyc" -delete && \
    find /opt/venv -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

#==============================================================================
# Stage 2: Runtime stage - Minimal runtime environment
#==============================================================================
FROM python:3.11-slim AS runtime

# Install only essential runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgcc-s1 \
    # Required for OpenCV
    libgtk-3-0 \
    libavcodec59 \
    libavformat59 \
    libswscale6 \
    libjpeg62-turbo \
    libpng16-16 \
    libtiff6 \
    libopenexr-3-1-30 \
    libwebp7 \
    libopenjp2-7 \
    # Clean up in same layer
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && apt-get autoremove -y

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONPATH="/app"
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash appuser && \
    mkdir -p /app && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Set working directory
WORKDIR /app

# Copy application code with proper ownership
COPY --chown=appuser:appuser . .

# Remove unnecessary files to reduce image size
RUN find . -name "*.pyc" -delete && \
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find . -name "*.pyo" -delete && \
    find . -name "*.pyd" -delete && \
    find . -name "*.so" -type f -exec strip {} \; 2>/dev/null || true && \
    rm -rf tests/ test_*.py *_test.py .pytest_cache/ .coverage .mypy_cache/ && \
    rm -rf logs/ *.log && \
    rm -rf .git/ .gitignore && \
    rm -rf Dockerfile* README.md

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/health', timeout=5)" || exit 1

# Run the application
CMD ["python", "app.py"]