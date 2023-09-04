const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// get all posts
router.get('/', async (req, res) => {
    try {
        let perPage = 5;
        let page = req.query.page || 1;

        const data = await Post.aggregate([
            {
                $sort: { createdAt: -1 }
            }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const count = await Post.count();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        const locals = {
            title: "مدونة نظيفة",
            description: "مدونة نقية ونظيفة بمحتوى موجز وجماليات متقنة"
        }

        res.render("index",
            {
                locals,
                data,
                current: page,
                nextPage: hasNextPage ? nextPage : null
            });
    } catch (error) {
        console.log(error.message);
    }
});

// get post :id
router.get('/post/:id', async (req, res) => {
    try {
        const locals = {
            title: "NodeJs Blog",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        let slug = req.params.id;

        const data = await Post.findById({ _id: slug });

        res.render("post",
            {
                locals,
                data,
            });
    } catch (error) {
        console.log(error.message);
    }
});

// search term
router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "search",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        let searchTerm = req.body.searchInput;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { content: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
            ]
        });

        res.render("search",
            {
                locals,
                data,
            });
    } catch (error) {
        console.log(error.message);
    }
});

// function insertPostData() {
//     Post.insertMany([
//         {
//             title: "The Secrets of Quantum Computing",
//             content: "Exploring the mystical world of qubits and superposition in the quantum realm."
//         },
//         {
//             title: "The Art of Mindful Gardening",
//             content: "Discover the joy of nurturing your garden while finding inner peace."
//         },
//         {
//             title: "Adventures in Time Travel",
//             content: "Join us on a journey through history as we unravel the mysteries of time travel."
//         },
//         {
//             title: "The Culinary Wonders of Fusion Cuisine",
//             content: "Tantalize your taste buds with the exquisite blend of flavors from around the globe."
//         },
//         {
//             title: "Beyond the Stars: Exploring Exoplanets",
//             content: "Embark on an interstellar voyage to distant planets in search of extraterrestrial life."
//         },
//         {
//             title: "Unveiling the Magic of Origami",
//             content: "Witness the transformation of simple paper into intricate works of art."
//         },
//         {
//             title: "The Psychology of Dream Interpretation",
//             content: "Delve into the subconscious mind and decode the meanings behind your dreams."
//         },
//         {
//             title: "Eco-Friendly Living: Sustainable Choices",
//             content: "Learn how to reduce your carbon footprint and live a greener lifestyle."
//         }
//     ])
// }
// insertPostData();

// about page
router.get('/about', (req, res) => {
    res.render("about");
});

router.get('/contact', (req, res) => {
    res.render("contact");
});

// export router
module.exports = router;