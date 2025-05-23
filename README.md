# Kuben TD

# Game Description
* list of different types of towers
* each tower has traits
  * targeting (ground, air, hybrid)
  * invisible
  * magic
  * projectile
  * penetration
* enemies have traits
  * health
  * speed
  * type (ground, air)
  * invisible
  * magic
  * steal

# Technologies Used
- Three.js for 3D rendering
- JavaScript 
- HTML/CSS
- NPM for package management

# Installation

for the exe build, just open the kubenTD.exe file and it will start the game.
for the source code:

-have node.js installed
1. Clone the repository
2. Open cmd and use `cd path/to/kubenTD/`
3. Run `npm install`
4. type `npm start` to start the project


# Changelog

## v0.3.0
- Added massive visual improvements
- post-processing effects
  - bloom 
  - water shaders
    - fragment shader
    - vertex shader
- added some particle effects
 - explosion
 - projectile
- created more 3D models
  - units
  - enemy
  - map

## v0.2.1
- Added settings menu with display options
- Fixed unit purchase system bugs
- Improved menu navigation

## v0.2
- Added health bar system
- Implemented cash balance display
- Added unit shop interface
- Fixed tower placement issues
- Added confirmation dialog for unit sales

## v0.1.1 
- Initial tower defense mechanics
- Basic enemy AI implementation
- Added three unit types (Ground, Air, Hybrid)
- Implemented basic UI elements
- Added burger menu for navigation

## v0.1.0 
- Project initialization
- Basic 3D scene setup
- Camera controls implementation
- Basic game loop
- Initial UI framework

# Known Issues
- Settings sometimes don't save properly
- Unit placement can be glitchy near edges
- Performance issues with multiple units

# Planning & Development

## Phase 1 - Core Systems (Completed)
- [x] Basic 3D environment setup
- [x] Camera system implementation
- [x] Game loop foundation
- [x] Enemy movement system
- [x] Basic UI framework

## Phase 2 - Game Mechanics (Completed)
- [x] Tower placement system
- [x] Enemy pathfinding
- [x] Health and damage system
- [x] Resource management
- [x] Basic tower types
- [x] Wave system
- [x] Advanced targeting mechanics

## Phase 3 - Polish & Balance (current)
- [x] Visual effects
- [-] Sound effects and music
- [x] Game balance adjustments
- [x] Performance optimization
- [x] UI/UX improvements
- [x] create a game intro with a brief explanation of the game

# Log
## log 8 - polish, bug fixes and 3D design
- added a lot of polish to the game
- vfx like explosions, projectiles and some particle effects
- added a lot of 3D models
- added a lot of post-processing effects
- added a lot of shaders
- added a lot of bug fixes

## log 7 - ui, SFX, 3D enchantments
- upgraded all ui elements
- started adding SFX 
- is working on modeling and animating the units, enemies and map
- reworked some core code to fix bugs and improve performance
- debugged the entire codebase to try and solve some memory leaks (no idea if it fully fixed it)
- stared working on the electron build to make it a ready-to-download desktop app. only making an arm64 and x64 version.

## log 6 - unit logic fixes
- Fixed unit logic for tower targeting
- ground/air targeting issues resolved

## log 5 - Settings Menu Polish
- Implemented confirmation dialog for unsaved settings
- Fixed settings persistence issues
- Added graphics quality controls

## log 4 - Graphics Settings
- Added shadow toggle and resolution settings
- Implemented texture quality options

## log 3 - Display Settings
- Added V-sync implementation
- Created fullscreen/windowed mode toggle
- Fixed resolution scaling issues

## log 2 - Settings Framework
- Created settings menu structure
- Added settings save/load functionality
- Implemented settings categories

## log 1 - UI Improvements
- Enhanced health bar visibility
- Fixed unit shop layout issues
- Added tooltips for tower traits