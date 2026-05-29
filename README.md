# 🌙 Screen Dreams

Интерактивные скринсейверы для вашего браузера. Выбирайте из галереи и наслаждайтесь анимацией на полном экране.

🔗 **Сайт:** [https://ваш-username.github.io/screen-dreams/](https://ваш-username.github.io/screen-dreams/)

---

## 📸 Скриншоты

| Матрица | Частицы | Звёзды |
|---------|---------|--------|
| ![Matrix](images/previews/matrix.png) | ![Particles](images/previews/particles.png) | ![Starfield](images/previews/starfield.png) |

---

## 🎮 Как использовать

1. Откройте сайт в браузере
2. Выберите интересующий скринсейвер из галереи
3. Нажмите **"Полный экран"** для полноэкранного режима
4. Наслаждайтесь анимацией!

**Управление:**
- `Escape` — вернуться в галерею
- Кнопка `← Назад` — вернуться в галерею

---

## 🖥️ Доступные скринсейверы

| Название | Описание | Технология |
|----------|----------|------------|
| **Matrix** | Зелёные символы падают вниз, как в фильме | Canvas 2D |
| **Particles** | Частицы, которые следуют за мышью | Canvas 2D |
| **Starfield** | 3D полёт сквозь звёздное поле | Three.js |
| **Snow** | Мягко падающий снег | Canvas 2D |
| **Rain** | Вертикальный дождь с эффектом размытия | Canvas 2D |
| **Gradient** | Плавно меняющиеся цветовые градиенты | CSS |
| **Fire** | Реалистичный эффект пламени | Canvas 2D |

---

## 🛠️ Технологии

- **HTML5** — структура страниц
- **CSS3** — стили и анимации
- **JavaScript** — логика анимаций
- **Canvas 2D API** — 2D-графика
- **Three.js** — 3D-графика (WebGL)
- **GitHub Pages** — хостинг

---

## 📁 Структура проекта

```
screen-dreams/
├── index.html                    # Главная страница
├── css/style.css                 # Стили
├── js/gallery.js                 # Логика галереи
├── data/screensavers.json        # Конфиг скринсейверов
├── images/previews/              # Превью картинки
├── screensavers/                 # Папки со скринсейверами
│   ├── _template/               # Шаблон
│   ├── matrix/
│   ├── particles/
│   ├── starfield/
│   ├── snow/
│   ├── rain/
│   ├── gradient/
│   └── fire/
└── README.md
```

---

## ➕ Как добавить свой скринсейвер

### Пошаговая инструкция:

1. **Скопируйте шаблон**
   ```bash
   cp -r screensavers/_template screensavers/my-screensaver
   ```

2. **Отредактируйте `script.js`**
   - Напишите свою анимацию
   - Используйте Canvas 2D, Three.js или CSS

3. **Создайте превью**
   - Сделайте скриншот работающего скринсейвера
   - Сохраните в `images/previews/my-screensaver.png`
   - Рекомендуемый размер: 800×600 пикселей

4. **Добавьте запись в `data/screensavers.json`**
   ```json
   {
     "id": "my-screensaver",
     "name": "Мой скринсейвер",
     "description": "Описание того, что делает скринсейвер",
     "preview": "images/previews/my-screensaver.png",
     "path": "screensavers/my-screensaver/",
     "tags": ["tag1", "tag2"],
     "technology": "canvas2d"
   }
   ```

5. **Запушьте изменения**
   ```bash
   git add .
   git commit -m "Добавлен скринсейвер: мой-скринсейвер"
   git push
   ```

6. **Готово!** Новый скринсейвер появится на сайте через несколько минут.

---

## 🎨 Создание скринсейвера с нуля

### Базовый шаблон (Canvas 2D):

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Название скринсейвера</title>
    <style>
        * { margin: 0; padding: 0; }
        body { background: #000; overflow: hidden; }
        canvas { display: block; }
        .controls {
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            display: flex;
            justify-content: space-between;
            z-index: 100;
        }
        .back-btn, .fullscreen-btn {
            background: rgba(255,255,255,0.1);
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        .back-btn:hover, .fullscreen-btn:hover {
            background: rgba(255,255,255,0.2);
        }
    </style>
</head>
<body>
    <div class="controls">
        <a href="../../index.html" class="back-btn">← Назад</a>
        <button class="fullscreen-btn" onclick="toggleFullscreen()">⛶ Полный экран</button>
    </div>
    <canvas id="canvas"></canvas>
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        // Ваша анимация здесь
        function animate() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            requestAnimationFrame(animate);
        }
        animate();

        // Полноэкранный режим
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }

        // Возврат по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    window.location.href = '../../index.html';
                }
            }
        });
    </script>
</body>
</html>
```

---

## 🚀 Запуск локально

Для разработки используйте любой локальный сервер:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Затем откройте `http://localhost:8000` в браузере.

---

## 📝 Лицензия

MIT License — свободное использование и модификация.

---

## 👥 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для новой фичи (`git checkout -b feature/my-feature`)
3. Сделайте коммиты (`git commit -m 'Добавил новый скринсейвер'`)
4. Запушьте ветку (`git push origin feature/my-feature`)
5. Откройте Pull Request

---

## 📧 Контакты

- GitHub Issues — для вопросов и предложений
- Pull Requests — для вклада в проект

---

**Сделано с ❤️ для любителей красивых заставок**
