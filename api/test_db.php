<?php
/**
 * Ferramenta de Diagnóstico de Banco de Dados desativada permanentemente por segurança.
 *
 * Portal Você Pode Tudo
 */

http_response_code(404);
header('Content-Type: text/plain; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
echo "Página não encontrada.";
exit;
