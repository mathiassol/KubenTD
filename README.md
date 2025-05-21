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

to damage invisible enemies you need a tower with the invisible trait. The same goes for steal where the tower needs penetration trait. Magic enemies reduce damage from non-magic towers, and magic towers deal normal damage to magic enemies.


# Technologies Used
- Three.js for 3D rendering
- JavaScript 
- HTML/CSS
- NPM for package management

# Installation
1. Clone the repository
2. Run `npm install`
3. Open `index.html` in a web browser

# Changelog

## v0.2.1
- Added settings menu with display options
- Implemented V-sync toggle
- Added fullscreen/windowed mode support
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
- [ ] Visual effects
- [ ] Sound effects and music
- [x] Game balance adjustments
- [x] Performance optimization
- [x] UI/UX improvements
- [ ] show if unit is under development / not finished
- [ ] exsplane about number of units and limitations
- [ ] use color for established practices to comunicte unavaible functionality
- [ ] craeate a game intro with a brif explenation of the game

# Log
## log 8 - polish, bug fixes and 3D design
- 

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