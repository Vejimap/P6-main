// Imports
const Sauce = require('../models/sauce.js');
const fs = require('fs');

// Create a sauce
module.exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject.userId;
    const sauce = new Sauce({
       ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    // Save the new sauce to the MongoDB database
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce save' }))
        .catch(error => res.status(403).json({ error }));
};

// Modify a sauce
module.exports.modifySauce = (req, res, next) => {
    if (req.file) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                console.log(sauce.imageUrl);
                fs.unlinkSync('images/' + filename);
            })
            .catch((error) => {
                res.status(400).json({ error: error });
            })
    };
    const sauceObj = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }
        : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObj, _id: req.params.id })
        .then(() => {
            res.status(200).json({ message: 'Sauce updated successfully!' });
        })
        .catch((error) => {
            res.status(400).json({ error: error });
        });
};

// Delete a sauce
module.exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: 'Unauthorized action' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce delete' }))
                        .catch(error => res.status(400).json({ error }));
                });
            };
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

// Get a single sauce
module.exports.displaySingleSauce = (req, res, next) => {
    // req.params.id in order to handle id from url
    Sauce.findOne({ _id: req.params.id }) 
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

//Get all sauces
module.exports.displayAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

module.exports.likeSauces = (req, res, next) => {
    const like = req.body.like;
    const userId = req.auth.userId;

    switch (like) {
        case 1:
            console.log({ State: "Liked", like });
            Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    if (!sauce.usersLiked.find(userLike => userLike === userId) && !sauce.usersDisliked.find(userLike => userLike === userId)) {
                        Sauce.updateOne({ _id: req.params.id }, { $push: { usersLiked: userId }, $inc: { likes: +1 } })
                            .then(() => { res.status(200).json({ message: "Sauce like" }) })
                            .catch(error => res.status(403).json({ error }));
                    } else {
                        return res.status(409).json({ error: `Sauce already liked` })
                    };
                })
                .catch(error => res.status(400).json({ error }));
            break;
        case -1:
            console.log({ State: "Disliked", like });
            Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    if (!sauce.usersDisliked.find(userLike => userLike === userId) && !sauce.usersLiked.find(userLike => userLike === userId)) {
                        Sauce.updateOne({ _id: req.params.id }, { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } })
                            .then(() => { res.status(200).json({ message: "Sauce dislike" }) })
                            .catch(error => res.status(403).json({ error }));
                    } else {
                        return res.status(409).json({ error: `Sauce already disliked` })
                    };
                })
                .catch(error => res.status(400).json({ error }));
            break;
        case 0:
            console.log({ State: "Unliked/Undisliked", like });
            Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    if (sauce.usersLiked.find(userLike => userLike === userId)) {
                        Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: userId }, $inc: { likes: -1 } })
                            .then(() => { res.status(200).json({ message: "Like removed" }) })
                            .catch(error => res.status(403).json({ error }));
                    } else if (sauce.usersDisliked.find(userDislike => userDislike === userId)) {
                        Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } })
                            .then(() => { res.status(200).json({ message: "Dislike removed" }) })
                            .catch(error => res.status(403).json({ error }));
                    } else if (!sauce.usersLiked.find(userLike => userLike === userId) && !sauce.usersDisliked.find(userDislike => userDislike === userId)) {
                        console.log({ State: "already removed", like });
                        return res.status(409).json({ error: `the like/dislike is already removed` })
                    } else {
                        return res.status(400).json({ error })
                    }
                })
                .catch(error => res.status(400).json({ error }));
            break;
        default:
            console.error();
    };
};