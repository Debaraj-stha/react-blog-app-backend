const logActivity = require("../helper/activityLoager");
const { SubscriberModel, UserModel } = require("../models");

// Subscribe to an author
const subscribeToAuthor = async (req, res) => {
    try {
        const { author_id } = req.query;
        const { user_id } = req.body;
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        if (!author_id) {
            const existing = await SubscriberModel.findOne({ user_id });
            if (existing) {
                return res.status(409).json({ message: "Already subscribed" });
            }

        }
        // Prevent duplicate subscription
        const existing = await SubscriberModel.findOne({ author_id, user_id });
        if (existing) {
            return res.status(409).json({ message: "Already subscribed" });
        }
        //if not author id,subscribe to all authors
        if (!author_id) {
            await SubscriberModel.create({ author_id, user_id, isSubscribedToAll: true });
        }
        else {
            const newSub = await SubscriberModel.create({ author_id, user_id });
            console.log(newSub)
            await logActivity({
                type: 'NEW_SUBSCRIBER',
                author_id,
                message: `<span class="font-semibold text-blue-400">${newSub.name}</span> subscribed to your profile`
            })
            res.status(201).json({ message: "Subscribed successfully", subscription: newSub });
        }

    } catch (error) {
        console.log("error", error)
        res.status(500).json({ message: "Error subscribing", error: error.message });
    }
};

// Unsubscribe
const unsubscribeFromAuthor = async (req, res) => {
    try {
        const { author_id } = req.params;
        const { user_id, isSubscribedToAll } = req.body;

        const query = !isSubscribedToAll ? { author_id, user_id } : { user_id, isSubscribedToAll: true };
        const deleted = await SubscriberModel.findOneAndDelete(query);
        if (!deleted) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        if (!isSubscribedToAll) {
            const user = await UserModel.findById(user_id).select('name')
            await logActivity({
                type: "UNSUBSCRIBED",
                author_id,
                message: `<span class="font-semibold text-blue-400">${user.name}</span> has unsubscribed to you`,
            })
        }


        res.status(200).json({ message: "Unsubscribed successfully" });
    } catch (error) {
        res.status(500).json({ message: `Error unsubscribing ${error.message}`, error: error.message });
    }
};

// Get all subscribers of an author
const getSubscribers = async (req, res) => {
    try {
        const { author_id } = req.params;
        const subscribers = await SubscriberModel.find({ author_id }).populate("user_id", "name email profile").lean();
        const cleanedSubscriber = subscribers.map((subscriber) => {
            delete subscriber.user_id._id
            return {
                ...subscriber.user_id,
                subscribedSince: subscriber.createdAt
            }
        })
        res.status(200).json({ count: subscribers.length, subscribers: cleanedSubscriber });
    } catch (error) {
        res.status(500).json({ message: "Error fetching subscribers", error: error.message });
    }
};

// Check if a user is subscribed to an author
const isSubscribed = async (req, res) => {
    try {
        const { author_id, user_id } = req.query;
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Case 1: Subscribed to platform (no specific author)
        if (author_id === undefined) {
            const generalSubscription = await SubscriberModel.findOne({
                user_id,
                isSubscribedToAll: true,
            });

            const subscriberCount = await SubscriberModel.countDocuments({
                isSubscribedToAll: true,
            });

            return res.status(200).json({ hasSubscribed: !!generalSubscription, subscriberCount });
        }
        // Case 2: Subscribed to specific author
        const subscription = await SubscriberModel.findOne({
            author_id,
            user_id,
            isSubscribedToAll: false,
        });

        const subscriberCount = await SubscriberModel.countDocuments({
            author_id,
            isSubscribedToAll: false,
        });

        return res.status(200).json({ hasSubscribed: !!subscription, subscriberCount });

    } catch (error) {
        console.error("error", error);
        return res.status(500).json({ message: "Error checking subscription", error: error.message });
    }
};

const getAllSubscribers = async (req, res) => {
    try {
    
        const subscribers = await SubscriberModel.find({ }).populate("user_id", "name email profile").lean();
        const cleanedSubscriber = subscribers.map((subscriber) => {
            delete subscriber.user_id._id
            return {
                ...subscriber.user_id,
                subscribedSince: subscriber.createdAt
            }
        })
        res.status(200).json({ count: subscribers.length, subscribers: cleanedSubscriber });
    } catch (error) {
        res.status(500).json({ message: "Error fetching subscribers", error: error.message });
    }
};





module.exports = {
    subscribeToAuthor,
    unsubscribeFromAuthor,
    getSubscribers,
    getAllSubscribers,
    isSubscribed,

};
