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

---
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

## Phase 3 - Advanced Features (current)
- [ ] Special abilities for towers
- [ ] Enemy boss mechanics
- [ ] Level progression

## Phase 4 - Polish & Balance
- [ ] Visual effects
- [ ] Sound effects and music
- [ ] Game balance adjustments
- [ ] Performance optimization
- [ ] UI/UX improvements

## Phase 5 - Additional Content
- [ ] New tower types
- [ ] New enemy types
- [ ] Custom maps
- [ ] Challenge modes
- [ ] Leaderboards

# Log

## log 20 - Settings Menu Polish
- Implemented confirmation dialog for unsaved settings
- Fixed settings persistence issues
- Added graphics quality controls

## log 19 - Graphics Settings
- Added shadow toggle and resolution settings
- Implemented texture quality options
- Added antialiasing controls

## log 18 - Display Settings
- Added V-sync implementation
- Created fullscreen/windowed mode toggle
- Fixed resolution scaling issues

## log 17 - Settings Framework
- Created settings menu structure
- Added settings save/load functionality
- Implemented settings categories

## log 16 - UI Improvements
- Enhanced health bar visibility
- Fixed unit shop layout issues
- Added tooltips for tower traits

## log 15 - Tower Mechanics
- Implemented tower targeting system
- Added tower trait system
- Fixed tower placement bugs

## log 14 - Enemy Traits
- Added enemy type system (ground/air)
- Implemented invisibility mechanics
- Added magic resistance system

## log 13 - Core Game Systems
- Enhanced game loop
- Added cash management
- Implemented wave system

## log 12 - Tower Defense Logic
- Basic tower placement
- Added projectile system
- Implemented damage calculations

## log 11 - Enemy Movement
- Created path system
- Added enemy movement patterns
- Implemented speed variations

## log 10 - Game State Management
- Added game state tracking
- Implemented score system
- Created wave management

## log 9 - UI Framework
- Added main menu system
- Implemented HUD elements

## log 8 - Camera Controls
- Added orbit controls
- Implemented zoom limitations
- Fixed camera angle issues

## log 7 - Three.js Setup
- Basic 3D scene implementation
- Added lighting system
- Created basic geometry

## log 6 - Project Structure
- Set up NPM configuration
- Organized file structure
- Added build system

## log 5 - Initial Planning
- Created feature roadmap
- Planned game mechanics
- Designed tower types

## log 4 - Game Design
- Designed enemy types
- Planned progression system
- Created balance framework

## log 3 - Asset Planning
- Planned 3D models
- Created color schemes

## log 2 - Technical Design
- Selected game technologies
- Planned system architecture
- Created initial documentation

## log 1 - Project Setup
- Repository initialization
- Basic project structure
- Development environment setup