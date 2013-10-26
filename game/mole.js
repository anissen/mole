
var game = new Phaser.Game(480, 800, Phaser.AUTO, 'phaser-example', {
  preload: preload,
  create: create,
  update: update,
  render: render
});

var player;
var cursors;
var magma;
var lastTile;
var damage;

var gameOverText;

var MOVE_UP = 0;
var MOVE_LEFT = 1;
var MOVE_RIGHT = 2;
var moveDirection = MOVE_UP;
var tileGroup;

var playerStartY;

var destX;

var sandEmitter;
var stoneEmitter;

var tileSize = 96;

var tileData = [
  {
    name: 'sand',
    health: 50
  },
  {
    name: 'dirt',
    health: 100
  },
  {
    name: 'stone',
    health: 200
  }];

function preload() {
  game.load.image('background','assets/platformer/Tiles/tiling_underground.png');
  // game.load.spritesheet('tile', 'assets/buttons/number-buttons-90x90.png', 90, 90);
  //game.load.spritesheet('player', 'assets/mole/mole.png', 155, 100);
  game.load.image('player', 'assets/sprites/shinyball.png');
  game.load.image('sand', 'assets/platformer/Tiles/sandCenter.png');
  game.load.image('dirt', 'assets/platformer/Tiles/stoneCenter.png');
  game.load.image('stone', 'assets/platformer/Tiles/blah.png');
  game.load.image('magma','assets/platformer/Tiles/magma.png');
  // game.load.image('magma','assets/platformer/Tiles/liquidLavaTop_mid.png');
  game.load.image('brick','assets/games/breakout/brick2.png');
  // game.load.image('magmaCenter','assets/platformer/Tiles/liquidLava.png');
  game.load.image('diamond', 'assets/games/starstruck/star.png');
  // game.load.spritesheet('pebble', 'assets/mole/pebbles.png', 45, 63);

  game.load.image('sandPebble1', 'assets/platformer/Items/particleBrick1a.png');
  game.load.image('sandPebble2', 'assets/platformer/Items/particleBrick1b.png');
  game.load.image('stonePebble1', 'assets/platformer/Items/particleBrick2a.png');
  game.load.image('stonePebble2', 'assets/platformer/Items/particleBrick2b.png');
}

function create() {
  game.world.setBounds(0, 0, game.width, game.height * 100);
  game.add.tileSprite(0, 0, game.world.width, game.world.height * 100, 'background');

  magma = game.add.tileSprite(0, game.world.height - 100, game.world.width, game.world.height, 'magma');
  magma.body.velocity.y = -80;

  /*
  magmaGroup = game.add.group();
  for (var x = 0; x < game.world.width; x += 70) {
    var magmaSprite = magmaGroup.create(x, game.world.height - 70, 'magma');

    magmaSprite.body.velocity.y = -80;
    var magmaCenterSprite = magmaGroup.create(x, game.world.height, 'magmaCenter');
    magmaCenterSprite.body.velocity.y = -80;
  }
  */

  //var rnd = new Phaser.RandomDataGenerator([42]);

  sandEmitter = game.add.emitter(0, 0, 1000);
  sandEmitter.minParticleSpeed.setTo(-200, 0);
  sandEmitter.maxParticleSpeed.setTo(200, 200);
  sandEmitter.gravity = 8;
  sandEmitter.bounce.setTo(0.5, 0.5);
  sandEmitter.particleDrag.x = 10;
  sandEmitter.angularDrag = 30;
  sandEmitter.makeParticles(['sandPebble1', 'sandPebble2'], undefined, undefined, undefined, true);

  stoneEmitter = game.add.emitter(0, 0, 1000);
  stoneEmitter.minParticleSpeed.setTo(-200, 0);
  stoneEmitter.maxParticleSpeed.setTo(200, 200);
  stoneEmitter.gravity = 8;
  stoneEmitter.bounce.setTo(0.5, 0.5);
  stoneEmitter.particleDrag.x = 10;
  stoneEmitter.angularDrag = 30;
  stoneEmitter.makeParticles(['stonePebble1', 'stonePebble2'], undefined, undefined, undefined, true);

  playerStartY = game.world.height - game.height / 2;
  player = game.add.sprite(game.width / 2, playerStartY, 'player');
  player.anchor.setTo(0.5, 0.5);
  // player.scale.x = player.scale.y = 0.3;
  player.body.collideWorldBounds = true;

  // player.animations.add('dig');
  // player.animations.play('dig', 30, true);

  tileGroup = game.add.group();

  game.camera.follow(player, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);

  cursors = game.input.keyboard.createCursorKeys();

  gameOverText = game.add.text(0, 0, 'Game Over', { font: "bold 32pt Arial", fill: "yellow", align: "center", stroke: "black", strokeThickness: 8 });
  gameOverText.anchor.setTo(0.5, 0.5);

  restart();
}

function restart() {
  if (tileGroup)
    tileGroup.removeAll();

  for (var y = 0; y < 72; y++) {
    for (var x = 0; x < 5; x++) {
      var tileType = game.rnd.integerInRange(0,3);
      var sprite = tileGroup.create(tileSize * x, game.world.height - game.height - tileSize * y, tileData[tileType].name);
      sprite.type = tileType;
      sprite.health = tileData[tileType].health;
      sprite.body.immovable = true;
    }
  }

  gameOverText.alpha = 0;

  magma.y = game.world.height - 100;

  player.x = game.width / 2;
  player.y = playerStartY;
  player.revive();
}

function update() {
  // if (game.input.keyboard.justPressed(Phaser.Keyboard.LEFT)) {
  //   destX = player.x - tileSize;
  // } else if (game.input.keyboard.justPressed(Phaser.Keyboard.LEFT)) {
  //   destX = player.x + tileSize;
  // }

  // game.physics.moveToXY(player, destX || player.x, player.y, 200);
  //
  if (cursors.left.isDown) {
    moveDirection = MOVE_LEFT;
  } else if (cursors.right.isDown) {
    moveDirection = MOVE_RIGHT;
  } else {
    moveDirection = MOVE_UP;
  }

  movePlayer();

  // game.physics.moveToXY(player, Math.floor(player.x / tileSize) * tileSize + 45, Math.floor(player.y / tileSize) * tileSize + 45, 200);

  var collision = game.physics.collide(player, tileGroup, collisionHandler, null, this);
  //player.scale.y = (collision ? 0.8 : 1);

  game.physics.collide(sandEmitter, tileGroup);
  game.physics.collide(stoneEmitter, tileGroup);

  if (player.alive && magma.y <= player.y + player.width / 2) {
    gameOverText.x = game.camera.x + game.camera.width / 2;
    gameOverText.y = game.camera.y + game.camera.height / 2;
    gameOverText.angle = 180;
    var distance = playerStartY - player.y;
    gameOverText.content = 'Game Over\n\nYou escaped\n' + Math.round(distance / tileSize) + ' meters\nand dug\n' + tileGroup.countDead() + ' tiles';
    game.add.tween(gameOverText).to({alpha: 0.9, angle: 0}, 2000, Phaser.Easing.Elastic.Out, true, 0, false);

    player.kill();

    setTimeout(function() {
      restart();
    }, 5000);
  }
}

function collisionHandler(player, tile) {
  if (tile !== lastTile)
    damage += 3;
  if (!lastTile || tile.type !== lastTile.type)
    damage = 3;
  lastTile = tile;
  //tile.alpha = tile.health / tileData[tile.type].health;
  tile.damage(damage);
  movePlayer();

  if (tile.type < 1)
    sandParticleBurst();
  else
    stoneParticleBurst();
}

function sandParticleBurst() {
  sandEmitter.x = player.x + player.width / 2;
  sandEmitter.y = player.y;

  sandEmitter.start(true, 1000, null, damage / 10);
}

function stoneParticleBurst() {
  stoneEmitter.x = player.x + player.width / 2;
  stoneEmitter.y = player.y;

  stoneEmitter.start(true, 1000, null, damage / 10);
}

function movePlayer() {
  switch (moveDirection) {
    case MOVE_UP:
      player.body.velocity.x = 0;
      player.body.velocity.y = -200;
      break;
    case MOVE_LEFT:
      //game.physics.moveToXY(player, player.x - tileSize, player.y, 200);
      // game.add.tween(player)
      //   .to({x: player.x - tileSize}, 500, Phaser.Easing.Bounce.Out, true, 0, false)
      //   .onCompleteCallback(function() {
      //     console.log('done');
      //   });
      player.body.velocity.x = -200;
      player.body.velocity.y = 0;
      break;
    case MOVE_RIGHT:
      player.body.velocity.x = 200;
      player.body.velocity.y = 0;
      // game.add.tween(player)
      //   .to({x: player.x + tileSize}, 500, Phaser.Easing.Bounce.Out, true, 0, false)
      //   .onCompleteCallback(function() {
      //     console.log('done');
      //   });
  }
}

function render() {
  // game.debug.renderSpriteInfo(player, player.x, player.y);
  // game.debug.renderSpriteCollision(player, player.x, player.y + 100);

  //game.debug.renderSpriteBounds(player, 'red');
  game.debug.currentX = player.x;
  game.debug.currentY = player.y;
  game.debug.renderSpriteCorners(player);
}
