function getTimeCorrectURL()
{
	return "utc_time.php";
}

function getEndUrl()
{
	return "end.html";
}

function getNextUrl(passKey)
{
	return "room.html" + "?passKey=" + passKey;
}

function getTimerCircleSizeRatio(passKey)
{
	return 0.45; // 0 to 1 (1 is 100% 0.5 is 50%, etc...);
}