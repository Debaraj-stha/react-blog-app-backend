
const ActivitySchema = require("./Schema/ActivitySchema")
const AuthorSchema = require("./Schema/AuthorSchema")
const BlogReadSchema = require("./Schema/BlogReadSchema")
const BlogSchema = require("./Schema/BlogSchema")
const ContactSchema=require("./Schema/ContactSchema")
const FeedbackSchema = require("./Schema/FeedbackSchema")
const RoleAssignmentSchema = require("./Schema/RoleSchema")
const SubscriberSchema = require("./Schema/SubscriberSchema")
const UserSchema = require("./Schema/UserSchema")

const Model=require("mongoose").model

const BlogModel=new Model('blogs',BlogSchema)
const ContactModel=new Model("contacts",ContactSchema)
const RoleAssignmentModel=new Model("roles",RoleAssignmentSchema)
const AuthorModel=new Model("Authors",AuthorSchema)
const FeedbackModel=new Model("Feedbacks",FeedbackSchema)
const BlogReadModel=new Model("BlogRead",BlogReadSchema)
const UserModel=new Model("User",UserSchema)
const SubscriberModel = new Model("Subscriber",SubscriberSchema);
const ActivityModel=new Model("Activity",ActivitySchema)


module.exports={
    BlogModel,
    ContactModel,
    RoleAssignmentModel,
    AuthorModel,
    FeedbackModel,
    BlogReadModel,
    UserModel,
    SubscriberModel,
    ActivityModel
}