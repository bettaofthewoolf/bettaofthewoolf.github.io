<?php
	header('Access-Control-Allow-Origin: *');
	date_default_timezone_set('UTC');
	$hour3 = 3 * 60 * 60;
	echo date("U\r\nd\r\nm", date('').time() + $hour3);
	echo "\r\n";
	echo strtotime('today midnight', date('').time() + $hour3);
?>