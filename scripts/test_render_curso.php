<?php
$_GET['id'] = 'usp-coursera-ciencia-computacao-python';
ob_start();
include __DIR__ . '/../curso.php';
$out = ob_get_clean();

echo "Rendered bytes: " . strlen($out) . "\n";
echo "Title check: " . (strpos($out, 'Introdução à Ciência da Computação com Python') !== false ? 'OK' : 'FAIL') . "\n";
echo "Course Schema.org: " . (strpos($out, '"@type": "Course"') !== false ? 'OK' : 'FAIL') . "\n";
echo "BreadcrumbList Schema.org: " . (strpos($out, '"@type": "BreadcrumbList"') !== false ? 'OK' : 'FAIL') . "\n";
echo "FAQPage Schema.org: " . (strpos($out, '"@type": "FAQPage"') !== false ? 'OK' : 'FAIL') . "\n";
echo "Learning Outcomes check: " . (strpos($out, 'O Que Você Vai Aprender na Prática') !== false ? 'OK' : 'FAIL') . "\n";
echo "Syllabus check: " . (strpos($out, 'Ementa Curricular Completa') !== false ? 'OK' : 'FAIL') . "\n";
echo "Methodology check: " . (strpos($out, 'Metodologia & Avaliação') !== false ? 'OK' : 'FAIL') . "\n";
echo "Legal Basis check: " . (strpos($out, 'Validade Legal do Certificado') !== false ? 'OK' : 'FAIL') . "\n";
echo "ATS Tips check: " . (strpos($out, 'Como Destacar Este Curso no seu Currículo') !== false ? 'OK' : 'FAIL') . "\n";
echo "Official Enrollment Button with URL: " . (strpos($out, 'https://www.coursera.org/learn/ciencia-computacao-python-conceitos') !== false ? 'OK' : 'FAIL') . "\n";
echo "Related courses: " . (strpos($out, 'Cursos Relacionados Recomendados') !== false ? 'OK' : 'FAIL') . "\n";
