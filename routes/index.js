var express = require('express');
var router = express.Router();
var path = require('path');
var upFile = require('filese');
var upload = upFile('public/uploads/'); //上传文件的 文件目录
var corsz = require('corsz');
corsz(router);

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'my-blog'
});
connection.connect();

// userInfo 默认数据
const ui = {
    name: '李鼟鼟',
    slogan: '这个人很懒，什么也没有写...',
    inform: '通知：2019.10.1 - 2019.10.7 将进行网站维护',
    avatar: 'http://localhost:3000/common/akinadeaava.jpg',
    bgImg: 'http://localhost:3000/common/centerBg.jpg'
};

// website 默认数据
const ws = {
    name: 'my-blog',
    icon: 'http://localhost:3000/common/hobbs.png',
    about: '关于'
};

// 图片地址拼接
const imgPath = (req, img) => `http://${req.headers.host}/${img}`;
// 删除图片地址拼接
const delPath = (req, img) =>
    'public/' + img.replace(`http://${req.headers.host}/`, '');

// 是否已经登录验证
router.post('/admin', function(req, res, next) {
    connection.query(
        `select * from admin where name='${req.body.user}'`,
        (e, r, f) => {
            if (e) throw error;
            if (r.length) {
                res.send('admin existed');
            } else {
                res.send('admin not found');
            }
        }
    );
});

// 管理员登录验证
router.post('/admin/login', function(req, res, next) {
    connection.query(
        `select * from admin where name='${req.body.user}' and pwd='${req.body.pwd}'`,
        (e, r, f) => {
            if (e) throw error;
            if (r.length) {
                res.send('login success');
            } else {
                res.send('login fail');
            }
        }
    );
});

// // 上传头像图片
// router.post('/admin/upload/avatar', upload.single('avatar'), function(
//     req,
//     res,
//     next
// ) {
//     if (req.file) {
//         let imgUrl = imgPath(req, req.file.rdestination);
//         connection.query(
//             `update userInfo set avatar='${imgUrl}' where id = 1`,
//             (e, r, f) => {
//                 if (e) throw error;
//                 // console.log(req.file);
//             }
//         );
//         res.send(imgUrl);
//     } else {
//         res.end('upload error');
//     }
// });

// // 上传背景图片
// router.post('/admin/upload/bg', upload.single('bg'), function(req, res, next) {
//     if (req.file) {
//         let imgUrl = imgPath(req, req.file.rdestination);
//         connection.query(
//             `update userInfo set bgImg='${imgUrl}' where id = 1`,
//             (e, r, f) => {
//                 if (e) throw error;
//                 // console.log(req.file);
//             }
//         );
//         res.send(imgUrl);
//     } else {
//         res.end('upload error');
//     }
// });

// 上传图片
router.post('/admin/uploadImg', upload.single('img'), function(req, res, next) {
    console.log('req.body.form :', req.body.form);
    console.log('req.body.name :', req.body.name);
    console.log('req.body.id :', req.body.id);

    if (req.file) {
        let imgUrl = imgPath(req, req.file.rdestination); // 获取图片url
        if (req.body.id == 'new') {
            connection.query(
                `insert into ${req.body.form} set ${req.body.name}='${imgUrl}'`,
                (e, r, f) => {
                    if (e) throw error;
                    res.send({ id: r.insertId, imgUrl });
                }
            );
        } else {
            connection.query(
                `select * from ${req.body.form} where id = ${req.body.id}`,
                (e, r, f) => {
                    if (e) throw error;
                    // console.log('r :', r[0][req.body.name]);
                    upload.deleteFile(delPath(req, r[0][req.body.name])); // 删除旧图片
                    connection.query(
                        `update ${req.body.form} set ${req.body.name}='${imgUrl}' where id = ${req.body.id}`,
                        (e, r, f) => {
                            if (e) throw error;
                            res.send({ id: req.body.id, imgUrl });
                        }
                    );
                }
            );
        }
    } else {
        res.send('upload img error');
    }
});

// 设置用户信息
router.post('/admin/setUserInfo', (req, res, next) => {
    connection.query(
        `   update userInfo set
            name='${req.body.name}',
            slogan='${req.body.slogan}',
            inform='${req.body.inform}',
            avatar='${req.body.avatar}',
            bgImg='${req.body.bgImg}'
            where id = 1`,
        (e, r, f) => {
            if (e) throw error;
            res.send('setUserInfo success');
        }
    );
});

// 获取用户信息数据
router.get('/admin/getUserInfo', (req, res, next) => {
    connection.query(`select * from userInfo where id = 1`, (e, r, f) => {
        if (e) throw error;
        if (r.length) {
            res.send(r[0]);
        } else {
            connection.query(`truncate table userInfo`, (e, r, f) => {
                if (e) throw error;
                connection.query(
                    `   insert into userInfo set 
                        name='${ui.name}', 
                        slogan='${ui.slogan}', 
                        inform='${ui.inform}', 
                        avatar='${ui.avatar}', 
                        bgImg='${ui.bgImg}'`,
                    (e, r, f) => {
                        if (e) throw error;
                        res.send(ui);
                    }
                );
            });
        }
    });
});

// 设置文章信息
router.post('/admin/setArticleItem', (req, res, next) => {
    console.log('itemId :', req.body.id);
    connection.query(
        `   update article set
            name='${req.body.name}',
            classify='${req.body.classify}',
            content='${req.body.content}',
            titleImg='${req.body.titleImg}',
            hot='${req.body.hot}',
            top='${req.body.top}',
            focus='${req.body.focus}',
            focusP='${req.body.focusP}'
            where id = ${req.body.id}`,
        (e, r, f) => {
            if (e) throw error;
            res.send('setArticleItem success');
        }
    );
});

// 获取文章列表
router.get('/admin/getArticleList', (req, res, next) => {
    connection.query(` select * from article`, (e, r, f) => {
        if (e) throw error;
        r.forEach(element => {
            element.createtime = new Date(element.createtime).toLocaleString();
        });
        res.send(r);
    });
});

// 获取文章列表
router.post('/admin/deleteArticleItem', (req, res, next) => {
    console.log('req.body.id :', req.body.id);
    console.log('req.body.id :', req.body.img);
    // console.log('删除图片 :', delPath(req, req.body.img));

    upload.deleteFile(delPath(req, req.body.img)); // 删除图片
    connection.query(
        `delete from article where id = ${req.body.id}`,
        (e, r, f) => {
            if (e) throw error;
            console.log('r :', r);
            res.send('delete success');
        }
    );
    // res.send();
});

// 获取网站基本信息
router.get('/admin/getWebsite', (req, res, next) => {
    connection.query(`select * from website where id = 1`, (e, r, f) => {
        if (e) throw error;
        if (r.length) {
            res.send(r[0]);
        } else {
            connection.query(`truncate table website`, (e, r, f) => {
                if (e) throw error;
                connection.query(
                    `   insert into website set 
                        name='${ws.name}', 
                        icon='${ws.icon}', 
                        about='${ws.about}'`,
                    (e, r, f) => {
                        if (e) throw error;
                        res.send(ws);
                    }
                );
            });
        }
    });
});

// 设置网站基本信息
router.post('/admin/setWebsite', (req, res, next) => {
    connection.query(
        `   update website set
            name='${req.body.name}', 
            icon='${req.body.icon}', 
            about='${req.body.about}'
            where id = 1`,
        (e, r, f) => {
            if (e) throw error;
            res.send('getWebsite success');
        }
    );
});

// 获取不同分类的文章列表
router.get('/admin/getClassify', (req, res, next) => {
    let sql;
    if (req.query.name) {
        sql = `select * from article where name like '%${req.query.name}%'`;
    } else {
        sql = `select * from article where classify = ${req.query.classify}`;
    }
    console.log('sql :', sql);
    connection.query(sql, (e, r, f) => {
        if (e) throw error;
        res.send(r);
    });
});

// 以名称获取文章列表
router.get('/admin/getArticleByName', (req, res, next) => {
    connection.query(
        `select * from article where name like '%${req.query.classify}%'`,
        (e, r, f) => {
            if (e) throw error;
            res.send(r);
        }
    );
});

module.exports = router;
