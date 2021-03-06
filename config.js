const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const common = require('./utils/common')
//引入各种路由对象。。
const indexRouter = require('./routes/index')
const passportRouter = require('./routes/passport')
const detailRouter = require('./routes/detail')
const profileRouter = require('./routes/profile')
const keys = require('./keys')


// let appConfig = app => {       //以函数的方式调用。。

//     // 加载静态资源配置。。
//     app.use(express.static('public'))
//     // 模板配置。。
//     app.engine("html", require('express-art-template'))
//     app.set('view options', {
//         debug: process.env.NODE_ENV !== "development"
//     })
//     app.set('views', path.join(__dirname, 'views'));
//     app.set("view engine", 'html');
//     //获取 post 请求参数配置。
//     app.use(bodyParser.urlencoded({extended: false}));
//     app.use(bodyParser.json());
//     //注册cookie 和 session 。。
//     app.use(cookieParser());
//     app.use(cookieSession({
//         name: 'my_session',
//         keys: ["*^*%^%#$%@^&%(*&********%^&*%^"],
//         maxAge: 1000 * 60 * 60 * 24 * 2         //两天。。
//     }))
// }
// module.exports = appConfig;


class AppConfig{    //以面向对象的方式抽取。。推荐使用。
    //看成创建对象的时候执行的代码。。
    constructor(app){
        this.app = app;
        this.listenPort = 3003;

        // 加载静态资源配置。。
        this.app.use(express.static(path.join(__dirname, 'public')))

        // 模板配置。。
        this.app.engine("html", require('express-art-template'))
        this.app.set('view options', {
            debug: process.env.NODE_ENV !== "development"
        })
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set("view engine", 'html');

        //获取 post 请求参数配置。
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(bodyParser.json());

        //注册cookie 和 session 。。
        this.app.use(cookieParser());
        this.app.use(cookieSession({
            name: 'my_session',
            keys: [keys.session_key],
            maxAge: 1000 * 60 * 60 * 24 * 2         //两天。。
        }))

        //注册路由到 app 下。
        this.app.use(common.csrfProtect, indexRouter)
        this.app.use(common.csrfProtect, passportRouter)    //验证码路由。。
        this.app.use(common.csrfProtect, detailRouter)    //文章路由。。
        this.app.use(common.csrfProtect, profileRouter)    //个人中心路由。。


        //在上面所有接口都匹配不上请求路径的时候，执行下面这个函数里面的代码。。
        this.app.use((req, res) => {
           
            common.abort404(req, res);
        })
    }
}
module.exports = AppConfig;


// class AppConfig{    //以面向对象的方式抽取。。放入类的函数中。。调用
//     //看成创建对象的时候执行的代码。。
//     constructor(app){
//         this.app = app;
//     }

//     run() {
//         // 加载静态资源配置。。
//         this.app.use(express.static('public'))
//         // 模板配置。。
//         this.app.engine("html", require('express-art-template'))
//         this.app.set('view options', {
//             debug: process.env.NODE_ENV !== "development"
//         })
//         this.app.set('views', path.join(__dirname, 'views'));
//         this.app.set("view engine", 'html');
//         //获取 post 请求参数配置。
//         this.app.use(bodyParser.urlencoded({extended: false}));
//         this.app.use(bodyParser.json());
//         //注册cookie 和 session 。。
//         this.app.use(cookieParser());
//         this.app.use(cookieSession({
//             name: 'my_session',
//             keys: ["*^*%^%#$%@^&%(*&********%^&*%^"],
//             maxAge: 1000 * 60 * 60 * 24 * 2         //两天。。
//         }))
//     }
// }
// module.exports = AppConfig;
