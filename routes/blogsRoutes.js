const express = require("express");
const middleware = require("../middleware/auth");
const router = express.Router();
const Blogs = require("../models/blogs");
const { default: mongoose } = require("mongoose");


router.post("/create", middleware, async (req, res) => {
    try {
        // Assuming the user information is available in the request
        // const { username, title, content, category, date } = req.body;
        // console.log(req.name)
        const userId = req.userId;

        // Create a new blog using the Blogs model
        const newBlog = await Blogs.create({
            ...req.body, date: new Date().toISOString(), creater: userId
        });

        return res.status(200).json({ msg: "Blog Created", blog: newBlog });
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json("Internal Server Error");
    }
});

router.get("/", middleware, async (req, res) => {
    try {
        const allBlogs = await Blogs.find({})

        return res.status(200).json(allBlogs);
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json("Internal Server Error");
    }
});

router.get("/search", async (req, res) => {
    try {
        const { title } = req.query;

        if (!title) {
            return res.status(400).json({ message: "Title parameter is required for search." });
        }

        const matchingBlogs = await Blogs.find({ title: { $regex: title, $options: 'i' } });

        return res.status(200).json(matchingBlogs);
    } catch (error) {
        console.error("Error searching for blogs:", error);
        res.status(500).json("Internal Server Error");
    }
});

router.get("/category", async (req, res) => {
    try {
        const { category } = req.query;

        if (!category) {
            return res.status(400).json({ message: "Title parameter is required for search." });
        }

        const matchingBlogs = await Blogs.find({ category: { $regex: category, $options: 'i' } });

        return res.status(200).json(matchingBlogs);
    } catch (error) {
        console.error("Error searching for blogs:", error);
        res.status(500).json("Internal Server Error");
    }
});

router.get("/date", async (req, res) => {
    try {
        const { sort, order } = req.query;

        // Check if sort parameter is provided
        if (!sort) {
            return res.status(400).json({ message: "Sort parameter is required for date-based sorting." });
        }

        // Set the default order to ascending if not provided
        const sortOrder = order && order.toLowerCase() === 'desc' ? -1 : 1;

        const sortedBlogs = await Blogs.find({}).sort({ date: sortOrder });

        return res.status(200).json(sortedBlogs);
    } catch (error) {
        console.error("Error sorting blogs by date:", error);
        res.status(500).json("Internal Server Error");
    }
});

router.patch("/update/:id", middleware, async (req, res) => {
    try {
        // Find the blog by ID
        const blog = await Blogs.findById(req.params.id);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ message: "Blog not found." });
        }
        // console.log(blog.creater.toString(),req.userId);

        // // Check if the requesting user is the creator of the blog
        if (blog.creater.toString() !== req.userId) {
            return res.status(403).json({ message: "Unauthorized - You are not the creator of this blog." });
        }

        // // Update the blog with the data from the request body
        const updatedBlog = await Blogs.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Send the updated blog as the response
        res.status(200).json(updatedBlog);
    } catch (error) {
        console.error("Error updating blog:", error);
        res.status(500).json("Internal Server Error");
    }
});

router.delete("/delete/:id", middleware, async (req, res) => {
    try {
        // Find the blog by ID
        const blog = await Blogs.findById(req.params.id);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ message: "Blog not found." });
        }
        // console.log(blog.creater.toString(),req.userId);

        // // Check if the requesting user is the creator of the blog
        if (blog.creater.toString() !== req.userId) {
            return res.status(403).json({ message: "Unauthorized - You are not the creator of this blog." });
        }

        // // Update the blog with the data from the request body
        const updatedBlog = await Blogs.findByIdAndDelete(req.params.id, { new: true });

        // Send the updated blog as the response
        res.status(200).json("blog deleted");
    } catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json("Internal Server Error");
    }
});

router.patch("/:id/like", middleware, async (req, res) => {
    try {
        // Find the blog by ID
        const blog = await Blogs.findById(req.params.id);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ message: "Blog not found." });
        }

        // console.log(blog.likes)
        blog.likes.push(req.userId)
        // const likedBlogIds = blog.likes.map(ele => ele.toString())


        // // Update the blog with the data from the request body
        const likedBlog = await blog.save();

        // // Send the updated blog as the response
        res.status(200).json(likedBlog);
    } catch (error) {
        console.error("Error updating blog:", error);
        res.status(500).json("Internal Server Error");
    }
});

router.patch("/:id/dislike", middleware, async (req, res) => {
    try {
        // Find the blog by ID
        const blog = await Blogs.findById(req.params.id);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ message: "Blog not found." });
        }

        // Map the likes array to an array of string representations of ObjectId
        const dislikedBlogIds = blog.likes.map(ele => ele.toString());

        // Filter out the current user's ID
        const filteredBlogs = dislikedBlogIds.filter(ele => ele !== req.userId);

        // Update the blog with the filtered likes array
        const updatedBlog = await Blogs.findByIdAndUpdate(
            req.params.id,
            { likes: filteredBlogs },
            { new: true }
        );

        // Send the updated blog as the response
        res.status(200).json(updatedBlog);

    } catch (error) {
        console.error("Error updating blog:", error);
        res.status(500).json("Internal Server Error");
    }
});



router.put("/:id/comment", middleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const { userId } = req;

        // console.log(comment, req.name)

        // Check if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid blog ID." });
        }

        // Find the blog by ID
        const blog = await Blogs.findById(id);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ message: "Blog not found." });
        }

        // Add the user's comment to the comments array
        blog.comments.push({ commentor: userId, username: req.name, content: comment });

        // Save the updated blog
        const commentedBlog = await Blogs.findByIdAndUpdate(req.params.id, blog, { new: true })

        // Send the updated blog as the response
        res.status(200).json(commentedBlog);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json("Internal Server Error");
    }
});


module.exports = router;
