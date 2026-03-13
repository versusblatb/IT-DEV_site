// Калькулятор стоимости
let basePrice = 0;
let optionsPrice = 0;
let timelineMultiplier = 1;

// Инициализация калькулятора
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    initializeContactForm();
    initializeAnimations();
    initializeStatistics();
    initializeFAQ();
    initializeScrollToTop();
    initializeChat();
    initializeMobileMenu();
    initializeBlog();
    updateCalculator();
});

// Инициализация калькулятора
function initializeCalculator() {
    // Обработчики для типа сайта
    const siteTypeInputs = document.querySelectorAll('input[name="siteType"]');
    siteTypeInputs.forEach(input => {
        input.addEventListener('change', function() {
            basePrice = parseInt(this.dataset.price) || 0;
            updateCalculator();
        });
    });

    // Обработчики для дополнительных опций
    const optionInputs = document.querySelectorAll('input[name="options"]');
    optionInputs.forEach(input => {
        input.addEventListener('change', function() {
            calculateOptionsPrice();
            updateCalculator();
        });
    });

    // Обработчики для сроков
    const timelineInputs = document.querySelectorAll('input[name="timeline"]');
    timelineInputs.forEach(input => {
        input.addEventListener('change', function() {
            timelineMultiplier = parseFloat(this.dataset.multiplier) || 1;
            updateCalculator();
        });
    });
}

// Расчёт стоимости дополнительных опций
function calculateOptionsPrice() {
    optionsPrice = 0;
    const checkedOptions = document.querySelectorAll('input[name="options"]:checked');
    checkedOptions.forEach(option => {
        optionsPrice += parseInt(option.dataset.price) || 0;
    });
}

// Обновление калькулятора
function updateCalculator() {
    const total = Math.round((basePrice + optionsPrice) * timelineMultiplier);
    const totalPriceElement = document.getElementById('totalPrice');
    const resultDetailsElement = document.getElementById('resultDetails');
    
    // Анимация изменения цены
    if (totalPriceElement) {
        animateValue(totalPriceElement, parseInt(totalPriceElement.textContent) || 0, total, 500);
    }

    // Обновление деталей
    if (resultDetailsElement) {
        let details = '<strong>Детали расчёта:</strong><br>';
        
        if (basePrice > 0) {
            const selectedSiteType = document.querySelector('input[name="siteType"]:checked');
            if (selectedSiteType) {
                const siteTypeName = selectedSiteType.closest('.option-card').querySelector('.option-name').textContent;
                details += `• Тип сайта: ${siteTypeName}<br>`;
            }
        } else {
            details += '• Выберите тип сайта<br>';
        }

        if (optionsPrice > 0) {
            const checkedOptions = document.querySelectorAll('input[name="options"]:checked');
            if (checkedOptions.length > 0) {
                details += `• Дополнительные опции: ${checkedOptions.length}<br>`;
            }
        }

        const selectedTimeline = document.querySelector('input[name="timeline"]:checked');
        if (selectedTimeline) {
            const timelineName = selectedTimeline.closest('.option-card').querySelector('.option-name').textContent;
            details += `• Сроки: ${timelineName}<br>`;
        }

        if (timelineMultiplier !== 1) {
            const multiplierText = timelineMultiplier > 1 ? `+${Math.round((timelineMultiplier - 1) * 100)}%` : `${Math.round((timelineMultiplier - 1) * 100)}%`;
            details += `• Коэффициент сроков: ${multiplierText}<br>`;
        }

        resultDetailsElement.innerHTML = details;
    }

    // Обновление поля в форме контактов
    const estimatedPriceInput = document.getElementById('estimatedPrice');
    if (estimatedPriceInput) {
        estimatedPriceInput.value = total > 0 ? `${total.toLocaleString('ru-RU')} ₽` : '';
    }
}

// Анимация изменения числа
function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const isIncreasing = end > start;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing функция для плавной анимации
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOutCubic);
        
        element.textContent = current.toLocaleString('ru-RU');
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end.toLocaleString('ru-RU');
        }
    }
    
    requestAnimationFrame(update);
}

// Инициализация формы обратной связи
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// Обработка отправки формы
function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('.submit-button');
    const formMessage = document.getElementById('formMessage');
    
    // Получение данных формы
    const formData = new FormData(form);
    formData.set('name', document.getElementById('name').value.trim());
    formData.set('email', document.getElementById('email').value.trim());
    formData.set('phone', document.getElementById('phone').value.trim());
    formData.set('message', document.getElementById('message').value.trim());
    formData.set('estimatedPrice', document.getElementById('estimatedPrice').value.trim());
    
    // Показ индикатора загрузки
    submitButton.classList.add('loading');
    formMessage.className = 'form-message';
    formMessage.style.display = 'none';
    
    // Отправка данных на ваш сервер/worker, который шлёт в Telegram
    // ЗАМЕНИТЕ URL НИЖЕ на адрес вашего Cloudflare Worker или другого бэкенда
    fetch('https://itdev-form.kadieveldar07.workers.dev', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message'),
            estimatedPrice: formData.get('estimatedPrice')
        })
    })
    .then(response => response.json().catch(() => null).then(data => ({ ok: response.ok, status: response.status, data })))
    .then(result => {
        submitButton.classList.remove('loading');

        if (result.ok && result.data && result.data.success) {
            formMessage.className = 'form-message success';
            formMessage.textContent = result.data.message || 'Спасибо! Ваше сообщение отправлено.';

            // Очистка формы
            form.reset();
            const estimatedPriceInput = document.getElementById('estimatedPrice');
            if (estimatedPriceInput) {
                estimatedPriceInput.value = '';
            }
        } else {
            formMessage.className = 'form-message error';
            const serverMessage = result.data && result.data.message;
            formMessage.textContent = serverMessage || 'Ошибка при отправке. Попробуйте ещё раз.';
        }

        formMessage.style.display = 'block';

        // Скрытие сообщения через 5 секунд
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    })
    .catch(() => {
        submitButton.classList.remove('loading');
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Ошибка при отправке. Проверьте соединение с интернетом и попробуйте ещё раз.';
        formMessage.style.display = 'block';
    });
}

// Прокрутка к форме контактов
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Фокус на первое поле формы через небольшую задержку
        setTimeout(() => {
            const nameInput = document.getElementById('name');
            if (nameInput) {
                nameInput.focus();
            }
        }, 500);
    }
}

// Инициализация анимаций при прокрутке
function initializeAnimations() {
    // Анимация появления элементов при прокрутке
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Добавление класса для анимации к элементам
    const animatedElements = document.querySelectorAll('.about-card, .option-group, .info-card, .contact-form');
    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
    
    // Плавная прокрутка для навигационных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Учитываем высоту навигации
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Изменение навигации при прокрутке
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }
        
        lastScroll = currentScroll;
    });
}

// Инициализация статистики с анимацией
function initializeStatistics() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const target = parseInt(entry.target.dataset.target) || 0;
                animateNumber(entry.target, 0, target, 2000);
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

// Анимация числа
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing функция
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOutCubic);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end;
        }
    }
    
    requestAnimationFrame(update);
}

// Инициализация FAQ
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Закрываем все остальные
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Переключаем текущий
            item.classList.toggle('active', !isActive);
        });
    });
}

// Инициализация кнопки "Наверх"
function initializeScrollToTop() {
    const scrollButton = document.getElementById('scrollToTop');
    
    if (scrollButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollButton.classList.add('visible');
            } else {
                scrollButton.classList.remove('visible');
            }
        });
        
        scrollButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Инициализация чата
function initializeChat() {
    const chatButton = document.getElementById('chatButton');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    const botResponses = [
        "Спасибо за ваш вопрос! Наш менеджер свяжется с вами в ближайшее время.",
        "Отличный вопрос! Давайте обсудим это подробнее. Можете оставить свой номер телефона?",
        "Понял вас! Для более детальной консультации рекомендую связаться с нами по телефону или через форму на сайте.",
        "Спасибо за интерес к нашим услугам! Мы готовы помочь вам создать идеальный сайт."
    ];
    
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, true);
            chatInput.value = '';
            
            // Имитация ответа бота
            setTimeout(() => {
                const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
                addMessage(randomResponse, false);
            }, 1000);
        }
    }
    
    if (chatButton) {
        chatButton.addEventListener('click', function() {
            chatWindow.classList.toggle('active');
        });
    }
    
    if (chatClose) {
        chatClose.addEventListener('click', function() {
            chatWindow.classList.remove('active');
        });
    }
    
    if (chatSend) {
        chatSend.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Инициализация мобильного меню
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = navMenu.querySelectorAll('a');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Закрытие меню при клике на ссылку
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Инициализация блога
function initializeBlog() {
    const blogLinks = document.querySelectorAll('.blog-link');
    const blogModal = document.getElementById('blogModal');
    const blogModalClose = document.getElementById('blogModalClose');
    const blogModalBody = document.getElementById('blogModalBody');
    const blogModalOverlay = blogModal.querySelector('.blog-modal-overlay');

    // Контент статей
    const articles = {
        1: {
            title: 'Тренды веб-дизайна в 2024 году',
            date: '15 Марта 2024',
            icon: '📱',
            content: `
                <div class="blog-modal-image">📱</div>
                <div class="blog-modal-text">
                    <p>2024 год принес множество интересных трендов в веб-дизайне, которые определяют современный облик интернета. Давайте рассмотрим основные направления, которые стоит учитывать при создании веб-сайтов.</p>
                    
                    <h4>Минимализм и чистота</h4>
                    <p>Минималистичный дизайн продолжает доминировать. Простые, чистые интерфейсы с большим количеством белого пространства помогают пользователям сосредоточиться на главном. Это не только эстетически приятно, но и улучшает пользовательский опыт.</p>
                    
                    <h4>Темная тема</h4>
                    <p>Темные темы стали стандартом для многих приложений и сайтов. Они не только выглядят современно, но и снижают нагрузку на глаза, особенно при работе в темное время суток. Многие пользователи предпочитают темные интерфейсы.</p>
                    
                    <h4>Интерактивные элементы</h4>
                    <p>Современные сайты активно используют интерактивные элементы: анимации, микроинтеракции, плавные переходы. Это делает интерфейс более живым и отзывчивым, улучшая вовлеченность пользователей.</p>
                    
                    <h4>Адаптивный дизайн</h4>
                    <p>Адаптивность перестала быть опцией - это обязательное требование. Сайты должны идеально работать на всех устройствах: от больших мониторов до маленьких смартфонов. Mobile-first подход становится стандартом.</p>
                    
                    <h4>Типографика</h4>
                    <p>Крупная, читаемая типографика с правильной иерархией помогает пользователям легко воспринимать информацию. Кастомные шрифты и правильное использование типографики создают уникальный характер сайта.</p>
                </div>
            `
        },
        2: {
            title: 'Как ускорить загрузку сайта',
            date: '10 Марта 2024',
            icon: '⚡',
            content: `
                <div class="blog-modal-image">⚡</div>
                <div class="blog-modal-text">
                    <p>Скорость загрузки сайта - один из ключевых факторов успеха в современном интернете. Медленный сайт теряет пользователей и ухудшает позиции в поисковых системах. Вот практические советы по оптимизации.</p>
                    
                    <h4>Оптимизация изображений</h4>
                    <p>Изображения часто занимают большую часть трафика. Используйте современные форматы (WebP, AVIF), сжимайте изображения без потери качества, используйте lazy loading для изображений ниже экрана. Это может сократить размер страницы на 50-70%.</p>
                    
                    <h4>Минификация и сжатие</h4>
                    <p>Минифицируйте CSS, JavaScript и HTML файлы. Используйте Gzip или Brotli сжатие на сервере. Это значительно уменьшит размер передаваемых файлов и ускорит загрузку.</p>
                    
                    <h4>Кэширование</h4>
                    <p>Настройте правильное кэширование на сервере. Статические ресурсы должны кэшироваться на длительный срок, а динамический контент - на разумный период. Это уменьшит количество запросов к серверу.</p>
                    
                    <h4>CDN (Content Delivery Network)</h4>
                    <p>Используйте CDN для доставки статического контента. Это размещает ваши файлы ближе к пользователям, что значительно ускоряет загрузку, особенно для международной аудитории.</p>
                    
                    <h4>Оптимизация кода</h4>
                    <p>Удаляйте неиспользуемый код, используйте асинхронную загрузку для скриптов, которые не критичны для первоначальной отрисовки. Оптимизируйте CSS - удаляйте неиспользуемые стили.</p>
                    
                    <h4>Влияние на конверсию</h4>
                    <p>Исследования показывают, что увеличение времени загрузки с 1 до 3 секунд снижает конверсию на 32%. Быстрый сайт не только улучшает пользовательский опыт, но и напрямую влияет на бизнес-результаты.</p>
                </div>
            `
        },
        3: {
            title: 'SEO-оптимизация: с чего начать',
            date: '5 Марта 2024',
            icon: '🔍',
            content: `
                <div class="blog-modal-image">🔍</div>
                <div class="blog-modal-text">
                    <p>SEO-оптимизация - это комплекс мер для улучшения видимости сайта в поисковых системах. Правильная SEO-стратегия может значительно увеличить органический трафик и привлечь целевую аудиторию.</p>
                    
                    <h4>Техническая оптимизация</h4>
                    <p>Начните с технических аспектов: скорость загрузки, мобильная адаптивность, правильная структура HTML, использование семантических тегов. Убедитесь, что сайт доступен для индексации поисковыми роботами.</p>
                    
                    <h4>Ключевые слова</h4>
                    <p>Проведите исследование ключевых слов, которые использует ваша целевая аудитория. Используйте их естественным образом в заголовках, текстах, мета-описаниях. Избегайте переспама ключевыми словами.</p>
                    
                    <h4>Качественный контент</h4>
                    <p>Создавайте полезный, уникальный контент, который отвечает на вопросы пользователей. Регулярно обновляйте контент, добавляйте новые статьи и материалы. Поисковые системы ценят свежий, релевантный контент.</p>
                    
                    <h4>Внутренняя перелинковка</h4>
                    <p>Правильно связывайте страницы сайта между собой. Это помогает поисковым роботам лучше понимать структуру сайта и распределять "вес" страниц. Используйте осмысленные анкоры для ссылок.</p>
                    
                    <h4>Мета-теги и структурированные данные</h4>
                    <p>Заполните мета-теги (title, description) для каждой страницы. Используйте структурированные данные (Schema.org) для лучшего отображения в результатах поиска. Это может увеличить CTR из поисковой выдачи.</p>
                    
                    <h4>Внешние ссылки и авторитет</h4>
                    <p>Получайте качественные внешние ссылки с авторитетных сайтов. Это повышает доверие поисковых систем к вашему сайту. Создавайте контент, которым хочется делиться.</p>
                    
                    <h4>Мониторинг и анализ</h4>
                    <p>Используйте инструменты аналитики (Google Analytics, Яндекс.Метрика) для отслеживания результатов. Регулярно проверяйте позиции в поисковых системах и анализируйте поведение пользователей на сайте.</p>
                </div>
            `
        }
    };

    // Обработчик клика на ссылку "Читать далее"
    blogLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const articleId = this.dataset.article;
            const article = articles[articleId];

            if (article) {
                blogModalBody.innerHTML = `
                    <div class="blog-modal-header">
                        <div class="blog-modal-date">${article.date}</div>
                        <h2 class="blog-modal-title">${article.title}</h2>
                    </div>
                    ${article.content}
                `;
                blogModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Закрытие модального окна
    function closeModal() {
        blogModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (blogModalClose) {
        blogModalClose.addEventListener('click', closeModal);
    }

    if (blogModalOverlay) {
        blogModalOverlay.addEventListener('click', closeModal);
    }

    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && blogModal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Обновление калькулятора при загрузке страницы
window.addEventListener('load', function() {
    // Установка значения по умолчанию для сроков
    const defaultTimeline = document.querySelector('input[name="timeline"][checked]');
    if (defaultTimeline) {
        timelineMultiplier = parseFloat(defaultTimeline.dataset.multiplier) || 1;
    }
    updateCalculator();
});

