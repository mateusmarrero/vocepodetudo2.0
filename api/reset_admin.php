<?php
/**
 * Ferramenta de Redefinição de Senha desativada permanentemente por segurança.
 * A alteração segura de credenciais deve ser realizada exclusivamente por
 * administradores autenticados via painel administrativo (api/auth.php?action=change_password).
 *
 * Portal Você Pode Tudo
 */

http_response_code(404);
header('Content-Type: text/plain; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
echo "Página não encontrada.";
exit;
