#!/bin/bash

# Set root directory
ROOT="credential-manager"

# List of directories to create
DIRS=(
  "$ROOT/backend/config"
  "$ROOT/backend/controllers"
  "$ROOT/backend/middleware"
  "$ROOT/backend/models"
  "$ROOT/backend/routes"
  "$ROOT/backend/utils"
  "$ROOT/frontend/public"
  "$ROOT/frontend/src/assets"
  "$ROOT/frontend/src/components/auth"
  "$ROOT/frontend/src/components/clients"
  "$ROOT/frontend/src/components/credentials"
  "$ROOT/frontend/src/components/common"
  "$ROOT/frontend/src/components/export"
  "$ROOT/frontend/src/contexts"
  "$ROOT/frontend/src/pages"
  "$ROOT/frontend/src/services"
  "$ROOT/frontend/src/utils"
)

# List of files to create
FILES=(
  "$ROOT/backend/config/db.config.js"
  "$ROOT/backend/config/auth.config.js"
  "$ROOT/backend/controllers/auth.controller.js"
  "$ROOT/backend/controllers/client.controller.js"
  "$ROOT/backend/controllers/credential.controller.js"
  "$ROOT/backend/controllers/export.controller.js"
  "$ROOT/backend/middleware/auth.middleware.js"
  "$ROOT/backend/middleware/validators.js"
  "$ROOT/backend/models/user.model.js"
  "$ROOT/backend/models/client.model.js"
  "$ROOT/backend/models/credential.model.js"
  "$ROOT/backend/models/activity.model.js"
  "$ROOT/backend/routes/auth.routes.js"
  "$ROOT/backend/routes/client.routes.js"
  "$ROOT/backend/routes/credential.routes.js"
  "$ROOT/backend/routes/export.routes.js"
  "$ROOT/backend/utils/encryption.js"
  "$ROOT/backend/utils/excelExport.js"
  "$ROOT/backend/package.json"
  "$ROOT/backend/server.js"
  "$ROOT/frontend/src/contexts/AuthContext.js"
  "$ROOT/frontend/src/pages/Dashboard.js"
  "$ROOT/frontend/src/pages/Login.js"
  "$ROOT/frontend/src/pages/ClientDetails.js"
  "$ROOT/frontend/src/pages/CredentialDetails.js"
  "$ROOT/frontend/src/pages/Settings.js"
  "$ROOT/frontend/src/services/auth.service.js"
  "$ROOT/frontend/src/services/client.service.js"
  "$ROOT/frontend/src/services/credential.service.js"
  "$ROOT/frontend/src/services/export.service.js"
  "$ROOT/frontend/src/utils/formatters.js"
  "$ROOT/frontend/src/App.js"
  "$ROOT/frontend/src/index.js"
  "$ROOT/frontend/package.json"
  "$ROOT/docker-compose.yml"
  "$ROOT/.env.example"
  "$ROOT/README.md"
)

# Create directories
echo "Creating directories..."
for dir in "${DIRS[@]}"; do
  mkdir -p "$dir"
done

# Create files
echo "Creating files..."
for file in "${FILES[@]}"; do
  touch "$file"
done

echo "Project structure created successfully."

