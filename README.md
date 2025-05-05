# Kuben TD

---
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

---
# Technologies Used
- Three.js for 3D rendering
- JavaScript 
- HTML/CSS
- NPM for package management

---
# Installation
1. Clone the repository
2. Run `npm install`
3. Open `index.html` in a web browser

---
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

# Planning & Development Roadmap

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