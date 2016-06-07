<?php
	date_default_timezone_set('UTC');
	echo date('').time() * 1000;
	echo "\r\n";
	echo strtotime('today midnight') * 1000 - 3 * 60 * 60 * 1000;
	echo "\r\n";
	echo date('m');
	echo "\r\n";
	echo date('d');
?>