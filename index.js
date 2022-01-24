const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const bigScoreEl = document.querySelector('#bigScoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')

class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  darw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2 ,false)
    c.fillStyle = this.color
    c.fill()

  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }
  darw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2 ,false)
    c.fillStyle = this.color
    c.fill()
  }
  update() {
    this.darw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}


class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }
  darw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2 ,false)
    c.fillStyle = this.color
    c.fill()
  }
  update() {
    this.darw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

const friction = 0.99

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }
  darw() {
    c.save()
    c.globalAlpha = 0.1
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2 ,false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }
  update() {
    this.darw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.01
  }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 30, 'white')
let projectiles = []
let enemies = []
let particles = []

function init() {
  player = new Player(x, y, 30, 'white')
  projectiles = []
  enemies = []
  particles = []
  score = 0
  scoreEl.innerHTML = score
  bigScoreEl.innerHTML = score
}

function spawnEnemies() {
  setInterval(() => {
    const radius = 30 * Math.random() + 10

    let x
    let y

    if (Math.random() < 0.5) {
      x = 0 - radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = canvas.height + radius
    }
    
    const color = `hsl(${Math.random()* 360} , 50%, 50%)`
    
    const angle = Math.atan2(
    canvas.height / 2 - y,
    canvas.width / 2 - x
  )
    const velocity = {
      x: Math.cos(angle) ,
      y: Math.sin(angle) 
    }

    enemies.push(new Enemy(x, y, radius, color, velocity))
  }, 1000)
}

let animationId
let score = 0

function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0,0,0, 0.1)'
  c.fillRect(0,0, canvas.width, canvas.height)
  player.darw()
  particles.forEach((particle,index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }

  })
  projectiles.forEach((projectile, index) => {
    projectile.update()

    //remove from edges of screen
    if (projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > canvas.clientWidth ||
        projectile.y - projectile.radius > canvas.height ||
        projectile.y + projectile.radius < 0 ) {
      setTimeout(()=>  {
          projectiles.splice(index, 1)
        }, 0)
    }
  })

  enemies.forEach((enemy, index) => {
    enemy.update()

    const dist = Math.hypot(player.x - enemy.x,
      player.y - enemy.y)
    
    // end game
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId)
      modalEl.style.display = 'flex'
      bigScoreEl.innerHTML = score
    }

    projectiles.forEach((projectile,projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x,
      projectile.y - enemy.y)

      // when projectiles touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        // increase our core
        score += 100
        scoreEl.innerHTML = score

        //create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(new Particle( //if you change particles to projectile it becomes nuclear difussion
            projectile.x,
            projectile.y, 
            Math.random() * 3,
            enemy.color,
            {
              x: (Math.random() - 0.5) * ( 4 * Math.random()),
              y: (Math.random() - 0.5) * ( 4 * Math.random())
            }
          ))
        }

        if (enemy.radius - 10 > 10) {
          gsap.to(enemy, {
            radius: enemy.radius - 15
          })
          setTimeout(()=>  {
          projectiles.splice(projectileIndex, 1)
        }, 0)
        } else {
          //remove from scene all together
          score += 250
          scoreEl.innerHTML = score
          setTimeout(()=>  {
          enemies.splice(index, 1)
          projectiles.splice(projectileIndex, 1)
        }, 0)
        }
        
      }
    })
  })
}
  
window.addEventListener('click', (event) => {
  const angle = Math.atan2(
  event.clientY - canvas.height / 2,
  event.clientX - canvas.width / 2 
  )
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }
  projectiles.push(new Projectile(
    canvas.width / 2,
    canvas.height / 2,
    5,
    'white',
    velocity
  ))
})

startGameBtn.addEventListener('click', () => {
  init()
  animate()
  spawnEnemies()  
  modalEl.style.display = 'none'
})