<?php
/**
 * Instalador e Semeador de Banco de Dados desativado permanentemente por segurança.
 * A estrutura do banco de dados já está provisionada em produção.
 *
 * Portal Você Pode Tudo
 */

http_response_code(404);
header('Content-Type: text/plain; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
echo "Página não encontrada.";
exit;
