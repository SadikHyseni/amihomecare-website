<?php
/**
 * Ami Home Care — website form handler
 * Emails care enquiries and job applications to the office inbox.
 *
 * Spam and abuse protection:
 *  1. Honeypot field ("website") that people never see but bots fill in
 *  2. Time check: forms sent within 3 seconds of the page opening are treated as bots
 *  3. Same-site check: only accepts posts sent from this website
 *  4. Rate limit: at most 5 messages per hour from the same connection
 *  5. Duplicate check: the same message sent twice within 10 minutes is only emailed once
 *  6. Link filter: rejects messages stuffed with web links
 *  7. Every field is cleaned so the form cannot be used to send email to anyone else
 */
declare(strict_types=1);

date_default_timezone_set('Europe/London');

// ---- Settings ---------------------------------------------------------------
const TO_EMAIL     = 'info@amihomecare.com';  // where messages are delivered
const FROM_EMAIL   = 'info@amihomecare.com';  // must be an address on this domain
const MIN_SECONDS  = 3;
const MAX_PER_HOUR = 5;
const DUPLICATE_WINDOW = 600;                 // seconds
const MAX_LINKS    = 2;
const CARE_TYPES = [
    'personal-care'      => 'Personal care',
    'companionship'      => 'Companionship',
    'live-in-care'       => 'Live-in care',
    'dementia-care'      => 'Dementia care',
    'complex-care'       => 'Complex care',
    'hospital-discharge' => 'Hospital discharge support',
    'night-sitting'      => 'Night sitting',
    'palliative-care'    => 'Palliative care',
    'help-at-home'       => 'Help at home care',
    'not-sure'           => 'Not sure yet',
];
const METHODS = ['phone' => 'Phone', 'email' => 'Email', 'either' => 'Either'];
const ROLES = ['Care Worker', 'Field Manager'];
// -----------------------------------------------------------------------------

$wantsJson = stripos((string)($_SERVER['HTTP_ACCEPT'] ?? ''), 'application/json') !== false;
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

/** Sends the result as JSON (for the website's own script) or as a simple page (if JavaScript is off). */
function respond(bool $ok, string $message = '', int $code = 200): void
{
    global $wantsJson;
    http_response_code($code);
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message]);
        exit;
    }
    header('Content-Type: text/html; charset=utf-8');
    $title = $ok ? 'Thank you. Your message has been sent.' : 'Sorry, your message could not be sent.';
    $text  = $ok ? 'We will be in touch soon.' : ($message !== '' ? $message : 'Please call us on 020 3026 3706 or email info@amihomecare.com.');
    echo '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<meta name="robots" content="noindex"><title>' . htmlspecialchars($title) . ' | Ami Home Care</title>'
        . '<link rel="stylesheet" href="css/styles.css"></head><body><main class="section"><div class="wrap stack measure">'
        . '<h1>' . htmlspecialchars($title) . '</h1><p class="lead">' . htmlspecialchars($text) . '</p>'
        . '<p><a class="btn btn--primary" href="index.html">Back to the home page</a></p></div></main></body></html>';
    exit;
}

function cut(string $v, int $max): string
{
    return function_exists('mb_substr') ? mb_substr($v, 0, $max, 'UTF-8') : substr($v, 0, $max);
}

/** Single-line field: no tags and no line breaks (prevents email header injection). */
function field(string $key, int $max = 200): string
{
    $v = strip_tags((string)($_POST[$key] ?? ''));
    $v = (string)preg_replace('/[\r\n\t]+|%0a|%0d/i', ' ', $v);
    return cut(trim($v), $max);
}

function storeDir(): string
{
    return rtrim(sys_get_temp_dir(), '/\\') . DIRECTORY_SEPARATOR;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, 'This address only accepts form submissions.', 405);
}

// 1. Honeypot: quietly "succeed" so bots do not retry
if (trim((string)($_POST['website'] ?? '')) !== '') {
    respond(true);
}

// 2. Time check. The page's script adds "elapsed"; without it, JavaScript was off or this is a bot.
if (!isset($_POST['elapsed'])) {
    respond(false, 'Please call us on 020 3026 3706 or email info@amihomecare.com.', 400);
}
if ((int)$_POST['elapsed'] < MIN_SECONDS) {
    respond(true);
}

// 3. Same-site check
$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '') {
    $strip = function (string $h): string { return (string)preg_replace('/^www\./', '', strtolower($h)); };
    $originHost = (string)parse_url($origin, PHP_URL_HOST);
    $siteHost = (string)preg_replace('/:\d+$/', '', (string)($_SERVER['HTTP_HOST'] ?? ''));
    if ($strip($originHost) !== $strip($siteHost)) {
        respond(false, 'Invalid request.', 403);
    }
}

// 4. Rate limit
$ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$rateFile = storeDir() . 'ami_rl_' . hash('sha256', $ip);
$now = time();
$hits = [];
if (is_file($rateFile)) {
    $hits = array_values(array_filter(array_map('intval', explode(',', (string)@file_get_contents($rateFile))), function ($t) use ($now) {
        return $t > $now - 3600;
    }));
}
if (count($hits) >= MAX_PER_HOUR) {
    respond(false, 'You have sent several messages recently. Please call us on 020 3026 3706 instead.', 429);
}

// ---- Read and check the fields ------------------------------------------------
$type     = (($_POST['form_type'] ?? '') === 'application') ? 'application' : 'enquiry';
$name     = field('name', 100);
$email    = field('email', 150);
$phone    = field('phone', 30);
$postcode = strtoupper(field('postcode', 10));
$careKey  = field('care', 40);
$methodKey = field('method', 10);
$role     = field('role', 40);
$message  = cut(trim(strip_tags((string)($_POST['message'] ?? ''))), 3000);
$consent  = !empty($_POST['consent']);
$phoneDigits = (string)preg_replace('/[^\d+]/', '', $phone);

$errors = [];
if (strlen($name) < 2) $errors[] = 'name';
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if ($phone !== '' && !preg_match('/^(\+44|0)\d{9,10}$/', $phoneDigits)) $errors[] = 'phone';
if (!$consent) $errors[] = 'consent';
if ($type === 'application') {
    if ($email === '') $errors[] = 'email';
    if ($phone === '') $errors[] = 'phone';
    if (!in_array($role, ROLES, true)) $errors[] = 'role';
} else {
    if ($email === '' && $phone === '') $errors[] = 'contact';
    if ($postcode !== '' && !preg_match('/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/', $postcode)) $errors[] = 'postcode';
    if ($careKey !== '' && !isset(CARE_TYPES[$careKey])) $errors[] = 'care';
    if ($methodKey !== '' && !isset(METHODS[$methodKey])) $errors[] = 'method';
}
if ($errors) {
    respond(false, 'Some details are missing or incorrect. Please check the form and try again.', 422);
}

// 6. Link filter
$linkPattern = '~https?://|www\.|\[url~i';
if (preg_match($linkPattern, $name) || preg_match_all($linkPattern, $message) > MAX_LINKS) {
    respond(false, 'Please remove web links from your message and try again.', 422);
}

// 5. Duplicate check
$fingerprint = hash('sha256', implode('|', [$type, strtolower($name), strtolower($email), $phoneDigits, $role, $careKey, $message]));
$dupFile = storeDir() . 'ami_dup_' . $fingerprint;
if (is_file($dupFile) && (int)@file_get_contents($dupFile) > $now - DUPLICATE_WINDOW) {
    respond(true);
}

// ---- Build and send the email ---------------------------------------------------
$careLabel   = $careKey !== '' ? CARE_TYPES[$careKey] : 'Not stated';
$methodLabel = $methodKey !== '' ? METHODS[$methodKey] : 'Not stated';
if ($type === 'application') {
    $subject = "Job application: {$role} – {$name}";
    $lines = [
        'New job application from the website',
        str_repeat('-', 44),
        "Name:   {$name}",
        "Role:   {$role}",
        "Phone:  {$phone}",
        "Email:  {$email}",
    ];
} else {
    $subject = "Care enquiry: {$careLabel} – {$name}";
    $lines = [
        'New care enquiry from the website',
        str_repeat('-', 44),
        "Name:               {$name}",
        "Phone:              " . ($phone !== '' ? $phone : 'Not given'),
        "Email:              " . ($email !== '' ? $email : 'Not given'),
        "Postcode:           " . ($postcode !== '' ? $postcode : 'Not given'),
        "Type of care:       {$careLabel}",
        "Preferred contact:  {$methodLabel}",
    ];
}
$lines[] = '';
$lines[] = $type === 'application' ? 'Experience and availability:' : 'Message:';
$lines[] = $message !== '' ? $message : '(none)';
$lines[] = '';
$lines[] = str_repeat('-', 44);
$lines[] = 'Consent to use these details to reply: Yes';
$lines[] = 'Sent: ' . date('d/m/Y H:i');
if ($email !== '') {
    $lines[] = 'Reply to this email to answer the sender directly.';
}
$body = implode("\r\n", $lines);

$headers = [
    'From: Ami Home Care Website <' . FROM_EMAIL . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: AmiHomeCareWebsite',
];
if ($email !== '') {
    $headers[] = 'Reply-To: ' . $email;
}

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
// one.com's PHP rejects the optional fifth mail() argument, so it is not used.
// The From header above (an address on this domain) is enough for one.com to deliver the message.
try {
    $sent = @mail(TO_EMAIL, $encodedSubject, $body, implode("\r\n", $headers));
} catch (\Throwable $e) {
    $sent = false;
}
if (!$sent) {
    respond(false, 'Please call us on 020 3026 3706 or email info@amihomecare.com.', 500);
}

// Record this message for the rate limit and duplicate check
$hits[] = $now;
@file_put_contents($rateFile, implode(',', $hits), LOCK_EX);
@file_put_contents($dupFile, (string)$now, LOCK_EX);

respond(true);
