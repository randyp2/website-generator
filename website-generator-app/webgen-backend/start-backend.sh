#!/usr/bin/env bash

# --- Safetey flags
# -e -> exit if command fails
# -u -> error for undefined variables
# -o pipefail -> error if pipeline command fails
set -euo pipefail

# Get relevant directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Mode specified by user default to dev
MODE="${1:-dev}"

# Handle cases
case "$MODE" in 
    dev) ENV_FILE="$ROOT_DIR/webgen-backend/.env.dev"; DEFAULT_PROFILE="dev" ;;
    prod) ENV_FILE="$ROOT_DIR/webgen-backend/.env.prod"; DEFAULT_PROFILE="prod" ;;
    *) echo "Usage: $0 [dev|prod]"; exit 1 ;;
esac

if [[ ! -f "$ENV_FILE" ]]; then 
    echo "Missing env file: $ENV_FILE"
    exit 1
fi

# Automatically export variables in env file
set -a
    source "$ENV_FILE"
set +a

export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-$DEFAULT_PROFILE}"

    : "${SUPABASE_PROJECT_URL:?Missing SUPABASE_PROJECT_URL in $ENV_FILE}"
    : "${SPRING_AI_OPENAI_API_KEY:?Missing SPRING_AI_OPENAI_API_KEY in $ENV_FILE}"
    : "${SPRING_AI_ANTHROPIC_API_KEY:?Missing SPRING_AI_ANTHROPIC_API_KEY in $ENV_FILE}"

# Run the program
cd "$SCRIPT_DIR"

./mvnw clean
exec ./mvnw spring-boot:run 
