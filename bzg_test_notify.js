// bzg_test_notify.js —— 最小测试：只要被 QX 调用就弹一条通知。
// 用于判断 QX 能否正常跑脚本 + 弹通知。与 token 抓取无关。
$notification.post('BZG·TEST', '脚本已执行', '如果你看到这条，说明 QX 能跑脚本并弹通知');
$done({});
