const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = './../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// check login
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

router.get('/admin', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Dashboard",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        const data = await Post.aggregate([
            {
                $sort: { createdAt: -1 }
            }
        ]);

        res.render("admin/index",
            {
                locals,
                layout: adminLayout,
                data,

            });
    } catch (error) {
        console.log(error.message);
    }
});

// view login
router.get('/admin/login', async (req, res) => {
    try {
        const locals = {
            title: "Login",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        res.render("admin/login",
            {
                locals,
                layout: false
            });
    } catch (error) {
        console.log(error.message);
    }
});

router.get('/admin/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Create new post",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        res.render("admin/create-post",
            {
                locals,
                layout: adminLayout
            });
    } catch (error) {
        console.log(error.message);
    }
});

router.post('/admin/add-post', authMiddleware, async (req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            content: req.body.content
        });

        await Post.create(newPost);
        res.redirect('/admin');
    } catch (error) {
        console.log(error);
    }
});

router.get('/admin/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Edit new post",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        const post = await Post.findOne({ _id: req.params.id });

        res.render("admin/edit-post",
            {
                locals,
                layout: adminLayout,
                post
            });
    } catch (error) {
        console.log(error.message);
    }
});

router.put('/admin/edit-post/:id', authMiddleware, async (req, res) => {
    console.log(req.params.id);
    try {

        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            content: req.body.content,
            updateddAt: Date.now()
        });

        res.redirect(`/admin/edit-post/${req.params.id}`);

    } catch (error) {
        console.log(error);
    }

});

// view register
router.get('/admin/register', async (req, res) => {
    try {
        const locals = {
            title: "Register",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        res.render("admin/register",
            {
                locals,
                layout: false
            });
    } catch (error) {
        console.log(error.message);
    }
});

// admin login
router.post('/admin/login', async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/admin');

    } catch (error) {
        console.log(error.message);
    }
});

// admin register
router.post('/admin/register', async (req, res) => {
    try {

        const { email, password } = req.body;

        const hashePassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ email, password: hashePassword });
            res.status(201).json({ message: "User created successfully", user })
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: "User already registered" })
            }
            res.status(500).json({ message: "Internal server error" })
        }


        res.redirect("/admin");
    } catch (error) {
        console.log(error.message);
    }
});

router.delete('/admin/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/admin');
    } catch (error) {
        console.log(error);
    }
});

// logout
router.get('/admin/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// export router
module.exports = router;