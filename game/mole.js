
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

function preload() {
  game.load.image('background','assets/misc/starfield.png');
  game.load.spritesheet('item', 'assets/buttons/number-buttons-90x90.png', 90, 90);
  game.load.image('player', 'assets/sprites/shinyball.png');
  game.load.image('magma','assets/games/breakout/brick2.png');
}

function create() {
  game.world.setBounds(0, 0, game.width, game.height * 100);
  game.add.tileSprite(0, 0, game.world.width, game.world.height * 100, 'background');

  magma = game.add.tileSprite(0, game.world.height - 100, game.world.width, game.world.height, 'magma');
  magma.body.velocity.y = -80;

  var rnd = new Phaser.RandomDataGenerator([42]);

  tileGroup = game.add.group();

  for (var y = 0; y < 72; y++) {
    for (var x = 0; x < 6; x++) {
      var tileType = rnd.integerInRange(0,6);
      var sprite = tileGroup.create(90 * x, game.world.height - game.height - 90 * y, 'item', tileType);
      sprite.health = tileType * tileType * 10;
      sprite.body.immovable = true;
    }
  }

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
}

function collisionHandler (player, tile) {
  if (tile !== lastTile)
    damage += 4;
  if (!lastTile || tile.frame !== lastTile.frame)
    damage = 4;
  lastTile = tile;
  tile.damage(damage);
  movePlayer();
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
