const express = require('express');
const handleDB = require('../db/handleDB')
const common = require('../utils/common')
const constant = require('../utils/constant')
const md5 = require('md5')
const keys = require('../keys')
const multer = require('multer')

const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //指定文件存储路径。、
        cb(null, 'public/news/upload/avatar');
    },
    filename: function (req, file, cb) {
        console.log("-----------------------", file)
        //获取后缀名。
        let exts = file.originalname.split(".");
        let ext = exts[exts.length - 1];
        let tepname = (new Date()).getTime()+parseInt(Math.random()*9999);
        //拼接名字
        console.log("-----------------------", `${tepname}.${ext}`)
        cb(null, `${tepname}.${ext}`);
    }
})
const upload = multer({storage: storage})      //上传的头像存放地址。。

router.get('/profile', (req, res) => {
    (async function(){

        let userInfo = await common.getUserInfo(req, res);

         let data = {    //把用户信息传递到模板。。
            user_info: {
                nick_name: userInfo[0].nick_name,
                avatar_url: userInfo[0].avatar_url? (constant.AVATAR_URL_PRE + userInfo[0].avatar_url): "/news/images/worm.jpg",
            }
         }
        res.render('news/user', data)
    })()
})

//基本信息页面，及修改时的提交接口。
router.all('/user/base_info', (req, res) => {
    (async function(){

        let userInfo = await common.getUserInfo(req, res);

        if (req.method === 'GET') {
            
            let data = {    //把用户信息传递到模板。。
                nick_name: userInfo[0].nick_name,
                signature: userInfo[0].signature,
                gender: userInfo[0].gender?userInfo[0].gender:"MAN"
            }
            res.render('news/user_base_info', data)
        } else if (req.method === "POST"){
            //1、获取参数判空、
            let {signature, nick_name, gender} = req.body;
            if (!signature || !nick_name || !gender) {
                res.send({errmsg: "参数错误！"})
                return
            }
            //2、修改数据库中的用户数据。
            await handleDB(res, "info_user", "update", "数据库更改出错！", `id=${userInfo[0].id}`, {signature, nick_name, gender})
            //3、返回操作成功。
            res.send({errno: "0", errmsg:"修改成功！"})
        }


    })()
})

// 修改密码页面，及修改时的提交接口。
router.all('/user/pass_info', (req, res) => {
    (async function(){

        let userInfo = await common.getUserInfo(req, res);

        if (req.method === 'GET') {
            res.render('news/user_pass_info')
        } else if (req.method === "POST"){
            //1、获取参数判空(一个旧密码，两个新密码)、
            let {old_password, new_password, new_password2} = req.body;
            if (!old_password || !new_password || !new_password2) {
                res.send({errmsg: "参数错误！"})
                return
            }
            //2、校验两次新密码是否一致。。
            if (new_password !== new_password2) {
                res.send({errmsg: "两次密码不一致！"})
                return
            }
            //3、校验旧密码是否正确。
            if (md5(md5(old_password)+keys.password_salt) !== userInfo[0].password_hash) {
                res.send({errmsg: "旧密码不正确，修改失败！"})
                return
            }
            // 4、修改用户表里的password_hash
            await handleDB(res, "info_user", "update", "数据库更新出错！", `id=${userInfo[0].id}`, {password_hash: md5(md5(new_password)+keys.password_salt)})
            //5、返回操作成功。
            res.send({errno: "0", errmsg:"修改成功！"})
        }


    })()
})

// 修改头像页面显示接口。
router.get('/user/pic_info', (req, res) => {
    (async function(){
        let userInfo = await common.getUserInfo(req, res);
        let data = {    //把用户信息传递到模板。。
            user_info: {
                avatar_url: userInfo[0].avatar_url? (constant.AVATAR_URL_PRE + userInfo[0].avatar_url): "/news/images/worm.jpg",
            }
         }
        res.render('news/user_pic_info', data)
    })()
})
// 修改头像修改时的提交保存接口。
router.post('/user/pic_info', upload.single("avatar"), (req, res) => {
    (async function(){
        let userInfo = await common.getUserInfo(req, res);
        console.log("图片上传信息：-----------------------", req.file);      //获取本次上传图片的一些信息。
        // res.send(req.file);

        //1、接收上传图片的对象req.file
        // 2、上传图片到云服务器。
        // 3、把云服务器返回的对象的key属性（图片链接地址）保存到数据库。
        // 4、返回上传成功。（其它接口就能从数据库获取到图片链接地址，传给前端）
        if (req.file) {
            let {size,mimetype} = req.file;
            let types = ['jpeg','jpg','png','gif'];//允许上传的类型
            let tmpType = mimetype.split('/')[1];
    
            if(size > 5000000){
                res.send({err: -1, msg: '上传的图片过大！'})
            }else if(types.indexOf(tmpType) == -1){
                res.send({err: -2, msg: '上传的图片格式错误！'})
            }else{
                // 存入对应的数据库字段中。。
                await handleDB(res, "info_user", "update", "数据库修改失败！", `id=${userInfo[0].id}`, {avatar_url: req.file.filename})
    
                //返回上传成功。
                let data = {
                    avatar_url: constant.AVATAR_URL_PRE + req.file.filename
                }
                res.send({errno: "0", errmsg: "上传成功！", data});
            }
        } else {
            res.send({errno: "-1", errmsg: "请选择文件！"});
        }
    })();
})

// 我的收藏页面显示接口。
router.get('/user/collections', (req, res) => {
    (async function(){
        let userInfo = await common.getUserInfo(req, res);
        let data = {    //把用户信息传递到模板。。
            user_info: {
                avatar_url: userInfo[0].avatar_url? (constant.AVATAR_URL_PRE + userInfo[0].avatar_url): "/news/images/worm.jpg",
            }
         }
        res.render('news/user_collection', data)
    })()
})
module.exports = router