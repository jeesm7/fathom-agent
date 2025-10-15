#!/bin/bash
# Create a macOS Application Bundle for Fathom Agent

APP_NAME="Fathom Agent"
APP_DIR="$HOME/Desktop/${APP_NAME}.app"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"

echo "🎨 Creating macOS Application: ${APP_NAME}.app"

# Create app structure
mkdir -p "$MACOS_DIR"
mkdir -p "$RESOURCES_DIR"

# Create the main executable script
cat > "$MACOS_DIR/$APP_NAME" << 'SCRIPT'
#!/bin/bash

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    # Server not running, start it
    osascript -e 'tell application "Terminal"
        do script "cd \"'"$HOME/Desktop/fathom agent"'\" && echo \"🚀 Starting Fathom Agent...\" && npm run dev"
        activate
    end tell'
    
    # Wait for server
    sleep 5
fi

# Open browser
open http://localhost:3000/dashboard
SCRIPT

# Make executable
chmod +x "$MACOS_DIR/$APP_NAME"

# Create Info.plist
cat > "$CONTENTS_DIR/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Fathom Agent</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.fathom.agent</string>
    <key>CFBundleName</key>
    <string>Fathom Agent</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
PLIST

# Create a simple icon using emoji (macOS will use default app icon if this doesn't work)
cat > "$RESOURCES_DIR/AppIcon.icns" << 'ICON'
🤖
ICON

echo "✅ Created: ${APP_DIR}"
echo "📍 Location: Desktop"
echo ""
echo "You can now:"
echo "  1. Double-click 'Fathom Agent.app' on your Desktop to open the app"
echo "  2. Drag it to your Dock for quick access"
echo "  3. Right-click → Get Info to customize the icon"
echo ""
echo "🎯 The app will automatically start the server if needed!"

