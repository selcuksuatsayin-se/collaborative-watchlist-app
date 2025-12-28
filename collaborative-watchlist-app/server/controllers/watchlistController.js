const Watchlist = require("../models/Watchlist");
const User = require("../models/User");

exports.createWatchlist = async (req, res) => {
  try {
    const { title } = req.body;
    const newList = new Watchlist({
      creator: req.user.id,
      title: title,
      collaborators: [],
      movies: []
    });
    await newList.save();
    res.status(201).json(newList);
  } catch (error) {
    res.status(500).json({ message: "List could not be created." });
  }
};

exports.inviteUserToWatchlist = async (req, res) => {
  try {
    const { watchlistId } = req.params;
    const { email } = req.body;

    const watchlist = await Watchlist.findById(watchlistId);
    if (!watchlist) return res.status(404).json({ message: "List cannot find." });

    if (watchlist.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the list owner can send invites." });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) return res.status(404).json({ message: "User not found." });
    if (watchlist.collaborators.includes(userToInvite._id)) {
      return res.status(400).json({ message: "User is already a collaborator." });
    }

    if (watchlist.pendingInvites.includes(userToInvite._id)) {
      return res.status(400).json({ message: "There is already a pending invite." });
    }

    watchlist.pendingInvites.push(userToInvite._id);
    await watchlist.save();

    res.status(200).json({ message: "Invite sent, awaiting confirmation." });
  } catch (error) {
    res.status(500).json({ message: "Invite process failed." });
  }
};


exports.getPendingInvites = async (req, res) => {
  try {
    const invites = await Watchlist.find({ pendingInvites: req.user.id })
      .populate("creator", "username email")
      .select("title creator");

    res.status(200).json(invites);
  } catch (error) {
    res.status(500).json({ message: "Invites could not be retrieved." });
  }
};

exports.respondToInvite = async (req, res) => {
  try {
    const { watchlistId } = req.params;
    const { action } = req.body;

    const watchlist = await Watchlist.findById(watchlistId);
    if (!watchlist) return res.status(404).json({ message: "Couln't find the watchlist." });

    if (!watchlist.pendingInvites.includes(req.user.id)) {
      return res.status(400).json({ message: "You don't have an invite for this watchlist." });
    }

    if (action === "accept") {
      watchlist.pendingInvites = watchlist.pendingInvites.filter(id => id.toString() !== req.user.id);
      watchlist.collaborators.push(req.user.id);
      await watchlist.save();
      return res.status(200).json({ message: "Invite accepted!", watchlist });
    } 
    
    if (action === "decline") {
      watchlist.pendingInvites = watchlist.pendingInvites.filter(id => id.toString() !== req.user.id);
      await watchlist.save();
      return res.status(200).json({ message: "Invite declined." });
    }

    res.status(400).json({ message: "Invalid action." });
  } catch (error) {
    res.status(500).json({ message: "Process failed." });
  }
};

exports.getMyWatchlists = async (req, res) => {
  try {
    const lists = await Watchlist.find({
      $or: [
        { creator: req.user.id },
        { collaborators: req.user.id }
      ]
    })
    .populate("creator", "username")
    .populate("collaborators", "username")
    .sort({ createdAt: -1 });

    res.status(200).json(lists);
  } catch (error) {
    res.status(500).json({ message: "Lists could not be retrieved." });
  }
};

exports.addMovieToWatchlist = async (req, res) => {
  try {
    const { watchlistId } = req.params;
    const { tmdbId, title, posterPath } = req.body;

    const watchlist = await Watchlist.findById(watchlistId);
    if (!watchlist) return res.status(404).json({ message: "Couln't find the watchlist." });

    const isCreator = watchlist.creator.toString() === req.user.id;
    const isCollaborator = watchlist.collaborators.includes(req.user.id);

    if (!isCreator && !isCollaborator) {
      return res.status(403).json({ message: "Don't have permission to add movie to this watchlist." });
    }

    const isExists = watchlist.movies.find(movie => movie.tmdbId === tmdbId.toString());
    if (isExists) return res.status(400).json({ message: "Movie already exists in the watchlist." });
    watchlist.movies.push({ 
      tmdbId, 
      title, 
      posterPath,
      addedBy: req.user.id 
    });
    
    await watchlist.save();
    res.status(200).json(watchlist);
  } catch (error) {
    res.status(500).json({ message: "Error occurred while adding movie." });
  }
};

exports.removeMovieFromWatchlist = async (req, res) => {
  try {
    const { watchlistId, movieId } = req.params;

    const watchlist = await Watchlist.findById(watchlistId);
    if (!watchlist) return res.status(404).json({ message: "Couln't find the watchlist." });

    const isCreator = watchlist.creator.toString() === req.user.id;
    const isCollaborator = watchlist.collaborators.includes(req.user.id);

    if (!isCreator && !isCollaborator) {
      return res.status(403).json({ message: "Don't have permission to remove movie from this watchlist." });
    }

    watchlist.movies = watchlist.movies.filter(movie => movie.tmdbId !== movieId);
    await watchlist.save();

    res.status(200).json(watchlist);
  } catch (error) {
    res.status(500).json({ message: "Delete process failed." });
  }
};