
var game = new Phaser.Game(450, 700, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var player;
var cursors;
var magma;
var lastTile;
var damage;

var MOVE_UP = 0;
var MOVE_LEFT = 1;
var MOVE_RIGHT = 2;
var moveDirection = MOVE_UP;
var tileGroup;

var emitter;

function preload() {
  game.load.image('background','assets/games/tanks/earth.png');
  game.load.spritesheet('tile', 'assets/buttons/number-buttons-90x90.png', 90, 90);
  // game.load.image('sand', 'assets/platformer/sandCenter_rounded.png');
  // game.load.image('dirt', 'assets/platformer/snowCenter_rounded.png');
  // game.load.image('stone', 'assets/platformer/stoneWall.png');
  game.load.image('player', 'assets/sprites/shinyball.png');
  // game.load.image('magma','assets/games/breakout/brick2.png');
  game.load.image('magma','assets/games/breakout/brick2.png');
  game.load.image('diamond', 'assets/games/starstruck/star.png');
}

function create() {
  game.world.setBounds(0, 0, game.width, game.height * 100);
  game.add.tileSprite(0, 0, game.world.width, game.world.height * 100, 'background');

  magma = game.add.tileSprite(0, game.world.height - 100, game.world.width, game.world.height, 'magma');
  magma.body.velocity.y = -80;

  var rnd = new Phaser.RandomDataGenerator([42]);

  tileGroup = game.add.group();

  // var tileImages = ['sand', 'dirt', 'stone'];
  // tileImages[tileType]

  for (var y = 0; y < 72; y++) {
    for (var x = 0; x < 5; x++) {
      var tileType = rnd.integerInRange(1,4);
      var sprite = tileGroup.create(90 * x, game.world.height - game.height - 90 * y, 'tile', (tileType-1));
      sprite.type = tileType;
      sprite.health = 50 + tileType * tileType * 10;
      sprite.body.immovable = true;
    }
  }

  emitter = game.add.emitter(0, 0, 1000);
  emitter.minParticleSpeed.setTo(-200, 0);
  emitter.maxParticleSpeed.setTo(200, 200);
  emitter.gravity = 8;
  emitter.bounce.setTo(0.5, 0.5);
  emitter.particleDrag.x = 10;
  emitter.angularDrag = 30;
  emitter.makeParticles('diamond');

  player = game.add.sprite(game.width / 2, game.world.height - game.height / 2, 'player');

  game.camera.follow(player, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);

  cursors = game.input.keyboard.createCursorKeys();
}

function update() {
  //game.input.keyboard.justPressed(Phaser.Keyboard.LEFT)
  if (cursors.left.isDown) {
    moveDirection = MOVE_LEFT;
  } else if (cursors.right.isDown) {
    moveDirection = MOVE_RIGHT;
  } else {
    moveDirection = MOVE_UP;
  }

  movePlayer();

  var collision = game.physics.collide(player, tileGroup, collisionHandler, null, this);
  player.scale.y = (collision ? 0.8 : 1);

  game.physics.collide(emitter, tileGroup);
}

function collisionHandler (player, tile) {
  if (tile !== lastTile)
    damage += 3;
  if (!lastTile || tile.type !== lastTile.type)
    damage = 3;
  lastTile = tile;
  tile.alpha = tile.health / (50 + tile.type * tile.type * 10);
  tile.damage(damage);
  movePlayer();
  particleBurst();
}

function particleBurst() {
  emitter.x = player.x + player.width / 2;
  emitter.y = player.y;

  emitter.start(true, 1000, null, damage / 10);
}

function movePlayer() {
  switch (moveDirection) {
    case MOVE_UP:
      player.body.velocity.x = 0;
      player.body.velocity.y = -200;
      break;
    case MOVE_LEFT:
      player.body.velocity.x = -200;
      player.body.velocity.y = 0;
      break;
    case MOVE_RIGHT:
      player.body.velocity.x = 200;
      player.body.velocity.y = 0;
  }
}

function render() {
  // game.debug.renderCameraInfo(game.camera, 32, 32);
}
