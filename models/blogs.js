const { default: mongoose } = require("mongoose");
const User = require("../models/userModel")

const BlogsSchema = new mongoose.Schema({
    username: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ["Business", "Tech", "Lifestyle", "Entertainment"], required: true },
    date: { type: String, default: () => new Date() },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
        {
            commentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            username: { type: String, required: true },
            content: { type: String, required: true }
        }
    ],
    creater: { type: String, required: true }
});

const Blogs = mongoose.model("Blogs", BlogsSchema);

module.exports = Blogs;


// {
//     "username": "author",
//     "title": "Sample Blog",
//     "content": "This is a sample blog post.",
//     "category": "Business",
//     "date": "2023-11-24",
//     "likes": [],
//     "comments":[]
// }