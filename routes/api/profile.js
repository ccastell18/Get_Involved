const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load Profile Model
const Profile = require('../../models/Profile');
//Load User Profile Model
const User = require('../../models/User');

//@route   GET api/profile/test
//@desc    Tests profile route
//@access  public

//outputs json
//router.get('/test', (req, res) => res.json({ msg: 'Profiles works' }));

//@route   GET api/profile
//@desc    Get current user's profile
//@access  private
//jwt is the strategy from the config file.
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    //user refers to User model user object, which refers to the user id.
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //initialize errors
        const errors = {};
        if (!profile) {
          errors.noprofile = 'There is no profile for this user';
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route   GET api/profile
//@desc    Create or Edit user Profile
//@access  private
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    //get fields from profile model
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;

    //Skills - split into array
    if (typeof req.body.skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',');
    }
    //Social is an object filled with objects. Initiate the social object before making fields for individual social media and adding to social object.
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.handle) profileFields.handle = req.body.handle;

    //check for profile
    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //Update all fields and return the profile
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        //Create
        //Check if handle exists. Can't have duplicates.
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = 'That handle already exists';
            res.status(400).json(errors);
          }
          //Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

module.exports = router;
