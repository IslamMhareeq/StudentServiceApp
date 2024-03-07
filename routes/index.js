var express = require('express');
var router = express.Router();
var User = require('../models/user');
const jwt = require('jsonwebtoken');
const Post = require('../models/post');
const PostImage = require('../models/postImage');

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID = '705639256411-n2f9qumeospovv7tkhckbrm1siqtotf6.apps.googleusercontent.com'
const  CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04k4QfMw8tpmYCgYIARAAGAQSNwF-L9Ir5s4w5-8szpUblGkmJpPNMH43cV3znORTz2QloRXSk7cm9IJT0YhbHZcJNYh30ZiAiXg'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token:REFRESH_TOKEN})

const multer = require('multer');
const storage = multer.memoryStorage(); // Use memoryStorage
const upload = multer({ storage: storage, limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB file limit

const File = require('../models/file'); // Adjust the path as necessary
const fs = require('fs');








router.get('/', function (req, res, next) {
    return res.render('home.ejs');
})




router.get('/register', function (req, res, next) {
    return res.render('register.ejs');
});



router.post('/register', async function(req, res, next) {
    try {
        console.log(req.body);
        var personInfo = req.body;

        if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
            return res.status(400).send({"Error": "All fields are required"});
        }

        if (personInfo.password !== personInfo.passwordConf) {
            return res.status(400).send({"Error": "Passwords do not match"});
        }

        // Check if the email or username is already registered
        const existingEmail = await User.findOne({ email: personInfo.email });
        if (existingEmail) {
            return res.status(400).send({"Error": "Email is already used."});
        }

        const existingUsername = await User.findOne({ username: personInfo.username });
        if (existingUsername) {
            return res.status(400).send({"Error": "Username is already taken."});
        }

        // Create a new user instance
        const newUser = new User({
            email: personInfo.email,
            username: personInfo.username,
            password: personInfo.password,
            passwordConf: personInfo.passwordConf,
            role: personInfo.role,
        });

        // Save the new user to the database
        await newUser.save();

        return res.send({"Success": "You are registered, You can login now."});
    } catch (error) {
        // Handle any errors
        console.error(error);
        return res.status(500).send({"Error": "Error registering user"});
    }
});



router.get('/login', function (req, res, next) {
    // Render the login.ejs view file
    return res.render('login.ejs');
});





router.post('/login', async function (req, res, next) {
    try {
        var email = req.body.email;
        var password = req.body.password;

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.json({ loginSuccess: false, message: "This Email Is not registered" });
        }
        
        if (user.password === password) {
            req.session.currentUser = {
                _id: user._id,
                isAdmin: user.isAdmin,
                role: user.role
            };
            req.session.userId = user._id; // Set user session ID
            req.session.isAdmin = user.isAdmin; // Set isAdmin in session
            req.session.role = user.role; // Set user role in session
            return res.json({ loginSuccess: true, isVerified: user.verified, isAdmin: user.isAdmin, role: user.role });
        } else {
            return res.json({ loginSuccess: false, message: "Login failed. Please check your credentials." });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({"Error": "Internal server error"});
    }
});



router.get('/profile', async function (req, res, next) {
    console.log("Profile route accessed.");
    
    // Retrieve the user ID from the session
    const userId = req.session.userId;
    console.log("User ID:", userId); // Log user ID
    
    // Check if the user is authenticated (logged in)
    if (!userId) {
        console.log("User not authenticated. Redirecting to login page.");
        // If not authenticated, redirect to the login page
        return res.redirect('/login');
    }
    
    try {
        // If authenticated, find the user in the database
        const user = await User.findOne({ _id: userId });

        if (!user) {
            // If user not found, redirect to the login page
            console.log("User not found. Redirecting to login page.");
            return res.redirect('/login');
        }

        // If user found, render the profile page with user data
        console.log("User found:", user);
        return res.render('profile.ejs', { username: user.username, email: user.email });
    } catch (error) {
        // Handle any errors
        console.error("Error finding user:", error);
        return res.status(500).send({"Success": "Internal server error"});
    }
});

router.post('/logout', function(req, res, next) {
    // Destroy the session to logout the user
    req.session.destroy(function(err) {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Error logging out');
        }
        // Redirect the user to the login page after logout
        return res.redirect('/login');
        console.log('User logged out');
    });
});



// FORGOT PASSWORD THINGIES


const JWT_SECRET = process.env.JWT_SECRET;

router.get('/forgot-password', (req, res, next) => {
    res.render('forgot-password.ejs')
  });

  
router.post('/forgot-password', async (req, res, next) => {
    const {email} = req.body;
    // check if the user exists in the database
    const user = await User.findOne({ email: email });
    if (!user) {
        res.send("This email is not registered.");
        return;
    }

    // User exists, now create a one-time link valid for 15 minutes
    const secret = JWT_SECRET + user.password;
    const payload = {
        email: user.email,
        id: user._id
    };
   
    const token = jwt.sign(payload, secret, {expiresIn: '15m'});
    const link = `http://localhost:3400/reset-password/${user._id}/${token}`;

    // Setup email transport and send the email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'mahmoab13@ac.sce.ac.il', // Replace with your email
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: await oAuth2Client.getAccessToken() // Assuming oAuth2Client is configured
        }
    });

    const mailOptions = {
        from: 'mahmoab13@ac.sce.ac.il', // Replace with your email
        to: user.email,
        subject: 'Password Reset Link',
        text: `You requested a password reset. Please use the following link to reset your password: ${link}`,
        html: `<p>You requested a password reset. Please use the following link to reset your password: <a href="${link}">${link}</a></p>`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            res.send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('The reset link has been sent to your email.');
        }
    });
});


router.get('/reset-password/:id/:token', async (req, res, next) => {
    const { id, token } = req.params;
    
    try {
        // Attempt to find the user by ID
        const user = await User.findById(id);
        if (!user) {
            res.send("Invalid ID");
            return;
        }
        
        const secret = JWT_SECRET + user.password;
        // Verify the token
        const payload = jwt.verify(token, secret);
        // Render some page or return some data
        res.render('reset-password.ejs', {
            email: 'the email address',
            id: req.params.id,
            token: req.params.token
        });
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }
});


router.post('/reset-password/:id/:token', async (req, res, next) => {
    const { id, token } = req.params;
    const { password, password2 } = req.body;

    if (password !== password2) {
        return res.send("Passwords do not match");
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.send("Invalid ID");
        }

        console.log("User found:", user.email); // Debugging

        const secret = JWT_SECRET + user.password;
        const payload = jwt.verify(token, secret);

        console.log("Payload verified for user:", payload.email); // Debugging

        user.password = password;
        await user.save();


        console.log("Password updated in database for user:", user.email); // Debugging

        return res.send("Password reset successful");
    } catch (error) {
        console.error("Error during password reset:", error);
        return res.send("Failed to reset password due to an error.");
    }
});




// FILE UPLOADING SYSTEM <3
  router.get('/upload-docs', (req, res, next) => {
    // Ensure the user is logged in
    res.render('upload-docs', { userId: req.session.userId });

});



router.post('/submit-docs', upload.single('document'), async (req, res) => {
    const { mimetype, originalname } = req.file;
    const userId = req.session.userId; // Assuming you store the logged-in user's ID in the session

    // Create a new file document
    const newFile = new File({
        userId: userId,
        filename: originalname,
        contentType: mimetype,
        fileData: req.file.buffer // Directly use buffer from memory storage
    });

    // Save the file document to MongoDB
    try {
        await newFile.save();
        res.send("File uploaded successfully.");
    } catch (error) {
        console.error("Error saving file to database:", error);
        res.status(500).send("Error uploading file.");
    }
});









//ADMIN PANEL 


router.get('/admin-panel', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }

    try {
        const user = await User.findById(req.session.userId);
        if (user && user.isAdmin) {
            res.render('admin-panel', { 
                username: user.username, // Ensure this matches your user model
                email: user.email // And any other variables your template needs
            });
        } else {
            // If not admin, redirect to a different page or show an error
            res.redirect('/profile');
        }
    } catch (error) {
        console.error("Error loading admin panel:", error);
        res.status(500).send("Internal server error");
    }
});


router.get('/admin/users', async (req, res) => {


        if (!req.session.isAdmin) {
          return res.status(403).send('Access denied');
        }
        const users = await User.find();
        res.render('admin-users', { users });
      });







//DELETE USER IN MANAGE USERS - ADMIN PANEL 

router.get('/admin/delete-user/:userId', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(403).send('Access denied. You must be an admin to delete users.');
    }

    try {
        await User.findByIdAndDelete(req.params.userId);
        res.redirect('/admin/users'); // Redirect back to the admin users list page
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Failed to delete user due to an internal error.");
    }
});



router.get('/admin/edit-user/:id', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(403).send('Access denied');
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('edit-user', { user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send("Internal server error");
    }
});


router.post('/admin/update-user/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, role , isVerified} = req.body;
    if (!req.session.isAdmin) {
        return res.status(403).send('Access denied');
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            email: req.body.email,
            username: req.body.username,
            role: req.body.role,
            isVerified: req.body.isVerified,
        }, { new: true });
        console.log(req.body); // This should show the role being submitted

        // Redirect back to the users list or to a success page
        res.redirect('/admin/users');
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Internal server error");
    }
});





// Viewing Files of the user - ADMIN PANEL 

router.get('/admin/view-files/:userId', async (req, res) => {
    if (!req.session.isAdmin) {
      return res.status(403).send('Access Denied');
    }
  
    try {
      const userId = req.params.userId;
      const files = await File.find({ userId: userId }); // Assuming File is your file model
  
      res.render('admin-view-files', { files }); // Render a new template with the files
    } catch (error) {
      console.error("Error fetching user's files:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  





router.get('/files/download/:fileId', async (req, res) => {
    try {
      const fileId = req.params.fileId;
      const file = await File.findById(fileId); // Assuming File is your file model
  
      if (!file) {
        return res.status(404).send('File not found');
      }

  
      // Set the headers to indicate a file download
      res.setHeader('Content-Disposition', 'attachment; filename=' + file.filename);
      res.setHeader('Content-Type', file.contentType);
  
      // Send the file data as the response
      res.send(file.fileData);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  




//Main page 

router.get('/main', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });

    // Construct currentUser object based on session data
    const currentUser = {
        _id: req.session.userId,
        isAdmin: req.session.isAdmin,
        role: req.session.role
    };

    res.render('main-page', { posts, currentUser });
});






router.post('/submit-post', upload.single('postImage'), async (req, res) => {
    const { postContent } = req.body; // Text content
    // Assuming you have the user's id stored in the session
    const userId = req.session.userId;

    try {
        let postImage;
        if (req.file) {
            // Create a new PostImage document with the image from the request
            postImage = new PostImage({
                img: req.file.buffer,
                contentType: req.file.mimetype
            });
            await postImage.save();
        }

        // Create a new post instance, including reference to the image if uploaded
        const newPost = new Post({
            content: postContent,
            userId: userId,
            // Store the image document's ID as a reference in the post
            image: postImage ? postImage._id : null
        });

        await newPost.save();
        res.redirect('/main'); // Adjust as necessary
    } catch (error) {
        console.error("Failed to submit post:", error);
        res.status(500).send("Error submitting post.");
    }
});



// Example of a route to delete a post
router.post('/delete-post/:postId', async (req, res) => {
    const { postId } = req.params;
    const currentUser = req.session.currentUser; // Ensure this matches your session setup

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send("Post not found");
        }

        // Check if the current user is allowed to delete the post
        if (currentUser.isAdmin || post.userId.toString() === currentUser._id.toString()) {
            // If there's an image associated with the post, delete it
            if (post.image) {
                await PostImage.findByIdAndRemove(post.image);
            }
            // Now delete the post
            await Post.findByIdAndRemove(postId);
            res.redirect('/main');
        } else {
            res.status(401).send("Unauthorized");
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).send("An error occurred");
    }
});


router.get('/post-image/:id', async (req, res) => {
    try {
        const image = await PostImage.findById(req.params.id);
        if (!image) {
            return res.status(404).send('Image not found');
        }
        res.set('Content-Type', image.contentType);
        res.send(image.img);
    } catch (error) {
        console.error("Error serving image:", error);
        res.status(500).send("Error serving image");
    }
});





router.get('/chat', async (req, res) => {
    if (!req.session.userId) {
        console.log('Redirecting to login: No userId in session');
        return res.redirect('/login'); // Redirect to login if not logged in
    }

    try {
        // Assuming you have a User model and the user's ID is stored in req.session.userId when they log in
        const user = await User.findById(req.session.userId);

        if (!user) {
            console.log('Redirecting to login: User not found');
            return res.redirect('/login'); // Redirect to login if user not found
        }

        if (!user.isVerified) {
            console.log('User not verified');
            // Redirect to a verification notice page or send back a verification message
            return res.send("Your account is not verified. Please verify your account.");
        }

        console.log('Rendering chat');
        // Pass the username to the chat template
        res.render('chat', { username: user.username }); // Render the chat page for verified users with the username
    } catch (error) {
        console.error("Error accessing chat page:", error);
        res.status(500).send("Internal server error while accessing chat page.");
    }
});







module.exports = router;
