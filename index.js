console.log(gsap)

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

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

class Particle {
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

const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player(x, y, 30, 'white')
const projectiles = []
const enemies = []
const particles = []

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

function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0,0,0, 0.1)'
  c.fillRect(0,0, canvas.width, canvas.height)
  player.darw()
  particles.forEach(particle => {
    particle.update()
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
    }

    projectiles.forEach((projectile,projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x,
      projectile.y - enemy.y)

      // when projectiles touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        for (let i = 0; i < 8; i++) {
          projectiles.push(new Particle(projectile.x, projectile.y,
            3, enemy.color, {
              x: Math.random() - 0.5,
              y: Math.random() - 0.5
          }))
        }

        if (enemy.radius - 10 > 5) {
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
          setTimeout(()=>  {
          projectiles.splice(projectileIndex, 1)
        }, 0)
        } else {
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
  console.log(projectiles)
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

animate()
spawnEnemies()
