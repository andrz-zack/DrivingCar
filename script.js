const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Ajustar canvas para móviles
function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;
    const ratio = 300 / 500;

    if (maxWidth / maxHeight > ratio) {
        canvas.style.width = (maxHeight * ratio) + 'px';
        canvas.style.height = maxHeight + 'px';
    } else {
        canvas.style.width = maxWidth + 'px';
        canvas.style.height = (maxWidth / ratio) + 'px';
    }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Variables del juego
let score = 0;
let gameSpeed = 3;
let gameOver = false;
let playerVelocity = 0;
const maxSpeed = 8;
const acceleration = 0.2;
const friction = 0.1;
let touchStartX = 0;

// Coche del jugador
const playerCar = {
    x: canvas.width / 2,
    y: canvas.height - 125,
    width: 40,
    height: 60,
    color: '#00f0ff' // Color base
};

// Coches enemigos
const enemyCars = [];
const carColors = ['#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6'];

// Marcadores de la carretera
const roadMarkers = [];
for (let i = 0; i < 10; i++) {
    roadMarkers.push({
        x: canvas.width / 2,
        y: i * 60 - 30,
        width: 10,
        height: 30
    });
}

// FUNCION MODIFICADA PARA COCHE BRILLANTE
function drawCar(x, y, width, height, color, isPlayer = false) {
    ctx.save();
    ctx.translate(x, y);

    // Sombra exterior para dar brillo
    ctx.shadowColor = isPlayer ? '#00f0ff' : 'transparent';
    ctx.shadowBlur = isPlayer ? 25 : 0;

    // Degradado metálico para el coche del jugador
    let gradient;
    if (isPlayer) {
        gradient = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
        gradient.addColorStop(0, '#00f0ff');
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, '#00f0ff');
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = color;
    }

    // Cuerpo del coche
    ctx.beginPath();
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(width / 2, -height / 3);
    ctx.lineTo(width / 2, height / 3);
    ctx.lineTo(width / 4, height / 2);
    ctx.lineTo(-width / 4, height / 2);
    ctx.lineTo(-width / 2, height / 3);
    ctx.lineTo(-width / 2, -height / 3);
    ctx.closePath();
    ctx.fill();

    // Ventanas
    ctx.fillStyle = '#a0d6f7';
    ctx.beginPath();
    ctx.moveTo(-width / 4, -height / 4);
    ctx.lineTo(width / 4, -height / 4);
    ctx.lineTo(width / 5, height / 4);
    ctx.lineTo(-width / 5, height / 4);
    ctx.closePath();
    ctx.fill();

    // Ruedas
    ctx.fillStyle = '#333';
    const wheelWidth = width / 4;
    const wheelHeight = height / 6;
    ctx.fillRect(width / 3, -height / 4, wheelWidth, wheelHeight);
    ctx.fillRect(-width / 3 - wheelWidth, -height / 4, wheelWidth, wheelHeight);
    ctx.fillRect(width / 3, height / 4 - wheelHeight / 2, wheelWidth, wheelHeight);
    ctx.fillRect(-width / 3 - wheelWidth, height / 4 - wheelHeight / 2, wheelWidth, wheelHeight);

    // Faro delantero (jugador)
    if (isPlayer) {
        ctx.fillStyle = '#ffffffcc';
        ctx.beginPath();
        ctx.arc(width / 2 - 5, -height / 3, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Llama trasera
    if (isPlayer) {
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(-width / 5, height / 2);
        ctx.lineTo(0, height / 2 + Math.random() * 10 + 10);
        ctx.lineTo(width / 5, height / 2);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}

// Bucle principal del juego
function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Marcadores de carretera
    ctx.fillStyle = '#ecf0f1';
    roadMarkers.forEach(marker => {
        marker.y += gameSpeed;
        if (marker.y > canvas.height) {
            marker.y = -30;
        }
        ctx.fillRect(marker.x - marker.width / 2, marker.y, marker.width, marker.height);
    });

    // Franjas laterales
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(0, 0, 20, canvas.height);
    ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);

    // Movimiento del jugador
    playerCar.x += playerVelocity;
    if (playerVelocity > 0) {
        playerVelocity = Math.max(0, playerVelocity - friction);
    } else if (playerVelocity < 0) {
        playerVelocity = Math.min(0, playerVelocity + friction);
    }
    playerCar.x = Math.max(30, Math.min(canvas.width - 30, playerCar.x));

    drawCar(playerCar.x, playerCar.y, playerCar.width, playerCar.height, playerCar.color, true);

    // Coches enemigos
    enemyCars.forEach(car => {
        car.y += gameSpeed;
        drawCar(car.x, car.y, car.width, car.height, car.color);

        const dx = playerCar.x - car.x;
        const dy = playerCar.y - car.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 30) {
            gameOver = true;
            setTimeout(() => {
                alert(`Game Over! Your score: ${score}`);
                location.reload();
            }, 100);
        }

        if (car.y > canvas.height + 50) {
            const index = enemyCars.indexOf(car);
            if (index > -1) {
                enemyCars.splice(index, 1);
                score++;
                scoreElement.textContent = `Score: ${score}`;
                if (score % 5 === 0) {
                    gameSpeed += 0.3;
                }
            }
        }
    });

    // Generar nuevos coches enemigos
    if (Math.random() < 0.02) {
        const width = 30;
        const height = 50;
        const x = 50 + Math.random() * (canvas.width - 100);
        const y = -height;
        const color = carColors[Math.floor(Math.random() * carColors.length)];

        enemyCars.push({ x, y, width, height, color });
    }

    requestAnimationFrame(gameLoop);
}

// Controles de teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        playerVelocity = Math.max(-maxSpeed, playerVelocity - acceleration);
    }
    if (e.key === 'ArrowRight') {
        playerVelocity = Math.min(maxSpeed, playerVelocity + acceleration);
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        playerVelocity = 0;
    }
});

// Controles táctiles
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const touchDiff = touchX - touchStartX;
    playerVelocity = Math.max(-maxSpeed, Math.min(maxSpeed, touchDiff * 0.1));
});

// Iniciar juego
gameLoop();
