/**
 * Created by liuyiman on 2017/7/27.
 */

// 在这里开始使用环境变量

var host
// @if HOST_ENV='test'
host = 'testhost'
// @endif
// @if HOST_ENV='qa'
host = 'qahost'
// @endif