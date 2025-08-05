const { getAuthorActivities } = require('../controller/ActivityController')
const { saveAuthor, getAuthors, updateAuthor, deleteAuthor, getAuthor, getBlogsWithAuthor, authorTotalBlogs, getAuthorBlogsFeedback, getScheduledDraftBlogs } = require('../controller/AuthorController')
const { getBlogs, saveBlog, updateBlog, deleteBlog,
    getBlog, searchBlogs, filterAndSortBlogs, getBlogTags, getTotalBlogsLength,
    getTotalBlogCounts, getCountsForAuthor, 
    getMostPopularBlogsByAuthor,
    handleBlogAction,
    blogsIcanEdit} = require('../controller/blogController')
const { saveContact, getContact, updateContact, deleteContact, getContacts } = require('../controller/contactController')
const { saveFeedback, getFeedback, getTotalFeedbackCount } = require('../controller/feedbackController')
const { subscribeToAuthor, unsubscribeFromAuthor, getSubscribers, isSubscribed, getAllSubscribers } = require('../controller/subscriberController')
const { saveUser,  getUserByAuthId, searchUsers, getUserId, deleteAccount } = require('../controller/UserController')

const Router = require('express').Router()
//contact routes
Router.post("/api/contact/", saveContact)
Router.get("/api/contacts/", getContacts)
Router.put("/api/contact/:id", updateContact)
Router.delete("/api/contact/:id", deleteContact)
Router.get("/api/contact/:id", getContact)

//blog routes
Router.post("/api/blog/", saveBlog)
Router.get("/api/blogs/", getBlogs)
Router.put("/api/blog/:id", updateBlog)
Router.delete("/api/blog/:author_id", deleteBlog)
Router.get("/api/blog/:id", getBlog)
Router.post("/api/blog/:author_id/:blog_id/:action_type", handleBlogAction);
Router.get("/api/blogs/can-edit/:user_id",blogsIcanEdit)

Router.get("/api/blogs/search", searchBlogs)
Router.get("/api/blogs/filterBy", filterAndSortBlogs)
Router.get("/api/blogs/tags", getBlogTags)
Router.get("/api/blogs/total", getTotalBlogsLength)
Router.get("/api/blogs/count", getTotalBlogCounts)
Router.get("/api/blogs/counts-for-author", getCountsForAuthor)
// Router.get("/api/blogs-by/author/:author_id",getBlogByAuthor)


//author routes
Router.post("/api/author/", saveAuthor)
Router.get("/api/authors/", getAuthors)
Router.put("/api/author/:author_id", updateAuthor)
Router.delete("/api/author/:author_id", deleteAuthor)
Router.get("/api/author/:author_id", getAuthor)
Router.get("/api/author/blogs/:author_id", getBlogsWithAuthor)
Router.get("/api/author/:author_id/totalBlogs/", authorTotalBlogs)
Router.get("/api/author/blogs/feedback/all",getAuthorBlogsFeedback)
Router.get("/api/author/blogs/published-draft-blogs/:author_id",getScheduledDraftBlogs)
Router.get("/api/authors/:author_id/popular-blogs", getMostPopularBlogsByAuthor);

//feedback routes
Router.post("/api/blog/feedback/", saveFeedback)
Router.get("/api/blog/feedback/:blog_id", getFeedback)
Router.get("/api/blog/feedback/:blog_id/count", getTotalFeedbackCount)

//user routes
Router.post('/api/user/', saveUser);
Router.get('/api/user/:authId', getUserByAuthId);
Router.get("/api/users/search/",searchUsers)
Router.get("/api/user/user-id/:author_id", getUserId);
Router.delete("/api/user/:user_id",deleteAccount)
//subscriber router
Router.post("/api/subscribe",subscribeToAuthor );
Router.delete("/api/unsubscribe/:author_id", unsubscribeFromAuthor);
Router.get("/api/subscribers/:author_id", getSubscribers);
Router.get("/api/subscription-status", isSubscribed);
Router.get("/api/allsubscribers/",getAllSubscribers)
//activity router
Router.get("/api/activities/:author_id", getAuthorActivities);

module.exports = Router
