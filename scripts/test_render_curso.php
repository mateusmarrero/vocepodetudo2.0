<?php
$_GET['id'] = 'usp-coursera-ciencia-computacao-python';
ob_start();
include __DIR__ . '/../curso.php';
$out = ob_get_clean();

echo "Rendered bytes: " . strlen($out) . "\n";
echo "Title check: " . (strpos($out, 'Introdução à Ciência da Computação') !== false ? 'OK' : 'FAIL') . "\n";
echo "Course Schema.org check: " . (strpos($out, '"@type": "Course"') !== false ? 'OK' : 'FAIL') . "\n";
echo "BreadcrumbList check: " . (strpos($out, '"@type": "BreadcrumbList"') !== false ? 'OK' : 'FAIL') . "\n";
echo "Canonical link check: " . (strpos($out, 'rel="canonical" href="https://vocepodetudo.com/curso/usp-coursera-ciencia-computacao-python"') !== false ? 'OK' : 'FAIL') . "\n";
echo "Cover image check: " . (strpos($out, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5') !== false ? 'OK' : 'FAIL') . "\n";
echo "Related courses check: " . (strpos($out, 'Cursos Relacionados Recomendados') !== false ? 'OK' : 'FAIL') . "\n";
