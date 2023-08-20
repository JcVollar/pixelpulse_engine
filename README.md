# PixelPulse Engine
This is my attempt at building a simple top-down game using JS and Canvas. No other frameworks or unnecessary additions. Just native JS.

Should you use this? Probably not! I'm using it to learn about basic event handling in the browser and, frankly, to see if I can create a basic game from scratch.

What's the basic idea? Imagine a zombie survival game. You're alone in a vast world, with creatures chasing you down. But you have the power to shoot them. The goal is to build, loot, and do whatever it takes to survive.

Currently, the game features a basic world filled with green trees, a player character, and enemies that chase you. Every element is about a 20x20 pix box. You can navigate using the W-A-S-D keys, and shoot bullets with a mouse click.

The enemies have varying health levels and will continually pursue you as long as they have line of sight.

There's built-in collision detection, so you can't simply walk through trees or other obstacles. And no, you can't shoot through trees either.

As of now, there's no game over sequence. If zombies catch you, you're stuck until you've shot them all down. Your only respite? Keep going or hit CTRL+R to restart.

You want to try it without cloneing it ? go to https://game.vollar.no?tmp=11

# TODO Features:
* Sprite import: starting with the main player.
* Sound import: for actions like gunshots.
* Implement an area selection mechanism around the player.
* Design a health system: decrease health when attacked by zombies.
* Develop a weapon system.
* Introduce hand-held weapons.
* Include a game-over screen.
* Design a game start splash screen.
* Create an inventory system.
* Introduce water bodies/lakes.
* Integrate architectural elements like houses.
* Ensure zombies can't detect the player behind walls (perhaps they can still hear the player?).

