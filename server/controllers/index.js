var bcrypt = require('bcryptjs'),
  rp = require('request-promise');

const userModel = require('../../models/users.model');
const Circle = require('../../models/circles.model');
const User_Circles = require('../../models/user_circle.model');
const Vote = require('../../models/votes.model');
const Poll = require('../../models/polls.model');

var signup = {
  get: function(req, res){
      res.render('/signup');
  },
  post: function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    console.log('firstname')
    console.log(password, username)

    if(!username || !password) {
      console.log('WHY GOD WHY')
      req.flash('error', 'Please fill out all fields');
      res.redirect('signup');
    }
    

    var salt = bcrypt.genSaltSync(10);
    var hashedPassword = bcrypt.hashSync(password, salt);

    var newUser = {
      username: username,
      salt: salt,
      password: hashedPassword,
      firstname: firstname,
      lastname: lastname,
      email: email
    };

    userModel.create(newUser).then( () => {
      console.log('user created');
      res.redirect('/');
    }).catch( (err) => {
      req.flash('error', 'Please choose a different username');
      res.redirect('/signup');
    });
  }
};

var poll = {
  post: function(req, res){
    var circleName = req.body.circle;
    var suggestedUser = req.body.suggestedUser;
    var suggestor = req.body.suggestor;
    var circleId;
    var suggestedUserId;
    var suggestorId;
    var maxVotes;
    var userIds = [];
    var pollId;
    userModel.findOne({
      where:{
        username: suggestedUser
      }
    }).then((data) => {
      suggestedUserId = data.dataValues.id
    }).then(()=>{
      Circle.findOne({
        where: {
          name: circleName
        }
      }).then((data) => {
        circleId = data.dataValues.id;
        User_Circles.findOne({
          where: {
            userId: suggestedUserId,
            circleId: data.dataValues.id
          }
        }).then((data) => {
          if(data.dataValues.status === 'blacklist'){
            res.send({
              blacklist: true
            })
          } else if(data.dataValues.status === 'member'){
            res.send({
              member: true
            })
          } else {
            Circle.findOne({
              where: {
                circleId: circleId
              }
            }).then((data) =>{
              maxVotes = data.dataValues.totalMembers;
              userModel.findOne({
                where: {
                  username: suggestor
                }
              }).then((data) => {
                suggestorId = data.dataValues.id;
              }).then(() => {
                Poll.findOne({
                  where:{
                    circleId: circleId,
                    status: 'incomplete'
                  }
                }).then((data) => {
                  if(data === null){
                      var newPoll = {
                      maxVotes: maxVotes,
                      suggestorId: suggestorId,
                      circleId: circleId,
                      suggestedMemberId: suggestedUserId
                    }
                    Poll.create(newPoll).then((data) => {
                      pollId = data.dataValues.id;
                      User_Circles.findAll({
                        where: {
                          circleId: circleId
                        }
                      }).then((data) =>{
                        console.log('what is the pollId', pollId)
                        data.forEach(function(instance){
                          var newVote = {
                            userId: instance.dataValues.userId,
                            pollId: pollId
                          }
                          Vote.create(newVote).then((data) => {
                            console.log('vote was successfully created', data)
                          })
                        })
                      })
                    }).catch( (error) => {
                      console.log(error)
                    })
                  } else {
                    res.send({
                      pollInProgress: true
                    })
                  }
                })
              })
            })
          }
        })
      })
    })
  }
}

var vote= {
  get: function(req, res){
    var userId = req.user.dataValues.id;
    var pollId;
    var voteId;
    var suggestedMemberId;
    var suggestedMemberName;
    var suggestorId;
    var suggestorName;
    var circleId;
    var circleName;
    Vote.findOne({
      where:{
        userId: userId,
        complete: false
      }
    }).then((data)=>{
      if(data !== null){
        pollId = data.dataValues.pollId;
        voteId = data.dataValues.id;
        Poll.findOne({
          where:{
            id: data.dataValues.pollId
          }
        }).then((data) => {
          circleId = data.dataValues.circleId
          suggestedMemberId = data.dataValues.suggestedMemberId
          suggestorId = data.dataValues.suggestorId
          Circle.findOne({
            where:{
              id: data.dataValues.circleId
            }
          }).then((data) => {
            circleName = data.dataValues.name
            userModel.findOne({
              where:{
                id: suggestedMemberId
              }
            }).then((data) => {
              suggestedMemberName = data.dataValues.username
              userModel.findOne({
                where: {
                  id: suggestorId
                }
              }).then((data) => {
                suggestorName = data.dataValues.username
                res.send({suggestor: data.dataValues.username,
                suggestedMember: suggestedMemberName,
                circle: circleName,
                voteId: voteId,
                pollId: pollId})
              })
            })
          })
        })
      } else {
        res.send({
          noVotes: true
        })
      }
    })
  },
  post: function(req, res){
    var circleId;
    var suggestedMemberId;
    var suggestedMemberEmail;
    Vote.findOne({
      where:{
        id: req.body.voteId
      }
    }).then((data) =>{
      data.updateAttributes({
        complete: req.body.complete,
        choice: req.body.choice
      }).then(() => {
        Poll.findOne({
          where:{
            id: req.body.pollId
          }
        }).then((data)=>{
          circleId = data.dataValues.circleId
          suggestedMemberId = data.dataValues.suggestedMemberId
          if(req.body.choice === 'accept'){
            data.updateAttributes({
              votesIn: (data.dataValues.votesIn + 1),
              votesFor: (data.dataValues.votesFor + 1)
            }).then((data)=>{
              console.log(data, 'what happens to poll if i accept')
              if(data.dataValues.votesIn === data.dataValues.maxVotes){
                data.updateAttributes({
                  status: 'complete'
                }).then((data) => {
                  if(Math.floor(data.dataValues.maxVotes*0.7) <= data.dataValues.votesFor){
                    data.updateAttributes({
                      result: 'accepted'
                    }).then((data) =>{
                      User_Circles.create({
                        userId: suggestedMemberId,
                        circleId: circleId,
                        status: 'pending'
                      }).then((data)=>{
                        userModel.findOne({
                          where:{
                            id: suggestedMemberId
                          }
                        }).then((data) => {
                          suggestedMemberEmail = data.dataValues.email
                          console.log('new user accepted', data.dataValues)
                          res.send('new user accepted')
                        })
                      })
                    })
                  } else {
                    data.updateAttributes({
                      result: 'denied'
                    }).then((data) => {
                      User_Circles.create({
                        userId: suggestedMemberId,
                        circleId: circleId,
                        status: 'blacklist'
                      }).then((data)=>{
                        console.log('new user denied', data.dataValues)
                        res.send('new user denied')
                      })
                    })                    
                  }
                })                
              } else {
                console.log('poll is still incomplete')
                res.send('poll is still incomplete')
              }
            })
          } else {
            data.updateAttributes({
              votesIn: (data.dataValues.votesIn + 1)
            }).then((data) =>{
              console.log(data, 'what happens to poll if i deny')
              if(data.dataValues.votesIn === data.dataValues.maxVotes){
                data.updateAttributes({
                  status: 'complete'
                }).then((data) => {
                  if(Math.floor(data.dataValues.maxVotes*0.7) <= data.dataValues.votesFor){
                    data.updateAttributes({
                      result: 'accepted'
                    }).then((data) =>{
                      User_Circles.create({
                        userId: suggestedMemberId,
                        circleId: circleId,
                        status: 'pending'
                      }).then((data)=>{
                        userModel.findOne({
                          where:{
                            id: suggestedMemberId
                          }
                        }).then((data) => {
                          suggestedMemberEmail = data.dataValues.email
                          console.log('new user accepted', data.dataValues)
                          res.send('new user accepted')
                        })
                      })
                    })
                  } else {
                    data.updateAttributes({
                      result: 'denied'
                    }).then((data) => {
                      User_Circles.create({
                        userId: suggestedMemberId,
                        circleId: circleId,
                        status: 'blacklist'
                      }).then((data)=>{
                        console.log('new user denied', data.dataValues)
                        res.send('new user denied')
                      })
                    })                    
                  }
                })  
              } else {
                console.log('poll is still incomplete')
                res.send('poll is still incomplete')
              }
            })
          }
        })
      })
    })
  }
}

var result = {
  get: function(req, res){
    var userId = req.user.dataValues.id;
    var circleId;
    var circleName;
    User_Circles.findOne({
      where:{
        userId: req.user.dataValues.id,
        status: 'pending'
      }
    }).then((data) => {
      if(data !== null){
        circleId = data.dataValues.circleId
        Circle.findOne({
          where:{
            id: data.dataValues.circleId
          }
        }).then((data) =>{
          circleName = data.dataValues.name
          res.send({
            circleName: data.dataValues.name,
            circleId: circleId,
            userId: userId
          })
        })
      } else {
        res.send({
          noInvites: true
        })
      }
    })
  },
  post: function(req, res){
    if(req.body.choice === 'accept'){
      User_Circles.findOne({
        where:{
          userId: req.body.userId,
          circleId: req.body.circleId
        }
      }).then((data)=>{
        data.updateAttributes({
          status: 'member'
        })
      })
    } else {
      User_Circles.findOne({
        where: {
          userId: req.body.userId,
          circleId:req.body.circleId
        }
      }).then((data)=>{
        return data.destroy()
      })
    }
  }
}
module.exports = {
  signup: signup,
  poll: poll,
  vote: vote,
  result: result
};