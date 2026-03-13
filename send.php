<?php
// Настройки — ЗАПОЛНИ СВОИ ДАННЫЕ:
$telegramBotToken = '8356853804:AAHimCYYl6Zne1X5zAnx3TrTh30g280bkxc'; // токен бота @BotFather
$telegramChatId   = '2004263174';   // chat_id (число или @username не подойдёт)
$emailTo          = 'it1-dev@mail.ru';           // твой email для заявок
$emailSubject     = 'Новая заявка с сайта ITDEV';

header('Content-Type: application/json; charset=utf-8');

// Разрешаем только POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

// Получение данных формы
function getField($key) {
    return isset($_POST[$key]) ? trim((string)$_POST[$key]) : '';
}

$name          = getField('name');
$email         = getField('email');
$phone         = getField('phone');
$message       = getField('message');
$estimatedPrice= getField('estimatedPrice');

// Простая валидация
if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Пожалуйста, заполните обязательные поля (Имя, Email, Сообщение).'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Текст заявки
$textLines = [
    "Новая заявка с сайта ITDEV:",
    "",
    "Имя: {$name}",
    "Email: {$email}",
    $phone !== '' ? "Телефон: {$phone}" : null,
    $estimatedPrice !== '' ? "Примерная стоимость: {$estimatedPrice}" : null,
    "",
    "Сообщение:",
    $message,
];

// Убираем пустые строки
$textLines = array_filter($textLines, function ($line) {
    return $line !== null;
});

$fullText = implode("\n", $textLines);

// Отправка в Telegram
$telegramOk = false;
if ($telegramBotToken !== '' && $telegramBotToken !== 'PASTE_YOUR_BOT_TOKEN_HERE'
    && $telegramChatId !== '' && $telegramChatId !== 'PASTE_YOUR_CHAT_ID_HERE') {
    $telegramUrl = 'https://api.telegram.org/bot' . urlencode($telegramBotToken) . '/sendMessage';
    $postData = http_build_query([
        'chat_id' => $telegramChatId,
        'text'    => $fullText,
        'parse_mode' => 'HTML',
    ]);

    $context = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/x-www-form-urlencoded\r\n" .
                         "Content-Length: " . strlen($postData) . "\r\n",
            'content' => $postData,
            'timeout' => 5,
        ],
    ]);

    $result = @file_get_contents($telegramUrl, false, $context);
    if ($result !== false) {
        $decoded = json_decode($result, true);
        $telegramOk = isset($decoded['ok']) ? (bool)$decoded['ok'] : false;
    }
}

// Отправка письма на email
$emailOk = false;
if ($emailTo !== '' && $emailTo !== 'you@example.com') {
    $headers = [];
    $headers[] = 'Content-Type: text/plain; charset=utf-8';
    $headers[] = 'From: ITDEV <no-reply@itdev.local>';
    $headers[] = 'Reply-To: ' . $email;

    $emailOk = @mail(
        $emailTo,
        '=?UTF-8?B?' . base64_encode($emailSubject) . '?=',
        $fullText,
        implode("\r\n", $headers)
    );
}

// Ответ фронтенду
if ($telegramOk || $emailOk) {
    echo json_encode([
        'success' => true,
        'message' => 'Спасибо! Ваша заявка отправлена.'
    ], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами другим способом.'
    ], JSON_UNESCAPED_UNICODE);
}

